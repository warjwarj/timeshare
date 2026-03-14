import logging
from http import HTTPStatus
from fastapi import APIRouter

from src.services.auth_service import register_orguser, login_user, update_user_account
from src.schemas.requests.auth_requests import LoginRequest, RegisterRequest, UpdateAccountRequest
from src.dependancies.auth import RequestContextDep

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
async def register(req: RegisterRequest):
  """
  Handle a registration request
  """
  return register_orguser(req)


@auth_router.post("/login", status_code=HTTPStatus.OK)
async def login(req: LoginRequest):
  """  
  Handle login request
  """
  return login_user(req)


@auth_router.put("/account", status_code=HTTPStatus.OK)
async def update_account(ctx: RequestContextDep, req: UpdateAccountRequest):
  """
  Protected route, handle a user account update request
  """
  return update_user_account(ctx.user.uuid, req)
