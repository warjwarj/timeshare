import logging
from uuid import uuid4

from src.repositories.events_repository import EventsRepository
from src.schemas.dtos.event_dto import EventDTO

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Services
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

def add_event(user_uuid: str, event: EventDTO):
  """
  Add an event
  
  :param user_id: requesters user_id
  :type user_id: str
  """  
  events_repo = EventsRepository()
  
  return events_repo.add_record(
    uuid=uuid4(),
    start=event.start,
    end=event.end,
    title=event.title,
    colour=event.colour,
    created_by_user_uuid=user_uuid
  )

def get_all_events(user_uuid: str) -> list[EventDTO]:
  """
  Get all events visible to user
  
  :param user_id: requesters user_id 
  :type user_id: str
  """  
  events_repo = EventsRepository()
  
  return events_repo.get_all_matching(
    created_by_user_uuid=user_uuid
  )