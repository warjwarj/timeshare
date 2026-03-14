"""
Integration tests for events routes.

Requires a running Postgres instance configured in backend/.env.test.
Run with: cd backend && pytest tests/integration/test_events_routes.py -v
"""
import pytest
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient

from main import app

pytestmark = pytest.mark.integration

TEST_EMAIL = "pytest_events_user@example.com"
TEST_ORG = "Pytest Events Org"
TEST_PASSWORD = "TestPassword123!"
TEST_NAME = "Pytest Events User"

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

def make_event_payload(name="Test Event", offset_hours=1) -> dict:
  now = datetime.now(timezone.utc)
  return {
      "name": name,
      "colour": "#4A90E2",
      "iana_timezone": "Europe/London",
      "start": (now + timedelta(hours=offset_hours)).isoformat(),
      "end": (now + timedelta(hours=offset_hours + 1)).isoformat(),
  }


def _delete_test_data():
  """Remove test records from the DB, respecting FK order."""
  from src.db.session import DB_URL, yield_session
  from src.models.user_model import UserModel
  from src.models.organisation_model import OrganisationModel
  from src.models.organisation_user_model import OrganisationUserModel
  from src.models.user_event_model import UserEventModel
  from src.models.organisation_event_model import OrganisationEventModel
  from src.models.event_model import EventModel

  with yield_session(DB_URL) as session:
    user = session.query(UserModel).filter_by(email=TEST_EMAIL).first()
    org = session.query(OrganisationModel).filter_by(name=TEST_ORG).first()

    if user:
      # Collect event IDs linked to this user
      user_events = session.query(UserEventModel).filter_by(user_id=user.id).all()
      event_ids = [ue.event_id for ue in user_events]

      # Delete junction rows
      session.query(UserEventModel).filter_by(user_id=user.id).delete()
      for event_id in event_ids:
        session.query(OrganisationEventModel).filter_by(event_id=event_id).delete()
      for event_id in event_ids:
        session.query(EventModel).filter_by(id=event_id).delete()

    if org:
      session.query(OrganisationUserModel).filter_by(org_id=org.id).delete()
    if user:
      session.query(OrganisationUserModel).filter_by(user_id=user.id).delete()
      session.delete(user)
    if org:
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
  http_client.post("/auth/register", json=REGISTER_PAYLOAD)
  resp = http_client.post("/auth/login", json={
      "email": TEST_EMAIL,
      "password": TEST_PASSWORD,
      "name": None,
  })
  assert resp.status_code == 200, f"Login failed: {resp.text}"
  token = resp.json()["access_token"]
  AUTH_HEADERS["Authorization"] = f"Bearer {token}"


# ---------------------------------------------------------------------------
# GET /events/
# ---------------------------------------------------------------------------

def test_get_events_no_auth(http_client):
  resp = http_client.get("/events/")
  assert resp.status_code == 422


def test_get_events_missing_query_params(http_client):
  resp = http_client.get("/events/", headers=AUTH_HEADERS)
  assert resp.status_code == 422


def test_get_events_initially_empty(http_client):
  now = datetime.now(timezone.utc)
  params = {
      "start": now.isoformat(),
      "end": (now + timedelta(days=7)).isoformat(),
  }
  resp = http_client.get("/events/", headers=AUTH_HEADERS, params=params)
  assert resp.status_code == 200
  assert resp.json() == []


# ---------------------------------------------------------------------------
# POST /events/
# ---------------------------------------------------------------------------

def test_create_event_no_auth(http_client):
  resp = http_client.post("/events/", json=make_event_payload())
  assert resp.status_code == 422


def test_create_event_success(http_client):
  resp = http_client.post("/events/", headers=AUTH_HEADERS, json=make_event_payload())
  assert resp.status_code == 201
  body = resp.json()
  assert "uuid" in body
  assert "name" in body
  _state["event_uuid"] = body["uuid"]


def test_create_event_invalid_colour(http_client):
  payload = make_event_payload()
  payload["colour"] = "red"
  resp = http_client.post("/events/", headers=AUTH_HEADERS, json=payload)
  assert resp.status_code == 422


def test_create_event_end_before_start(http_client):
  now = datetime.now(timezone.utc)
  payload = {
      "name": "Bad Event",
      "colour": "#4A90E2",
      "iana_timezone": "Europe/London",
      "start": (now + timedelta(hours=2)).isoformat(),
      "end": (now + timedelta(hours=1)).isoformat(),
  }
  resp = http_client.post("/events/", headers=AUTH_HEADERS, json=payload)
  assert resp.status_code == 422


# ---------------------------------------------------------------------------
# GET /events/ — after create
# ---------------------------------------------------------------------------

def test_get_events_returns_ok(http_client):
  now = datetime.now(timezone.utc)
  params = {
      "start": (now - timedelta(hours=1)).isoformat(),
      "end": (now + timedelta(hours=4)).isoformat(),
  }
  resp = http_client.get("/events/", headers=AUTH_HEADERS, params=params)
  assert resp.status_code == 200
  assert len(resp.json()) > 0


def test_get_events_datetime_filters(http_client):
  """Test get events with datetime filter"""
  now = datetime.now(timezone.utc)
  # should return no events
  params1 = {
      "start": (now - timedelta(weeks=4)).isoformat(),
      "end": (now - timedelta(weeks=3)).isoformat(),
  }
  resp = http_client.get("/events/", headers=AUTH_HEADERS, params=params1)
  assert resp.status_code == 200
  assert len(resp.json()) == 0
  # should return 1 event
  params2 = {
      "start": (now - timedelta(hours=1)).isoformat(),
      "end": (now + timedelta(hours=1)).isoformat(),
  }
  resp = http_client.get("/events/", headers=AUTH_HEADERS, params=params2)
  assert resp.status_code == 200
  assert len(resp.json()) > 0


# ---------------------------------------------------------------------------
# PUT /events/{uuid}
# ---------------------------------------------------------------------------

def test_update_event_no_auth(http_client):
  uuid = _state.get("event_uuid", "00000000-0000-0000-0000-000000000000")
  now = datetime.now(timezone.utc)
  payload = {
      "name": "Updated",
      "colour": "#4A90E2",
      "start": now.isoformat(),
      "end": (now + timedelta(hours=1)).isoformat(),
  }
  resp = http_client.put(f"/events/{uuid}", json=payload)
  assert resp.status_code == 422


def test_update_event_success(http_client):
  uuid = _state["event_uuid"]
  now = datetime.now(timezone.utc)
  payload = {
      "name": "Updated Event Name",
      "colour": "#FF5733",
      "start": (now + timedelta(hours=1)).isoformat(),
      "end": (now + timedelta(hours=2)).isoformat(),
  }
  resp = http_client.put(f"/events/{uuid}", headers=AUTH_HEADERS, json=payload)
  assert resp.status_code == 200
  res = resp.json()
  assert resp.json()["name"] == "Updated Event Name"


# ---------------------------------------------------------------------------
# DELETE /events/{uuid}
# ---------------------------------------------------------------------------

def test_delete_event_no_auth(http_client):
  uuid = _state.get("event_uuid", "00000000-0000-0000-0000-000000000000")
  resp = http_client.delete(f"/events/{uuid}")
  assert resp.status_code == 422


def test_delete_event_success(http_client):
  uuid = _state["event_uuid"]
  resp = http_client.delete(f"/events/{uuid}", headers=AUTH_HEADERS)
  assert resp.status_code == 200
  asd = resp.json()
  assert resp.json() is not None
