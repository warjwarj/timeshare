import logging
from http import HTTPStatus
from fastapi import APIRouter

from src.services.auth_service import register_user, create_token, encode_token, login_user, get_current_user_data
from src.schemas.requests.auth_requests import LoginRequest, RegisterRequest
from src.schemas.responses.auth_responses import LoginResponse, RegisterResponse
from src.schemas.dtos.user_dto import UserDTO
from src.dependancies.auth_deps import IsAuthedDep

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
  ):
  """
  Route for registering a user.
  returns the registered user model.
  """
  # will raise exception if unauthorised
  user = register_user(UserDTO(
    uuid=None,
    email=request.email,
    password=request.password,
    name=request.name,
    role=request.role
  ))

  if user:
    return RegisterResponse(
      success=True,
      name=user.name,
      email=user.email
    )
    
  
@auth_router.post("/login", response_model=LoginResponse, status_code=HTTPStatus.OK)
async def login(
    request: LoginRequest,
  ):
  """  
  Route for logging in a user.  
  """
  
  u = UserDTO(
    uuid=None,
    email=request.email,
    password=request.password,
    name=request.name,
  )
  
  # this will raise an exception if unauthorised
  u = login_user(u)
    
  token = create_token(u)
  encoded_token = encode_token(token)
  
  return LoginResponse(
    success=True,
    access_token=encoded_token,
    token_type="bearer",
  )

@auth_router.post("/whoami")
async def login(
    jwt_payload: IsAuthedDep,
  ):
  """
  Protected route, get current user information  
  """
  return get_current_user_data(jwt_payload)