from datetime import datetime, timedelta, timezone
from http import HTTPStatus
import logging
from typing import Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError, InvalidHashError
from fastapi import HTTPException, Response
from http import HTTPStatus
import jwt

from src.repositories.organisation_user_repository import OrganisationUserRepository
from src.utils.organisation_user_role import OrganisationUserRole
from src.repositories.organisation_repository import OrganisationRepository
from src.schemas.responses.auth_responses import LoginResponse, UpdateAccountResponse
from src.schemas.requests.auth_requests import LoginRequest, RegisterRequest, UpdateAccountRequest
from src.repositories.users_repository import UserRepository
from src.utils.utils import getUnixEpoch, getUtcDatetimeNow

from settings import settings

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

passhasher = PasswordHasher()

users_repo = UserRepository()
orgs_repo = OrganisationRepository()
org_users_repo = OrganisationUserRepository()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Services
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


def hash_password(password: str) -> str:
  """
  Hash a password for storage
  """
  return passhasher.hash(password)


def verify_password(hashed_password: str, plain_password: str) -> None:
  """
  Verify a password against a hash
  """
  try:
    return passhasher.verify(hashed_password, plain_password)
  except (VerifyMismatchError or VerificationError or InvalidHashError):
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Invalid password."
    )


def create_token(org_uuid: str, user_uuid: str, expires_delta: Optional[timedelta] = timedelta(minutes=15)) -> dict:
  """
  Create a JWT access token
  """
  expires = getUtcDatetimeNow() + expires_delta
  jwt_payload = {
      "org_uuid": str(org_uuid),
      "user_uuid": str(user_uuid),
      "expires_at": str(expires),  # this can be iso string
      "iat": getUnixEpoch()
  }
  return jwt_payload


def encode_token(jwt_payload: dict) -> str:
  """
  Encode an access token
  """
  try:
    return jwt.encode(jwt_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
  except Exception:
    raise HTTPException(
        status_code=HTTPStatus.BAD_REQUEST
    )


def decode_token(encoded_token: str) -> dict:
  """
  Verify a access token
  """
  try:
    payload = jwt.decode(encoded_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    if datetime.fromisoformat(payload["expires_at"]) < getUtcDatetimeNow():
      raise HTTPException(
          status_code=HTTPStatus.UNAUTHORIZED,
          detail="Token expired"
      )
    return payload
  except jwt.ExpiredSignatureError as e:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail=e
    )
  except jwt.InvalidTokenError as e:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail=e
    )


def register_orguser(req: RegisterRequest) -> Response:
  """
  Initial registration of a new user.
  """
  try:

    if users_repo.get_record(email=req.email):
      raise HTTPException(
          status_code=HTTPStatus.FORBIDDEN,
          detail="Email already registered."
      )
    if orgs_repo.get_record(name=req.org_name):
      raise HTTPException(
          status_code=HTTPStatus.FORBIDDEN,
          detail="Organisation alrady registered"
      )

    user_data = {k: v for k, v in req if k != "org_name"}
    org_data = {"name": req.org_name}

    hashed_password = hash_password(req.password)
    user_data["password"] = hashed_password

    user = users_repo.add_record(**user_data)
    org = orgs_repo.add_record(**org_data)
    org_users_repo.add_record(
        org_id=org.id,
        user_id=user.id,
        role=OrganisationUserRole.org_admin,
        **{"is_default": True},
    )

  except HTTPException:
    raise
  except Exception as ex:
    logger.error(f"Error during register: {ex}")
    raise HTTPException(
        status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
        detail=f"Error during register: {str(ex)}"
    )

  return Response(status_code=HTTPStatus.CREATED)


def login_user(req: LoginRequest) -> LoginResponse:
  """
  Authenticate a user. Logs them into the organisation which
  the OrganisationUser record specifies as the default.
  """

  if req.name:
    search_term = {"name": req.name}
  else:
    search_term = {"email": req.email}
  user = users_repo.get_record(**search_term)
  if not user:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Invalid user."
    )
  verify_password(user.password, req.password)
  org_user = org_users_repo.get_record(user_id=user.id, is_default=True)
  if not org_user:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not find default organisation association for user."
    )
  org = orgs_repo.get_record(id=org_user.org_id)
  if not org:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not find organisation from id in organisation user record"
    )

  encoded_token = encode_token(create_token(org.uuid, user.uuid, timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)))
  return LoginResponse(
      success=True,
      access_token=encoded_token,
      token_type="bearer",
      name=user.name,
      email=user.email
  )


def update_user_account(user_uuid: str, req: UpdateAccountRequest) -> UpdateAccountResponse:
  """
  Update user account information (name and/or email)
  """
  if not req.name and not req.email:
    raise HTTPException(
        HTTPStatus.BAD_REQUEST,
        detail="no fields provided in update request"
    )
  update_data = {}
  if req.email is not None:
    existing_user = users_repo.get_record(email=req.email)
    if existing_user and existing_user.uuid != user_uuid:
      raise HTTPException(
          status_code=HTTPStatus.UNAUTHORIZED,
          detail="Email already in use."
      )
    update_data['email'] = req.email
  if req.name is not None:
    update_data['name'] = req.name
  update_data['updated_at'] = str(getUtcDatetimeNow())
  rec = users_repo.update_record(lookup={"uuid": user_uuid}, **update_data)
  return UpdateAccountResponse(
      success=True,
      updated_at=str(rec.updated_at),
      name=rec.name,
      email=rec.email
  )
