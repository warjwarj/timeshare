from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from typing import Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError, InvalidHashError
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException, Depends
from http import HTTPStatus
import jwt

from src.repositories.users_repository import UserRepository
from src.schemas.auth_dtos import JwtPayload
from src.schemas.user_dtos import UserDTO

from settings import settings

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# fastapi security scheme
security = HTTPBearer()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# AuthService
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class AuthService:
  def __init__(self):
    self.users_repo = UserRepository()
    self.passhasher = PasswordHasher()
    
  def hash_password(self, password: str) -> str:
    """    
    Hash a password for storage    
    """
    
    return self.passhasher.hash(password)  

  def verify_password(self, plain_password: str, hashed_password: str) -> bool:
    """    
    Verify a password against a hash    
    """
    try:
      return self.passhasher.verify(hashed_password, plain_password)  
    except (VerifyMismatchError or VerificationError or InvalidHashError):
      raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail={
          "success": False,
          "message": "INVALID_PASSWORD",
          "timestamp": datetime.now(timezone.utc)
        }
      )

  def create_token(self, user: UserDTO, expires_delta: Optional[timedelta] = None) -> JwtPayload:
    """    
    Create a JWT access token    
    """
    
    if expires_delta:
      expires = datetime.now(timezone.utc) + expires_delta
    else:
      expires = datetime.now(timezone.utc) + timedelta(minutes=15)
      
    jwt_payload = {
      "user_id": str(user.id),
      "role": user.role,
      "expires_at": str(expires),
      "iat": str(datetime.now(timezone.utc))
    }
    return jwt_payload
  
  def encode_token(self, jwt_payload: dict) -> str:
    """
    Encode an access token
    """
    
    encoded_jwt = jwt.encode(jwt_payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
  
  def verify_token(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> JwtPayload:
    """    
    Verify a access token   
    """
    
    token = credentials.credentials    
    try:
      payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
      return payload
    except jwt.ExpiredSignatureError:
      print("Token has expired")
      return None
    except jwt.InvalidTokenError:
      print("Invalid token")
      return None
  
  def register_user(self, req: UserDTO) -> UserDTO:
    """    
    initial register of a new user    
    """
    
    if self.users_repo.get_user_by_email(req.email):
      raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="email already registered"
      )
    hashed_password = self.hash_password(req.password)
    self.users_repo.create_user(UserDTO(
      email=req.email,
      name=req.name,
      password=hashed_password,
      created_at=datetime.now(timezone.utc)
    ))
    return True
  
  def login_user(self, req: UserDTO) -> UserDTO:
    """    
    authenticate a login attempt    
    """
    
    user_record = self.users_repo.get_user_by_email(req.email)
    
    # check user exists
    if not user_record:
      raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail={
          "success": False,
          "message": "INVALID_USER",
          "timestamp": datetime.now(timezone.utc)
        }
      )
    # verify password
    if not self.verify_password(req.password, user_record.password):
      raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail={
          "success": False,
          "message": "INVALID_PASSWORD",
          "timestamp": datetime.now(timezone.utc)
        }
      )
    return user_record
  
  def get_current_user_data(self, jwt_payload: JwtPayload) -> UserDTO:
    """
    given an auth token, retreive the information of the user represented by this token
    """
    return self.users_repo.get_user_by_id(jwt_payload.user_id)