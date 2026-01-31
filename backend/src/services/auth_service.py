from datetime import datetime, timedelta, timezone
from http import HTTPStatus
import logging
from typing import Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError, InvalidHashError
from fastapi import HTTPException
from http import HTTPStatus
import jwt

from src.schemas.responses.auth_responses import LoginResponse, RegisterResponse, UpdateAccountResponse
from src.schemas.requests.auth_requests import LoginRequest, RegisterRequest, UpdateAccountRequest
from src.repositories.users_repository import UserRepository
from src.schemas.dtos.user_dto import UserDTO
from src.utils.utils import getUnixEpoch, getUtcDatetimeNow

from settings import settings

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

passhasher = PasswordHasher()

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

def create_token(uuid: str, expires_delta: Optional[timedelta] = None) -> dict:
  """    
  Create a JWT access token    
  """  
  if expires_delta:
    expires = datetime.now(timezone.utc) + expires_delta
  else:
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)    
  jwt_payload = {
    "user_uuid": str(uuid),
    "expires_at": str(expires), # this can be iso string
    "iat": getUnixEpoch() # jwt needs an int for iat
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
  users_repo = UserRepository()  
  try:    
    payload = jwt.decode(encoded_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    user = users_repo.get_record(uuid=payload['user_uuid'])  
    if not user:
      raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Valid token, but no user record to match. How did this happen..."
      )    
    return payload    
  except jwt.ExpiredSignatureError as e:
    raise HTTPException(
      status_code=HTTPStatus.FORBIDDEN,
      detail=e
    )
  except jwt.InvalidTokenError as e:
    raise HTTPException(
      status_code=HTTPStatus.UNAUTHORIZED,
      detail=e
    )

def register_user(req: RegisterRequest) -> RegisterResponse:
  """    
  Initial registration of a new user.
  """  
  users_repo = UserRepository()    
  if users_repo.get_record(email=req.email):
    raise HTTPException(
      status_code=HTTPStatus.FORBIDDEN,
      detail="Email already registered."
    )
  hashed_password = hash_password(req.password)
  fields = vars(req)
  fields["password"] = hashed_password
  rec = users_repo.add_record(**fields)  
  if rec is not None:
    return RegisterResponse(name=rec.name, email=rec.email)
  else:    
    logger.error("REGISTER_USER: Could not register user, repository add_record returned None.")
    raise HTTPException(
      status_code=HTTPStatus.INTERNAL_SERVER_ERROR,
      detail="Failed to register user."
    )
    

def login_user(req: LoginRequest) -> LoginResponse:
  """    
  Authenticate a login attempt.
  """
  users_repo = UserRepository()
  if req.name:
    search_term = {"name": req.name}
  else:
    search_term = {"email": req.email}
  rec = users_repo.get_record(**search_term)
  if not rec:
    raise HTTPException(
      status_code=HTTPStatus.UNAUTHORIZED,
      detail="Invalid user."
    )
  verify_password(rec.password, req.password)
  encoded_token = encode_token(create_token(rec.uuid))
  return LoginResponse(
    success=True,
    access_token=encoded_token,
    token_type="bearer",
    name=rec.name,
    email=rec.email
  )


# TODO USE THE UPDATE SCHEMA
def update_user_account(user_uuid: str, req: UpdateAccountRequest) -> UpdateAccountResponse:
  """
  Update user account information (name and/or email)
  """
  users_repo = UserRepository()
  if req.email:
    existing_user = users_repo.get_record(email=req.email)
    if existing_user and existing_user.uuid != user_uuid:
      raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Email already in use."
      )      
  update_data = {}
  if req.name is not None:
    update_data['name'] = req.name
  if req.email is not None:
    update_data['email'] = req.email    
  update_data['updated_at'] = getUtcDatetimeNow()
  rec = users_repo.update_record(user_uuid, **update_data)
  return UpdateAccountResponse(
    success=True,
    updated_at=str(rec.updated_at),
    name=rec.name,
    email=rec.email
  )