import logging

from src.models.organisation_user_model import OrganisationUserModel
from src.schemas.dtos.organisation_user_dto import OrganisationUserDTO
from src.repositories.repository import Repository

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# OrganisationUserRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


class OrganisationUserRepository(Repository[OrganisationUserModel, OrganisationUserDTO]):
  """
  Repository for the organisation-user junction table.
  """
  model_class = OrganisationUserModel
