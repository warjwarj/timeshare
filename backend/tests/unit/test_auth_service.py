"""
Unit tests for auth_service.py.

All repository interactions are mocked — no database required.
Run with: cd backend && pytest tests/unit -v
"""
import pytest
from datetime import datetime
from http import HTTPStatus
from fastapi import HTTPException

from src.services.auth_service import (
    hash_password,
    verify_password,
    create_token,
    login_user,
    register_orguser,
    update_user_account,
)
from src.schemas.requests.auth_requests import LoginRequest, RegisterRequest, UpdateAccountRequest
from src.schemas.responses.auth_responses import LoginResponse, UpdateAccountResponse
from src.utils.organisation_user_role import OrganisationUserRole

pytestmark = pytest.mark.unit


# ---------------------------------------------
# hash password
# ---------------------------------------------


def test_hash_password():
  result = hash_password("mysecretpassword")
  assert result
  assert result != "mysecretpassword"


def test_verify_password_correct():
  hashed = hash_password("mysecretpassword")
  # should not raise
  verify_password(hashed, "mysecretpassword")


def test_verify_password_wrong():
  hashed = hash_password("mysecretpassword")
  with pytest.raises(HTTPException) as exc_info:
    verify_password(hashed, "wrongpassword")
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_login_user_not_found(mocker):
  mock_repo = mocker.MagicMock()
  mock_repo.get_record.return_value = None
  mocker.patch("src.services.auth_service.users_repo", mock_repo)

  req = LoginRequest(email="nobody@test.com", password="any", name=None)
  with pytest.raises(HTTPException) as exc_info:
    login_user(req)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


# ---------------------------------------------
# login
# ---------------------------------------------


def test_login_user_success(mocker):
  password = "testpassword123"
  hashed = hash_password(password)

  # mock user repo
  mock_user = mocker.MagicMock()
  mock_user.password = hashed
  mock_user.uuid = "test-uuid-1234"
  mock_user.name = "Test user"
  mock_user.email = "test@test.com"
  mock_users_repo = mocker.MagicMock()
  mock_users_repo.get_record.return_value = mock_user
  mocker.patch("src.services.auth_service.users_repo", mock_users_repo)

  # mock org repo
  mock_org = mocker.MagicMock()
  mock_org.name = "Test org name"
  mock_org.uuid = "test-uuid-2345"
  mock_org_repo = mocker.MagicMock()
  mock_org_repo.get_record.return_value = mock_org
  mocker.patch("src.services.auth_service.orgs_repo", mock_org_repo)

  # mock org user repo
  mock_org_user = mocker.MagicMock()
  mock_org_user.org_id = mock_org.id
  mock_org_user.user_id = mock_user.id
  mock_org_users_repo = mocker.MagicMock()
  mock_org_users_repo.get_record.return_value = mock_org
  mocker.patch("src.services.auth_service.org_users_repo", mock_org_users_repo)

  req = LoginRequest(email=mock_user.email, password=password, name=None)
  result = login_user(req)

  assert isinstance(result, LoginResponse)
  assert result.access_token


# ---------------------------------------------
# register
# ---------------------------------------------


REG_REQ = RegisterRequest(
    org_name="Acme Corp",
    name="Alice",
    email="alice@acme.com",
    password="securepassword123",
)


def _mock_repos(mocker, existing_user=None, existing_org=None, existing_org_user=None, new_org_id=1, new_user_id=1):
  """Patch repositories and return (mock_users_repo, mock_orgs_repo, mock_org_users_repo)."""
  mock_user_repo = mocker.MagicMock()
  mock_user_repo.get_record.return_value = existing_user
  mock_user_repo.add_record.return_value = mocker.MagicMock(id=new_user_id)

  mock_org_repo = mocker.MagicMock()
  mock_org_repo.get_record.return_value = existing_org
  mock_org_repo.add_record.return_value = mocker.MagicMock(id=new_org_id)

  mock_org_users_repo = mocker.MagicMock()
  mock_org_users_repo.get_record.return_value = existing_org_user

  mocker.patch("src.services.auth_service.users_repo", mock_user_repo)
  mocker.patch("src.services.auth_service.orgs_repo", mock_org_repo)
  mocker.patch("src.services.auth_service.org_users_repo", mock_org_users_repo)

  return mock_user_repo, mock_org_repo, mock_org_users_repo


def test_register_orguser_success(mocker):
  """Happy path: creates org and user, returns 201."""
  mock_user_repo, mock_org_repo, mock_org_users_repo = _mock_repos(mocker)

  result = register_orguser(REG_REQ)

  assert result.status_code == HTTPStatus.CREATED
  mock_org_repo.add_record.assert_called_once_with(name="Acme Corp")
  mock_user_repo.add_record.assert_called_once()


def test_register_orguser_email_already_exists(mocker):
  """Raises 403 when the email is already registered."""
  existing_user = mocker.MagicMock()
  _mock_repos(mocker, existing_user=existing_user)

  with pytest.raises(HTTPException) as exc_info:
    register_orguser(REG_REQ)

  assert exc_info.value.status_code == HTTPStatus.FORBIDDEN
  assert "Email" in exc_info.value.detail


def test_register_orguser_org_name_already_exists(mocker):
  """Raises 403 when the organisation name is already registered."""
  existing_org = mocker.MagicMock()
  _mock_repos(mocker, existing_org=existing_org)

  with pytest.raises(HTTPException) as exc_info:
    register_orguser(REG_REQ)

  assert exc_info.value.status_code == HTTPStatus.FORBIDDEN
  assert "Organisation" in exc_info.value.detail


def test_register_orguser_password_is_hashed(mocker):
  """The password stored on the user record is hashed, not plaintext."""
  mock_user_repo, _, _ = _mock_repos(mocker)

  register_orguser(REG_REQ)

  _, kwargs = mock_user_repo.add_record.call_args
  stored_password = kwargs.get("password")
  assert stored_password != REG_REQ.password
  assert stored_password.startswith("$argon2")


def test_register_orguser_user_added_as_org_admin(mocker):
  """The user is registered with the org_admin role."""
  _, _, mock_org_users_repo = _mock_repos(mocker)

  register_orguser(REG_REQ)

  _, kwargs = mock_org_users_repo.add_record.call_args
  assert kwargs.get("role") == OrganisationUserRole.org_admin


def test_register_orguser_user_linked_to_new_org(mocker):
  """The user is linked to the newly created org id."""
  _, _, mock_org_users_repo = _mock_repos(mocker, new_org_id=42)

  register_orguser(REG_REQ)

  _, kwargs = mock_org_users_repo.add_record.call_args
  assert kwargs.get("org_id") == 42


def test_register_orguser_org_name_not_in_user_data(mocker):
  """org_name is not forwarded to the user record."""
  mock_user_repo, _, _ = _mock_repos(mocker)

  register_orguser(REG_REQ)

  _, kwargs = mock_user_repo.add_record.call_args
  assert "org_name" not in kwargs


def test_register_orguser_unexpected_error_raises_500(mocker):
  """Unexpected exceptions from the repo are wrapped in a 500."""
  mock_user_repo = mocker.MagicMock()
  mock_user_repo.get_record.return_value = None

  mock_org_repo = mocker.MagicMock()
  mock_org_repo.get_record.return_value = None
  mock_org_repo.add_record.side_effect = RuntimeError("db is on fire")

  mocker.patch("src.services.auth_service.users_repo", mock_user_repo)
  mocker.patch("src.services.auth_service.orgs_repo", mock_org_repo)

  with pytest.raises(HTTPException) as exc_info:
    register_orguser(REG_REQ)

  assert exc_info.value.status_code == HTTPStatus.INTERNAL_SERVER_ERROR


# ---------------------------------------------
# update
# ---------------------------------------------

FIXED_NOW = datetime(2024, 6, 1, 12, 0, 0)
USER_UUID = "test-uuid-1234"


def _mock_updated_user(mocker, name="Test User", email="test@test.com"):
  """Return a mock DTO matching what update_record would return."""
  user = mocker.MagicMock()
  user.name = name
  user.email = email
  user.updated_at = FIXED_NOW
  return user


def test_update_account_name_only(mocker):
  """Updating only the name skips the email-collision check."""
  mock_repo = mocker.MagicMock()
  mock_repo.update_record.return_value = _mock_updated_user(mocker, name="New Name")
  mocker.patch("src.services.auth_service.users_repo", mock_repo)
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  req = UpdateAccountRequest(name="New Name", email=None)
  result = update_user_account(USER_UUID, req)

  mock_repo.get_record.assert_not_called()
  mock_repo.update_record.assert_called_once()
  assert isinstance(result, UpdateAccountResponse)
  assert result.success is True
  assert result.name == "New Name"


def test_update_account_email_only_no_conflict(mocker):
  """Updating only the email succeeds when no other user owns that email."""
  mock_repo = mocker.MagicMock()
  mock_repo.get_record.return_value = None
  mock_repo.update_record.return_value = _mock_updated_user(mocker, email="new@test.com")
  mocker.patch("src.services.auth_service.users_repo", mock_repo)
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  req = UpdateAccountRequest(name=None, email="new@test.com")
  result = update_user_account(USER_UUID, req)

  mock_repo.get_record.assert_called_once_with(email="new@test.com")
  assert isinstance(result, UpdateAccountResponse)
  assert result.email == "new@test.com"


def test_update_account_both_fields(mocker):
  """Updating both name and email passes both to update_record."""
  mock_repo = mocker.MagicMock()
  mock_repo.get_record.return_value = None
  mock_repo.update_record.return_value = _mock_updated_user(mocker, name="New Name", email="new@test.com")
  mocker.patch("src.services.auth_service.users_repo", mock_repo)
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  req = UpdateAccountRequest(name="New Name", email="new@test.com")
  result = update_user_account(USER_UUID, req)

  _, kwargs = mock_repo.update_record.call_args
  assert kwargs.get("name") == "New Name"
  assert kwargs.get("email") == "new@test.com"
  assert isinstance(result, UpdateAccountResponse)


def test_update_account_email_taken_by_other_user(mocker):
  """Raises 401 when the email is already owned by a different user."""
  other_user = mocker.MagicMock()
  other_user.uuid = "different-uuid-5678"

  mock_repo = mocker.MagicMock()
  mock_repo.get_record.return_value = other_user
  mocker.patch("src.services.auth_service.users_repo", mock_repo)

  req = UpdateAccountRequest(name=None, email="taken@test.com")
  with pytest.raises(HTTPException) as exc_info:
    update_user_account(USER_UUID, req)

  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED
  mock_repo.update_record.assert_not_called()


def test_update_account_email_belongs_to_same_user(mocker):
  """No conflict when the email is already owned by the requesting user."""
  same_user = mocker.MagicMock()
  same_user.uuid = USER_UUID

  mock_repo = mocker.MagicMock()
  mock_repo.get_record.return_value = same_user
  mock_repo.update_record.return_value = _mock_updated_user(mocker, email="same@test.com")
  mocker.patch("src.services.auth_service.users_repo", mock_repo)
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  req = UpdateAccountRequest(name=None, email="same@test.com")
  result = update_user_account(USER_UUID, req)

  assert isinstance(result, UpdateAccountResponse)
  assert result.success is True


def test_update_account_response_shape(mocker):
  """The response contains the correct fields from the updated record."""
  mock_repo = mocker.MagicMock()
  mock_repo.get_record.return_value = None
  mock_repo.update_record.return_value = _mock_updated_user(mocker, name="Alice", email="alice@test.com")
  mocker.patch("src.services.auth_service.users_repo", mock_repo)
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  req = UpdateAccountRequest(name="Alice", email="alice@test.com")
  result = update_user_account(USER_UUID, req)

  assert result.success is True
  assert result.name == "Alice"
  assert result.email == "alice@test.com"
  assert result.updated_at == str(FIXED_NOW)
