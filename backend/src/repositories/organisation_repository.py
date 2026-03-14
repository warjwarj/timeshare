import logging


from src.schemas.dtos.organisation_user_dto import OrganisationUserDTO
from src.schemas.dtos.organisation_dto import OrganisationDTO
from src.models.organisation_model import OrganisationModel
from src.repositories.repository import Repository

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# OrganisationRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


class OrganisationRepository(Repository[OrganisationModel, OrganisationDTO]):
  """

  Repository for managing organisation records

  """
  model_class = OrganisationModel
