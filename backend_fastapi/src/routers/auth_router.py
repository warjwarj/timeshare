import logging
from fastapi import APIRouter, Depends
from typing import Annotated
from services import AuthService
from schemas import LoginRequest, LoginResponse, RegisterRequest, RegisterResponse, JwtPayload
from schemas import UserDTO
from dependancies import AuthServiceDep, IsAuthedDep

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

auth_router = APIRouter(
  prefix="/auth", 
  tags=["auth"]
)

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Routes
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

@auth_router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(
    request: RegisterRequest, 
    auth_service: AuthServiceDep
  ):
  """
  Route for registering a user.
  returns the registered user model.  
  """
  
  return auth_service.register_user(
    email=request.email,
    password=request.password,
    full_name=request.full_name
  )
  
@auth_router.post("/login", response_model=LoginResponse, status_code=201)
async def login(
    request: LoginRequest,
    auth_service: AuthServiceDep
  ):
  """  
  Route for logging in a user.  
  """
  
  # this will raise an exception if unauthorised
  user: UserDTO = auth_service.login_user(
    email=request.email,
    password=request.password,
    full_name=request.full_name
  )
  
  token: JwtPayload = AuthService.create_token(user)
  
  return LoginResponse(
    success=True,
    access_token=AuthService.encode_token(token),
    token_type="bearer",
    user_id=user.id,
    expires_at=token.expires_at
  )

@auth_router.post("/whoami", response_model=(UserDTO))
async def login(
    auth_service: AuthServiceDep,
    jwt_payload: IsAuthedDep,
  ):
  """
  Protected route, get current user information  
  """
  return auth_service.get_current_user_data(jwt_payload)