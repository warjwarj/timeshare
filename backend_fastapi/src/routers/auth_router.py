from fastapi import APIRouter, HTTPException

from services.auth_service import AuthService
from schemas.auth_dtos import UserDTO

from models.user_model import UserModel

router = APIRouter(
  prefix="/auth", 
  tags=["auth"]
)

@router.post("/register", response_model=UserDTO, status_code=201)
async def register(request: UserDTO):
  """
  
  Route for registering a user.
  returns the registered user model.
  
  """
  return AuthService.register_user(
    email=request.email,
    password=request.password,
    full_name=request.full_name
  )
  
@router.post("/login", response_model=UserDTO, status_code=201)
async def login(request: UserDTO):
  """
  
  Route for logging in a user.
  Returns 
  
  """
  # this will raise an exception if unauthorised
  user = AuthService.login_user(
    email=request.email,
    password=request.password,
    full_name=request.full_name
  )
  token = AuthService.encode_token(user)
  return { "success": True, "access_token": token, "token_type": "bearer" }