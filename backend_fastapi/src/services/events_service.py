import logging
from uuid import uuid4

from src.repositories.events_repository import EventsRepository
from src.schemas.dtos.event_dto import EventDTO
from src.models.event_model import EventModel
from src.schemas.requests.event_requests import CreateEventRequest, CreateMultipleEventsRequest

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Services
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

def create_event(user_uuid: str, event: CreateEventRequest) -> EventDTO:
  """
  Add an event  
  """  
  events_repo = EventsRepository()
  
  rec = events_repo.add_record(
    start=event.start,
    end=event.end,
    name=event.name,
    colour=event.colour,
    created_by_user_uuid=user_uuid
  )  
  rec.created_by_user_uuid = None  
  return rec

def create_multiple_events(user_uuid: str, req: CreateMultipleEventsRequest) -> list[EventDTO]:
  """
  Add multiple events
  """  
  events_repo = EventsRepository()
  
  # we'll trust that the pydantic validation ensures correctly formatted events, for now at least
  objs = [
    { **o.model_dump(), "created_by_user_uuid": user_uuid }
    for o in req.events
  ]  
  models = [EventModel(**o) for o in objs]    
  return events_repo.add_multiple_records(models)  
  
def get_all_events(user_uuid: str) -> list[EventDTO]:
  """
  Get all events visible to user
  
  :param user_id: requesters user_id 
  :type user_id: str
  """  
  events_repo = EventsRepository()
  
  return events_repo.get_record(
    multiple=True,
    created_by_user_uuid=user_uuid
  )