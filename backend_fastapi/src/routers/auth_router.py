import logging
from http import HTTPStatus

from fastapi import APIRouter
from fastapi.responses import Response 

from src.services.auth_service import AuthService
from src.schemas.auth_dtos import LoginRequest, LoginResponse, RegisterRequest, JwtPayload
from src.schemas.user_dtos import UserDTO
from src.dependancies.auth_deps import AuthServiceDep, IsAuthedDep

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

@auth_router.post("/register", status_code=HTTPStatus.CREATED)
async def register(
    request: RegisterRequest, 
    auth_service: AuthServiceDep
  ):
  """
  Route for registering a user.
  returns the registered user model.  
  """
  # will raise exception if unauthorised
  auth_service.register_user(UserDTO(
    id=None,
    email=request.email,
    password=request.password,
    name=request.name,
    role=request.role
  ))
    
  
@auth_router.post("/login", response_model=LoginResponse, status_code=HTTPStatus.OK)
async def login(
    request: LoginRequest,
    auth_service: AuthServiceDep
  ):
  """  
  Route for logging in a user.  
  """
  
  u = UserDTO(
    id=None,
    email=request.email,
    password=request.password,
    name=request.name,
  )
  
  # this will raise an exception if unauthorised
  u = auth_service.login_user(u)
    
  token = auth_service.create_token(u)
  encoded_token = auth_service.encode_token(token)
  
  return LoginResponse(
    success=True,
    access_token=encoded_token,
    token_type="bearer",
    user_id=str(u.id),
  )

@auth_router.post("/whoami")
async def login(
    auth_service: AuthServiceDep,
    jwt_payload: IsAuthedDep,
  ):
  """
  Protected route, get current user information  
  """
  return auth_service.get_current_user_data(jwt_payload)