"""
Integration tests for auth routes.

Requires a running Postgres instance configured in backend/.env.test.
Run with: cd backend && pytest tests/integration -v
"""
import pytest
from fastapi.testclient import TestClient

from main import app

pytestmark = pytest.mark.integration

TEST_EMAIL = "pytest_auth_user_unique@example.com"
TEST_ORG = "Pytest Auth Org Unique"
TEST_PASSWORD = "TestPassword123!"
TEST_NAME = "Pytest Auth User"

REGISTER_PAYLOAD = {
    "org_name": TEST_ORG,
    "name": TEST_NAME,
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
}


def _delete_test_data():
  """Remove test records from the DB, handling FK order."""
  from src.db.session import DB_URL, yield_session
  from src.models.user_model import UserModel
  from src.models.organisation_model import OrganisationModel
  from src.models.organisation_user_model import OrganisationUserModel

  with yield_session(DB_URL) as session:
    user = session.query(UserModel).filter_by(email=TEST_EMAIL).first()
    org = session.query(OrganisationModel).filter_by(name=TEST_ORG).first()

    # Delete junction rows first to satisfy FK constraints
    if user:
      session.query(OrganisationUserModel).filter_by(
          user_id=user.id).delete()
    if org:
      session.query(OrganisationUserModel).filter_by(
          org_id=org.id).delete()

    if user:
      session.delete(user)
    if org:
      session.delete(org)


@pytest.fixture(scope="module", autouse=True)
def cleanup_test_data():
  """Wipe test records before the module runs and again after."""
  _delete_test_data()
  yield
  _delete_test_data()


@pytest.fixture(scope="module")
def http_client():
  return TestClient(app)


# ---------------------------------------------------------------------------
# Registration tests
# ---------------------------------------------------------------------------

def test_register_success(http_client):
  resp = http_client.post("/auth/register", json=REGISTER_PAYLOAD)
  assert resp.status_code == 201


def test_register_duplicate_email(http_client):
  payload = {**REGISTER_PAYLOAD,
             "organisation_name": "A Completely Different Org"}
  resp = http_client.post("/auth/register", json=payload)
  assert resp.status_code == 403


def test_register_duplicate_org(http_client):
  payload = {**REGISTER_PAYLOAD, "email": "different_pytest@example.com"}
  resp = http_client.post("/auth/register", json=payload)
  assert resp.status_code == 403


# ---------------------------------------------------------------------------
# Login tests
# ---------------------------------------------------------------------------

def test_login_success(http_client):
  payload = {"email": TEST_EMAIL, "password": TEST_PASSWORD, "name": None}
  resp = http_client.post("/auth/login", json=payload)
  assert resp.status_code == 200
  body = resp.json()
  assert "access_token" in body


def test_login_wrong_password(http_client):
  payload = {"email": TEST_EMAIL, "password": "wrongpassword", "name": None}
  resp = http_client.post("/auth/login", json=payload)
  assert resp.status_code == 401


def test_login_unknown_user(http_client):
  payload = {"email": "nobody_pytest_unique@example.com",
             "password": TEST_PASSWORD, "name": None}
  resp = http_client.post("/auth/login", json=payload)
  assert resp.status_code == 401


# ---------------------------------------------------------------------------
# Account-update tests
# ---------------------------------------------------------------------------

def test_update_account_no_auth(http_client):
  resp = http_client.put("/auth/account", json={"name": "New Name"})
  assert resp.status_code == 422


def test_update_account_success(http_client):
  # Log in fresh to get a real token
  login_resp = http_client.post("/auth/login", json={
      "email": TEST_EMAIL,
      "password": TEST_PASSWORD,
      "name": None,
  })
  assert login_resp.status_code == 200
  token = login_resp.json()["access_token"]
  headers = {"Authorization": f"Bearer {token}"}

  resp = http_client.put("/auth/account", headers=headers, json={"name": TEST_NAME})
  assert resp.status_code == 200
  body = resp.json()
  assert "name" in body
  assert "email" in body
  assert "updated_at" in body
