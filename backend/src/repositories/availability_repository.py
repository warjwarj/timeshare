import logging

from src.models.availability_rule_model import AvailabilityRuleModel
from src.schemas.dtos.availability_rule_dto import AvailabilityRuleDTO
from src.repositories.repository import Repository

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# AvailabilityRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


class AvailabilityRepository(Repository[AvailabilityRuleModel, AvailabilityRuleDTO]):
  """
  
  Repository for managing user records
  
  """
  model_class=AvailabilityRuleModel