import logging

from src.models.event_model import EventModel
from src.schemas.dtos.event_dto import EventDTO
from src.repositories.repository import Repository

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# EventRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class EventsRepository(Repository[EventModel, EventDTO]):
  """
  
  Repository for events
  
  """
  model_class = EventModel