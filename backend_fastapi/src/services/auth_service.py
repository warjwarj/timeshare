from datetime import datetime, timedelta
from http import HTTPStatus
from typing import Optional
from argon2 import PasswordHasher
from fastapi import HTTPException
from repositories.users_repository import UsersRepository, get_users_repo
from schemas.auth_dtos import RegisterReq, LoginReq, CreateTokenRes
from models.user_model import UserModel
import jwt

# config
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthService:
  def __init__(self):
    self.users_repo = get_users_repo()
    self.passhasher = PasswordHasher()
    pass

  def hash_password(self, password: str) -> str:
    """Hash a password for storage"""
    return self.passhasher.hash(password)  

  def verify_password(self, plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return self.passhasher.verify(plain_password, hashed_password)  

  def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.datetime.now(datetime.UTC) + expires_delta
    else:
        expire = datetime.datetime.now(datetime.UTC) + timedelta(minutes=15)
    to_encode.update({ "exp": expire })
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
  
  def register_user(self, req: RegisterReq) -> bool:
    """initial register of a new user"""
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
  
  def authenticate_user(self, req: LoginReq) -> UserModel:
    """authenticate a login attempt"""
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
  
  def create_token(self, email: str) -> CreateTokenRes:
    """create token response for authenticated user"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = self.create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

  def check_token(self, email: str) -> bool:
    """Create token response for authenticated user"""
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = self.create_access_token(
        data={"sub": email}, expires_delta=access_token_expires
    )
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }