from fastapi import APIRouter
import logging
from http import HTTPStatus

from src.dependancies.auth import RequestContextDep
from src.services.users_service import get_users_by_name

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

users_router = APIRouter(
    prefix="/orgusers",
    tags=["orgusers"],
)

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Routes
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


@users_router.get("/search/{name}", status_code=HTTPStatus.OK)
async def search_by_name(_: RequestContextDep, name: str):
  """
  Get all users matching a name.
  """
  return get_users_by_name(name)
