from datetime import datetime, timedelta, timezone, time
from http import HTTPStatus
from typing import Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError, InvalidHashError
from fastapi import HTTPException, Depends
from http import HTTPStatus
import jwt

from src.repositories.users_repository import UserRepository
from src.schemas.auth_dtos import JwtPayload
from src.schemas.user_dtos import UserDTO
from src.utils.utils import getUnixEpoch, getUtcDatetimeNow
from src.utils.encoder import SecureEncoder

from settings import settings

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

passhasher = PasswordHasher()

cipher = SecureEncoder("REALLY REALLY SAFE PASSWORD")

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
    "user_id": str(user.id),
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
    jwt_payload['user_id'] = cipher.encrypt(jwt_payload['user_id'])
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
    
    # decrypt user id and check if valid
    decrypted = cipher.decrypt(payload['user_id'])    
    user = users_repo.get_user_by_id(decrypted)
    
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
  
  if users_repo.get_user_by_email(req.email):
    raise HTTPException(
      status_code=HTTPStatus.UNAUTHORIZED,
      detail="Email already registered."
    )
  hashed_password = hash_password(req.password)
  return users_repo.create_user(UserDTO(
    email=req.email,
    name=req.name,
    password=hashed_password,
    created_at=getUtcDatetimeNow()
  ))

def login_user(req: UserDTO) -> UserDTO:
  """    
  authenticate a login attempt    
  """
  
  users_repo = UserRepository()
  
  user_record = users_repo.get_user_by_email(req.email)
  
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
  
  return users_repo.get_user_by_id(jwt_payload.user_id)