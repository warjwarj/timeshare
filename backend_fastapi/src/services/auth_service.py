from datetime import datetime, timedelta
from http import HTTPStatus
from typing import Optional
from argon2 import PasswordHasher
from fastapi import HTTPException
from repositories.users_repository import get_users_repo
from schemas.auth_dtos import UserDTO, JwtPayload
from models.user_model import UserModel
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import HTTPException, Depends
from models.user_model import UserModel
from http import HTTPStatus
import jwt

# config
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# fastapi security scheme
security = HTTPBearer()

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

  def encode_token(self, user: UserModel, expires_delta: Optional[timedelta] = None) -> str:
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
      exp=expires,
      iat=datetime.datetime.now(datetime.UTC)
    )
    encoded_jwt = jwt.encode(jwt_payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
  
  def verify_token(self, credentials: HTTPAuthorizationCredentials = Depends(security)) -> JwtPayload:
    """
    
    Verify a JWT
    
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
  
  def login_user(self, req: UserDTO) -> UserModel:
    """
    
    authenticate a login attempt
    
    """
    user = self.users_repo.get_user_by_email(req.email)
    if not user:
      raise HTTPException(
        status_code=HTTPStatus.HTTP_401_UNAUTHORIZED,
        detail="user doesn't exist"
      )    
    if not self.verify_password(req.password, user["hashed_password"]):
      raise HTTPException(
        status_code=HTTPStatus.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password"
      )     
    return user