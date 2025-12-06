from datetime import datetime, timedelta, timezone
from http import HTTPStatus
from typing import Optional
from argon2 import PasswordHasher
from fastapi import HTTPException
from repositories.users_repository import get_users_repo
from schemas.auth_dtos import LoginRequest, LoginResponse, JwtPayload
from schemas.user_dtos import UserDTO
from models.user_model import UserModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException, Depends
from models.user_model import UserModel
from http import HTTPStatus
import jwt

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# configs
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# fastapi security scheme
security = HTTPBearer()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# AuthService
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class AuthService:
  def __init__(self):
    self.users_repo = get_users_repo()
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
    
    return self.passhasher.verify(plain_password, hashed_password)  

  def create_token(self, user: UserModel, expires_delta: Optional[timedelta] = None) -> JwtPayload:
    """    
    Create a JWT access token    
    """
    
    if expires_delta:
      expires = datetime.datetime.now(datetime.UTC) + expires_delta
    else:
      expires = datetime.datetime.now(datetime.UTC) + timedelta(minutes=15)
    jwt_payload = JwtPayload(
      user_id=user.id,
      role=user.user.role,
      expires_at=expires,
      iat=datetime.datetime.now(datetime.UTC)
    )
    return jwt_payload
  
  def encode_token(self, jwt_payload: JwtPayload) -> str:
    """
    Encode an access token
    """
    
    encoded_jwt = jwt.encode(jwt_payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
  
  def verify_token(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> JwtPayload:
    """    
    Verify a access token   
    """
    
    token = credentials.credentials    
    try:
      payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
      return payload
    except jwt.ExpiredSignatureError:
      print("Token has expired")
      return None
    except jwt.InvalidTokenError:
      print("Invalid token")
      return None
  
  def register_user(self, req: UserDTO) -> bool:
    """    
    initial register of a new user    
    """
    
    if self.users_repo.user_exists(req.email):
      raise HTTPException(
        status_code=HTTPStatus.HTTP_401_UNAUTHORIZED,
        detail="email already registered"
      )    
    hashed_password = self.hash_password(req.password)
    self.users_repo.create_user({
      "email": req.email,
      "name": req.name,
      "hashed_password": hashed_password,
      "created_at": datetime.datetime.now(datetime.UTC)
    })
    return True
  
  def login_user(self, req: LoginRequest) -> LoginResponse:
    """    
    authenticate a login attempt    
    """
    
    user = self.users_repo.get_user_by_email(req.email)
    
    # check user exists
    if not user:
      raise HTTPException(
        status_code=HTTPStatus.HTTP_401_UNAUTHORIZED,
        detail={
          "success": False,
          "message": "INVALID_USER",
          "timestamp": datetime.now(timezone.utc)
        }
      )
    # verify password
    if not self.verify_password(req.password, user["hashed_password"]):
      raise HTTPException(
        status_code=HTTPStatus.HTTP_401_UNAUTHORIZED,
        detail={
          "success": False,
          "message": "INVALID_PASSWORD",
          "timestamp": datetime.now(timezone.utc)
        }
      )
    return user
  
  def get_current_user_data(self, jwt_payload: JwtPayload) -> UserDTO:
    """
    given an auth token, retreive the information of the user represented by this token
    """
    return self.users_repo.get_user_by_id(jwt_payload.user_id)