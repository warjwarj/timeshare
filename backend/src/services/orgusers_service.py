import logging
from dataclasses import asdict

from src.repositories.users_repository import UserRepository
from src.schemas.dtos.user_dto import UserDTO
from src.schemas.responses.user_responses import SafeUserDTO


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

users_repo = UserRepository()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Helpers
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


def sanitise_user(user: UserDTO) -> SafeUserDTO:
  d = {k: v for k, v in asdict(user).items() if k != "id" and k != "password"}
  return SafeUserDTO(**d)


def sanitise_users(users: list[UserDTO]) -> list[SafeUserDTO]:
  return [sanitise_user(u) for u in users]


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Services
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


def get_users_by_name(name: str) -> list[SafeUserDTO]:
  """
  Get all users matching a name.
  """
  users = users_repo.get_multiple_records(name=name)
  return sanitise_users(users) if users else []


def search_users(search_term: str) -> list[SafeUserDTO]:
  """
  Fuzzy search users
  """
  users = users_repo.search_users(q=search_term)
  return sanitise_users(users) if users else []
