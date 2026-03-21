"""
Unit tests for auth_service.py.

All repository interactions are mocked — no database required.
Run with: cd backend && pytest tests/unit -v
"""
import base64
import json
import random
import string

from jwt import InvalidTokenError
import pytest
from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from fastapi import HTTPException

from src.services.auth_service import (
    decode_token,
    encode_token,
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

FIXED_NOW = datetime(2024, 6, 1, 12, 0, 0, 0, timezone.utc)


def _mock_entities(mocker, password, org_user_is_default=True):
  """mock user, org, and org_user"""

  # user
  mock_user = mocker.MagicMock()
  mock_user.configure_mock(
      password=hash_password(password),
      uuid="test-uuid-1234",
      name="Test user",
      email="test@test.com"
  )
  # org
  mock_org = mocker.MagicMock()
  mock_org.configure_mock(
      name="Test org name",
      uuid="test-uuid-2345"
  )
  # org user
  mock_org_user = mocker.MagicMock()
  mock_org_user.configure_mock(
      org_id=mock_org.id,
      user_id=mock_user.id,
      is_default=org_user_is_default
  )

  return mock_user, mock_org, mock_org_user


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

# ---------------------------------------------
# create, encode, decode token
# ---------------------------------------------


def test_create_token(mocker):
  """test that the tokens are encoded into a dict correctly with correct values"""
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  test_org_uuid = "test_org_uuidasdasdasd"
  test_user_uuid = "test_user_uuidasdasdasd"
  expires_after = timedelta(minutes=5)

  tok = create_token(test_org_uuid, test_user_uuid, expires_after)

  assert tok["org_uuid"] == test_org_uuid
  assert tok["user_uuid"] == test_user_uuid
  assert tok["expires_at"] == str(FIXED_NOW + expires_after)


def test_encode_token(mocker):
  """test that the encoded tokan is actually encoded"""
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  test_org_uuid = "test_org_uuidasdasdasd"
  test_user_uuid = "test_user_uuidasdasdasd"
  expires_after = timedelta(minutes=5)

  tok = create_token(test_org_uuid, test_user_uuid, expires_after)
  enc_tok = encode_token(tok)

  assert "org_uuid" not in enc_tok
  assert "user_uuid" not in enc_tok
  assert "expires_at" not in enc_tok


def test_decode_token_valid(mocker):
  """test the create, encode and decode token functions together"""
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  test_org_uuid = "test_org_uuidasdasdasd"
  test_user_uuid = "test_user_uuidasdasdasd"
  expires_after = timedelta(minutes=5)

  tok = create_token(test_org_uuid, test_user_uuid, expires_after)
  enc_tok = encode_token(tok)

  assert "org_uuid" not in enc_tok
  assert "user_uuid" not in enc_tok
  assert "expires_at" not in enc_tok

  dec_tok = decode_token(enc_tok)

  assert dec_tok["org_uuid"] == test_org_uuid
  assert dec_tok["user_uuid"] == test_user_uuid
  assert dec_tok["expires_at"] == str(FIXED_NOW + expires_after)


def test_decode_token_expired(mocker):
  """test the create, encode and decode token functions together"""
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  test_org_uuid = "test_org_uuidasdasdasd"
  test_user_uuid = "test_user_uuidasdasdasd"
  expires_after = timedelta(minutes=-5)

  tok = create_token(test_org_uuid, test_user_uuid, expires_after)
  enc_tok = encode_token(tok)

  assert "org_uuid" not in enc_tok
  assert "user_uuid" not in enc_tok
  assert "expires_at" not in enc_tok

  with pytest.raises(HTTPException) as exc_info:
    decode_token(enc_tok)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_decode_token_with_tampering(mocker):
  """test the create, encode and decode token functions together"""
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  test_org_uuid = "test_org_uuidasdasdasd"
  test_user_uuid = "test_user_uuidasdasdasd"
  expires_after = timedelta(minutes=5)

  tok = create_token(test_org_uuid, test_user_uuid, expires_after)
  enc_tok = encode_token(tok)

  assert "org_uuid" not in enc_tok
  assert "user_uuid" not in enc_tok
  assert "expires_at" not in enc_tok

  # basic tampering
  tampered = enc_tok[:5] + "FAKEUUID" + enc_tok[14:]
  with pytest.raises(HTTPException) as exc_info:
    decode_token(tampered)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED
  tampered = enc_tok[:10] + ("A" if enc_tok[10] != "A" else "B") + enc_tok[11:]
  with pytest.raises(HTTPException):
    decode_token(tampered)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED
  tampered = enc_tok[:-1]
  with pytest.raises(HTTPException) as exc_info:
    decode_token(tampered)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED

  # header.payload.signature <-- jwt format

  # modify signature
  header, payload, sig = enc_tok.split(".")
  tampered = f"{header}.{payload}.AAAA"
  with pytest.raises(HTTPException)as exc_info:
    decode_token(tampered)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED

  # modify payload
  header, payload, sig = enc_tok.split(".")
  tampered_payload = payload[:5] + "AAAA" + payload[9:]
  tampered = f"{header}.{tampered_payload}.{sig}"
  with pytest.raises(HTTPException) as exc_info:
    decode_token(tampered)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED

  # remove signature
  header, payload, _ = enc_tok.split(".")
  tampered = f"{header}.{payload}."
  with pytest.raises(HTTPException) as exc_info:
    decode_token(tampered)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_decode_token_with_tampering_algo_none(mocker):
  """test the create, encode and decode token functions together"""
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  test_org_uuid = "test_org_uuidasdasdasd"
  test_user_uuid = "test_user_uuidasdasdasd"
  expires_after = timedelta(minutes=5)

  tok = create_token(test_org_uuid, test_user_uuid, expires_after)
  enc_tok = encode_token(tok)

  assert "org_uuid" not in enc_tok
  assert "user_uuid" not in enc_tok
  assert "expires_at" not in enc_tok

  header, payload, _ = enc_tok.split(".")
  decoded_header = json.loads(base64.urlsafe_b64decode(header + "=="))
  decoded_header["alg"] = "none"
  new_header = base64.urlsafe_b64encode(json.dumps(decoded_header).encode()).decode().rstrip("=")
  tampered = f"{new_header}.{payload}."
  with pytest.raises(HTTPException) as exc_info:
    decode_token(tampered)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_decode_token_with_tampering_algo_downgrade(mocker):
  """test the create, encode and decode token functions together"""
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  test_org_uuid = "test_org_uuidasdasdasd"
  test_user_uuid = "test_user_uuidasdasdasd"
  expires_after = timedelta(minutes=5)

  tok = create_token(test_org_uuid, test_user_uuid, expires_after)
  enc_tok = encode_token(tok)

  assert "org_uuid" not in enc_tok
  assert "user_uuid" not in enc_tok
  assert "expires_at" not in enc_tok

  header, payload, _ = enc_tok.split(".")
  decoded_header = json.loads(base64.urlsafe_b64decode(header + "=="))
  decoded_header["alg"] = "HS256"
  new_header = base64.urlsafe_b64encode(json.dumps(decoded_header).encode()).decode().rstrip("=")
  tampered = f"{new_header}.{payload}."
  with pytest.raises(HTTPException) as exc_info:
    decode_token(tampered)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_decode_token_with_tampering_expiry_changed(mocker):
  """test the create, encode and decode token functions together"""
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  test_org_uuid = "test_org_uuidasdasdasd"
  test_user_uuid = "test_user_uuidasdasdasd"
  expires_after = timedelta(minutes=5)

  tok = create_token(test_org_uuid, test_user_uuid, expires_after)
  enc_tok = encode_token(tok)

  assert "org_uuid" not in enc_tok
  assert "user_uuid" not in enc_tok
  assert "expires_at" not in enc_tok

  hdr, payload, sig = enc_tok.split(".")
  decoded_payload = json.loads(base64.urlsafe_b64decode(payload + "=="))
  decoded_payload["expires_at"] = str(FIXED_NOW + timedelta(weeks=99))
  new_payload = base64.urlsafe_b64encode(json.dumps(decoded_payload).encode()).decode().rstrip("=")
  tampered = f"{hdr}.{new_payload}.{sig}"
  with pytest.raises(HTTPException) as exc_info:
    decode_token(tampered)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def _mutate_token(tok):
  ops = [
      lambda t: t[:-1],  # truncate
      lambda t: t + random.choice(string.ascii_letters),  # append garbage
      lambda t: t[:random.randint(0, len(t) - 1)] + random.choice(string.printable) + t[random.randint(0, len(t) - 1) + 1:],  # char flip
      lambda t: t.replace(".", "", 1),  # break structure
      lambda t: t + "." + random.choice(string.ascii_letters),  # extra segment
  ]
  return random.choice(ops)(tok)


def test_jwt_fuzz(mocker):
  mocker.patch("src.services.auth_service.getUtcDatetimeNow", return_value=FIXED_NOW)

  test_org_uuid = "test_org_uuidasdasdasd"
  test_user_uuid = "test_user_uuidasdasdasd"
  expires_after = timedelta(minutes=5)

  tok = create_token(test_org_uuid, test_user_uuid, expires_after)
  enc_tok = encode_token(tok)

  for _ in range(200):
    tampered = _mutate_token(enc_tok)
    with pytest.raises(HTTPException) as exc:
      decode_token(tampered)
    assert exc.value.status_code == HTTPStatus.UNAUTHORIZED

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

# ---------------------------------------------
# login
# ---------------------------------------------


def test_login_user_by_email_success(mocker):
  """Test that a login works by email"""
  password = "testpassword123"

  user, org, org_user = _mock_entities(mocker, password)
  users_repo, _, _ = _mock_repos(
      mocker,
      existing_user=user,
      existing_org=org,
      existing_org_user=org_user
  )
  req = LoginRequest(email=user.email, password=password, name=None)
  result = login_user(req)

  users_repo.get_record.assert_called_with(email=user.email)
  assert isinstance(result, LoginResponse)
  assert result.access_token


def test_login_user_by_name_success(mocker):
  """Test that a login works by name"""
  password = "testpassword123"

  user, org, org_user = _mock_entities(mocker, password)
  users_repo, _, _ = _mock_repos(
      mocker,
      existing_user=user,
      existing_org=org,
      existing_org_user=org_user
  )
  req = LoginRequest(name=user.name, password=password, email=None)
  result = login_user(req)

  users_repo.get_record.assert_called_with(name=user.name)
  assert isinstance(result, LoginResponse)
  assert result.access_token


def test_login_user_incorrect_password(mocker):
  """Test that a login works with correct input"""
  password = "testpassword123"

  user, org, org_user = _mock_entities(mocker, password)
  _mock_repos(
      mocker,
      existing_user=user,
      existing_org=org,
      existing_org_user=org_user
  )
  req = LoginRequest(name=user.name, password="asdasdasdasdasdasdasdasd", email=None)

  with pytest.raises(HTTPException) as exc_info:
    login_user(req)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_login_user_no_default_org(mocker):
  """Test that a login works with correct input"""
  password = "testpassword123"

  user, org, org_user = _mock_entities(mocker, password, org_user_is_default=False)
  _, _, mock_org_users_repo = _mock_repos(
      mocker,
      existing_user=user,
      existing_org=org,
      existing_org_user=org_user
  )
  mock_org_users_repo.get_record.side_effect = lambda **kwargs: None if kwargs.get("is_default") else org_user
  req = LoginRequest(name=user.name, password=password, email=None)

  with pytest.raises(HTTPException) as exc_info:
    login_user(req)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_login_user_no_default_org(mocker):
  """Test that a login works with correct input"""
  password = "testpassword123"

  user, org, org_user = _mock_entities(mocker, password, org_user_is_default=False)
  _, _, mock_org_users_repo = _mock_repos(
      mocker,
      existing_user=user,
      existing_org=org,
      existing_org_user=org_user
  )
  mock_org_users_repo.get_record.side_effect = lambda **kwargs: None if kwargs.get("is_default") else org_user
  req = LoginRequest(name=user.name, password=password, email=None)

  with pytest.raises(HTTPException) as exc_info:
    login_user(req)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_login_user_no_user(mocker):
  """Test that a login works with no user..."""
  password = "testpassword123"

  _, org, org_user = _mock_entities(mocker, password)
  _mock_repos(
      mocker,
      existing_org=org,
      existing_org_user=org_user
  )
  req = LoginRequest(email="test@test.com", password=password, name=None)
  with pytest.raises(HTTPException) as exc_info:
    login_user(req)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_login_user_no_association(mocker):
  """Test login with no org_user association"""
  password = "testpassword123"

  user, org, _ = _mock_entities(mocker, password)
  _mock_repos(
      mocker,
      existing_user=user,
      existing_org=org,
  )
  req = LoginRequest(email=user.email, password=password, name=None)
  with pytest.raises(HTTPException) as exc_info:
    login_user(req)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


def test_login_user_no_org(mocker):
  """Test login with no org record"""
  password = "testpassword123"

  user, _, org_user = _mock_entities(mocker, password)
  _mock_repos(
      mocker,
      existing_user=user,
      existing_org_user=org_user
  )
  req = LoginRequest(email=user.email, password=password, name=None)
  with pytest.raises(HTTPException) as exc_info:
    login_user(req)
  assert exc_info.value.status_code == HTTPStatus.UNAUTHORIZED


# ---------------------------------------------
# register
# ---------------------------------------------


REG_REQ = RegisterRequest(
    org_name="Acme Corp",
    name="Alice",
    email="alice@acme.com",
    password="securepassword123",
)


def test_register_orguser_success(mocker):
  """Happy path: creates org and user, returns 201."""
  mock_user_repo, mock_org_repo, mock_org_users_repo = _mock_repos(mocker)

  result = register_orguser(REG_REQ)

  assert result.status_code == HTTPStatus.CREATED
  mock_org_repo.add_record.assert_called_once_with(name="Acme Corp")
  mock_user_repo.add_record.assert_called_once()
  mock_org_users_repo.add_record.assert_called_once()


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


def test_register_orguser_user_added_as_default(mocker):
  """The user is registered with the org_admin role."""
  _, _, mock_org_users_repo = _mock_repos(mocker)

  register_orguser(REG_REQ)

  _, kwargs = mock_org_users_repo.add_record.call_args
  assert kwargs.get("is_default") == True


def test_register_orguser_user_linked_to_new_org(mocker):
  """The user is linked to the newly created org id."""
  _, _, mock_org_users_repo = _mock_repos(mocker, new_org_id=42)

  register_orguser(REG_REQ)

  _, kwargs = mock_org_users_repo.add_record.call_args
  assert kwargs.get("org_id") == 42


def test_register_orguser_user_linked_to_new_user(mocker):
  """The user is linked to the newly created org id."""
  _, _, mock_org_users_repo = _mock_repos(mocker, new_user_id=42)

  register_orguser(REG_REQ)

  _, kwargs = mock_org_users_repo.add_record.call_args
  assert kwargs.get("user_id") == 42


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

USER_UUID = "test-uuid-1234"


def _mock_updated_user(mocker, name="Test User", email="test@test.com"):
  """Return a mock DTO matching what update_record would return."""
  user = mocker.MagicMock()
  user.configure_mock(
      name=name,
      email=email,
      updated_at=FIXED_NOW
  )
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


def test_update_account_no_fields():
  """No fields raises bad request"""
  req = UpdateAccountRequest()
  with pytest.raises(HTTPException) as exc_info:
    update_user_account(USER_UUID, req)
  assert exc_info.value.status_code == HTTPStatus.BAD_REQUEST


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
