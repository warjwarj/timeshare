from fastapi import APIRouter
import logging
from http import HTTPStatus

from src.dependancies.auth import RequestContextDep
from src.services.users_service import get_users_by_name, search_users

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

users_router = APIRouter(
    prefix="/users",
    tags=["users"],
)

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Routes
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


@users_router.get("/search/{term}", status_code=HTTPStatus.OK)
async def search(_: RequestContextDep, term: str):
  """
  Get all users matching a name.
  """
  return search_users(term)
