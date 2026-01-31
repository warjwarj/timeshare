from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from typing import Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError, InvalidHashError
from fastapi import HTTPException
from http import HTTPStatus
import jwt

from src.repositories.users_repository import UserRepository
from src.schemas.dtos.jwt_payload import JwtPayload
from src.schemas.dtos.user_dto import UserDTO
from src.utils.utils import getUnixEpoch, getUtcDatetimeNow

from settings import settings

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

passhasher = PasswordHasher()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Services
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    
def hash_password(password: str) -> str:
  """    
  Hash a password for storage    
  """
      
  return passhasher.hash(password)  

def verify_password(plain_password: str, hashed_password: str) -> bool:
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

def create_token(user: UserDTO, expires_delta: Optional[timedelta] = None) -> dict:
  """    
  Create a JWT access token    
  """
  
  if expires_delta:
    expires = datetime.now(timezone.utc) + expires_delta
  else:
    expires = datetime.now(timezone.utc) + timedelta(minutes=15)
    
  jwt_payload = {
    "user_uuid": str(user.uuid),
    "expires_at": str(expires), # this can be iso string
    "iat": getUnixEpoch() # jwt needs an int for iat
  }
  return jwt_payload  

def encode_token(jwt_payload: dict) -> str:
  """
  Encode an access token
  """
  
  # encrypt user id
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
    
    # check user uuid if it's valid
    user = users_repo.get_record(uuid=payload['user_uuid'])
    
    if not user:
      raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
      )
    
    return payload
  
  except jwt.ExpiredSignatureError:
    raise HTTPException(
      status_code=HTTPStatus.FORBIDDEN,
    )
  except jwt.InvalidTokenError:
    raise HTTPException(
      status_code=HTTPStatus.UNAUTHORIZED,
    )
  except Exception:
    raise HTTPException(
      status_code=HTTPStatus.BAD_REQUEST,
    )

def register_user(req: UserDTO) -> UserDTO:
  """    
  initial register of a new user    
  """
  
  users_repo = UserRepository()
  
  if users_repo.get_record(email=req.email):
    raise HTTPException(
      status_code=HTTPStatus.UNAUTHORIZED,
      detail="Email already registered."
    )
  hashed_password = hash_password(req.password)
  return users_repo.add_record(
    email=req.email,
    name=req.name,
    password=hashed_password,
    created_at=getUtcDatetimeNow()
  )

def login_user(req: UserDTO) -> UserDTO:
  """    
  Authenticate a login attempt
  """  
  users_repo = UserRepository()
  
  user_record = users_repo.get_record(email=req.email)
  
  # check user exists
  if not user_record:
    raise HTTPException(
      status_code=HTTPStatus.UNAUTHORIZED,
      detail="Invalid user."
    )
  # verify password
  if not verify_password(req.password, user_record.password):
    raise HTTPException(
      status_code=HTTPStatus.UNAUTHORIZED,
      detail="Invalid password for user."
    )
  return user_record

def get_current_user_data(jwt_payload: JwtPayload) -> UserDTO:
  """
  given an auth token, retreive the information of the user represented by this token
  """

  users_repo = UserRepository()

  return users_repo.get_record(
    multiple=True,
    uuid=jwt_payload["user_uuid"]
  )

def update_user_account(user_uuid: str, name: Optional[str] = None, email: Optional[str] = None) -> UserDTO:
  """
  Update user account information (name and/or email)
  """

  users_repo = UserRepository()

  # Check if email is being changed and if it's already in use by another user
  if email:
    existing_user = users_repo.get_record(email=email)
    if existing_user and existing_user.uuid != user_uuid:
      raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Email already in use."
      )

  # Prepare update data
  update_data = {}
  if name is not None:
    update_data['name'] = name
  if email is not None:
    update_data['email'] = email

  # Always update the updated_at timestamp
  update_data['updated_at'] = getUtcDatetimeNow()

  # Update the record
  return users_repo.update_record(user_uuid, **update_data)