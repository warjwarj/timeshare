import logging
from http import HTTPStatus
from fastapi import APIRouter

from src.services.auth_service import register_user, create_token, encode_token, login_user, update_user_account
from src.schemas.requests.auth_requests import LoginRequest, RegisterRequest, UpdateAccountRequest
from src.schemas.responses.auth_responses import LoginResponse, RegisterResponse, UpdateAccountResponse
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
async def register(request: RegisterRequest):
  """
  Handle a registration request
  """
  return register_user(request)
    
  
@auth_router.post("/login", status_code=HTTPStatus.OK)
async def login(req: LoginRequest):
  """  
  Handle login request
  """
  return login_user(req)

@auth_router.put("/account", status_code=HTTPStatus.OK)
async def update_account(jwt_payload: IsAuthedDep, req: UpdateAccountRequest):
  """
  Protected route, handle a user account update request
  """
  return update_user_account(jwt_payload["user_uuid"], req)
