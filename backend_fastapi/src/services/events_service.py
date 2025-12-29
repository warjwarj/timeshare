import logging
from dataclasses import asdict
from uuid import uuid4
from datetime import datetime

from src.repositories.events_repository import EventsRepository
from src.schemas.dtos.event_dto import EventDTO
from src.models.event_model import EventModel
from src.schemas.requests.event_requests import CreateEventRequest, UpdateEventRequest, CreateMultipleEventsRequest
from src.schemas.responses.events_responses import SafeEventDTO

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Helpers
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

def sanitiseEvent(ev: EventDTO) -> SafeEventDTO:
  sev = {k: v for k, v in asdict(ev).items() if k != "created_by_user_uuid"}
  return SafeEventDTO(**sev)

def sanitiseEvents(evs: list[EventDTO]) -> list[SafeEventDTO]:
  return [sanitiseEvent(ev) for ev in evs]

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Services
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

def create_event(user_uuid: str, event: CreateEventRequest) -> SafeEventDTO:
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
  if rec is not None:
    return sanitiseEvent(rec)

def update_event(user_uuid: str, event: UpdateEventRequest) -> SafeEventDTO:
  """
  Add an event
  """  
  events_repo = EventsRepository()
  
  rec = events_repo.update_record(
    uuid=event.uuid,
    start=event.start,
    end=event.end,
    name=event.name,
    colour=event.colour,
  )
  print(rec)
  if rec is not None:
    return sanitiseEvent(rec)

def create_multiple_events(user_uuid: str, req: CreateMultipleEventsRequest) -> list[SafeEventDTO]:
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
  evs = events_repo.add_multiple_records(models)
  if evs:
    return sanitiseEvents(evs)
  
def get_all_events(user_uuid: str, start: datetime, end: datetime) -> list[SafeEventDTO]:
  """
  Get all events visible to user

  :param user_id: requesters user_id
  :type user_id: str
  """  
  events_repo = EventsRepository()
  
  evs = events_repo.get_events_by_datetimes(user_uuid, start, end)
  return sanitiseEvents(evs)