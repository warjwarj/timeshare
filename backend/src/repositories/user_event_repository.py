import logging

from src.models.user_event_model import UserEventModel
from src.schemas.dtos.user_event_dto import UserEventDTO
from src.repositories.repository import Repository

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# UserEventRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


class UserEventRepository(Repository[UserEventModel, UserEventDTO]):
  """
  Repository for the user-event junction table.
  """
  model_class = UserEventModel
