"""
Integration tests for availability routes.

Requires a running Postgres instance configured in backend/.env.test.
Run with: cd backend && pytest tests/integration/test_availability_routes.py -v
"""
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

from main import app

pytestmark = pytest.mark.integration

TEST_EMAIL = "pytest_avail_user@example.com"
TEST_ORG = "Pytest Availability Org"
TEST_PASSWORD = "TestPassword123!"
TEST_NAME = "Pytest Availability User"

REGISTER_PAYLOAD = {
    "org_name": TEST_ORG,
    "name": TEST_NAME,
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
}

_state: dict = {}
AUTH_HEADERS: dict = {}


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def make_rule_payload(name="Test Rule", **overrides) -> dict:
  base = {
      "name": name,
      "prevents_booking": True,
      "iana_timezone": "Europe/London",
  }
  base.update(overrides)
  return base


def _delete_test_data():
  """Remove test records from the DB, respecting FK order."""
  from src.db.session import DB_URL, yield_session
  from src.models.user_model import UserModel
  from src.models.organisation_model import OrganisationModel
  from src.models.organisation_user_model import OrganisationUserModel
  from src.models.availability_rule_model import AvailabilityRuleModel

  with yield_session(DB_URL) as session:
    user = session.query(UserModel).filter_by(email=TEST_EMAIL).first()
    org = session.query(OrganisationModel).filter_by(name=TEST_ORG).first()

    if user:
      session.query(AvailabilityRuleModel).filter_by(user_id=user.id).delete()
      session.query(OrganisationUserModel).filter_by(user_id=user.id).delete()
      session.delete(user)
    if org:
      session.query(OrganisationUserModel).filter_by(org_id=org.id).delete()
      session.delete(org)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture(scope="module")
def http_client():
  return TestClient(app)


@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data():
  _delete_test_data()
  yield
  _delete_test_data()


@pytest.fixture(scope="module", autouse=True)
def setup_user(http_client):
  """Register and log in the test user; store auth token in AUTH_HEADERS."""
  regresp = http_client.post("/auth/register", json=REGISTER_PAYLOAD)
  resp = http_client.post("/auth/login", json={
      "email": TEST_EMAIL,
      "password": TEST_PASSWORD,
      "name": None,
  })
  assert resp.status_code == 200, f"Login failed: {resp.text}"
  token = resp.json()["access_token"]
  AUTH_HEADERS["Authorization"] = f"Bearer {token}"


# ---------------------------------------------------------------------------
# GET /availability/
# ---------------------------------------------------------------------------

def test_get_rules_no_auth(http_client):
  resp = http_client.get("/availability/")
  assert resp.status_code == 422


def test_get_rules_initially_empty(http_client):
  resp = http_client.get("/availability/", headers=AUTH_HEADERS)
  assert resp.status_code == 200
  x = resp.json()
  assert resp.json() == []


# ---------------------------------------------------------------------------
# POST /availability/
# ---------------------------------------------------------------------------

def test_create_rule_no_auth(http_client):
  resp = http_client.post("/availability/", json=make_rule_payload())
  assert resp.status_code == 422


def test_create_rule_success(http_client):
  resp = http_client.post("/availability/", headers=AUTH_HEADERS, json=make_rule_payload())
  assert resp.status_code == 201
  body = resp.json()
  assert "uuid" in body
  assert "name" in body
  _state["rule_uuid"] = body["uuid"]


def test_create_rule_invalid_weekday(http_client):
  payload = make_rule_payload(weekdays=[7])
  resp = http_client.post("/availability/", headers=AUTH_HEADERS, json=payload)
  assert resp.status_code == 422


def test_create_rule_end_time_before_start_time(http_client):
  payload = make_rule_payload(start_time="14:00:00", end_time="10:00:00")
  resp = http_client.post("/availability/", headers=AUTH_HEADERS, json=payload)
  assert resp.status_code == 422


# ---------------------------------------------------------------------------
# GET /availability/ — after create
# ---------------------------------------------------------------------------

def test_get_rules_returns_created(http_client):
  resp = http_client.get("/availability/", headers=AUTH_HEADERS)
  assert resp.status_code == 200
  body = resp.json()
  assert len(body) > 0


# ---------------------------------------------------------------------------
# PUT /availability/{uuid}
# ---------------------------------------------------------------------------

def test_update_rule_no_auth(http_client):
  uuid = _state.get("rule_uuid", "00000000-0000-0000-0000-000000000000")
  resp = http_client.put(f"/availability/{uuid}", json=make_rule_payload("Updated"))
  assert resp.status_code == 422


def test_update_rule_success(http_client):
  uuid = _state["rule_uuid"]
  payload = {
      "name": "Updated Rule Name",
      "prevents_booking": False,
  }
  resp = http_client.put(f"/availability/{uuid}", headers=AUTH_HEADERS, json=payload)
  assert resp.status_code == 200
  assert resp.json()["name"] == "Updated Rule Name"


# ---------------------------------------------------------------------------
# DELETE /availability/{uuid}
# ---------------------------------------------------------------------------

def test_delete_rule_no_auth(http_client):
  uuid = _state.get("rule_uuid", "00000000-0000-0000-0000-000000000000")
  resp = http_client.delete(f"/availability/{uuid}")
  assert resp.status_code == 422


def test_delete_rule_success(http_client):
  uuid = _state["rule_uuid"]
  resp = http_client.delete(f"/availability/{uuid}", headers=AUTH_HEADERS)
  assert resp.status_code == 200
  assert resp.json() is not None
