from fastapi import APIRouter
import logging
from http import HTTPStatus

from src.dependancies.auth import RequestCtxDep
from src.services.orgusers_service import search_users

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

orgusers_router = APIRouter(
    prefix="/orgusers",
    tags=["orgusers"],
)

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Routes
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


@orgusers_router.get("/search/{term}", status_code=HTTPStatus.OK)
async def search(_: RequestCtxDep, term: str):
  """
  Get all users matching a name.
  """
  return search_users(term)
