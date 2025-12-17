import logging
import threading
from _thread import LockType
from typing import Optional

from sqlalchemy import inspect

from src.db.session import DB_URL, get_engine
from src.models.event_model import Base, EventModel
from src.schemas.event_dtos import EventDTO
from src.repositories.repository import Repository

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# EventRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class EventsRepository(Repository[EventModel]):
  """
  Repository for events
  """
  model_class = EventModel
  

  def create_event(self, user: EventDTO) -> Optional[EventDTO]:
    raise NotImplementedError

  def delete_event(self, event_id: str) -> bool:
    raise NotImplementedError
  
  def get_event_by_id(self, event_id: str) -> Optional[EventDTO]:
    raise NotImplementedError
  
  def update_event(self, event_id: str, event: EventDTO) -> Optional[EventDTO]:
    raise NotImplementedError
