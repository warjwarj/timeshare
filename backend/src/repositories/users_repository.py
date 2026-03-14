import logging
from uuid import UUID

from src.repositories.organisation_repository import OrganisationRepository
from src.utils.organisation_user_role import OrganisationUserRole
from src.repositories.organisation_user_repository import OrganisationUserRepository
from src.models.user_model import UserModel
from src.schemas.dtos.user_dto import UserDTO
from src.repositories.repository import Repository

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

org_user_rep = OrganisationUserRepository()
org_rep = OrganisationRepository()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# UserRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


class UserRepository(Repository[UserModel, UserDTO]):
  """

  Repository for managing user records

  """
  model_class = UserModel

  def get_default_org_user(self, user_uuid: str) -> UserDTO | None:
    """
    Given org and user uuids, get orguser relationship
    """
    user = super().get_record(uuid=user_uuid)
    return org_user_rep.get_record(user_id=user.id, is_default=True)
