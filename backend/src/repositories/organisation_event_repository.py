import logging

from src.models.organisation_event_model import OrganisationEventModel
from src.schemas.dtos.organisation_event_dto import OrganisationEventDTO
from src.repositories.repository import Repository

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# OrganisationEventRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


class OrganisationEventRepository(Repository[OrganisationEventModel, OrganisationEventDTO]):
  """
  Repository for the organisation-event junction table.
  """
  model_class = OrganisationEventModel
