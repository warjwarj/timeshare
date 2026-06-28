import logging
from dataclasses import asdict
from datetime import datetime

from src.dependancies.auth import RequestCtxDep
from src.repositories.user_event_repository import UserEventRepository
from src.repositories.events_repository import EventsRepository
from src.schemas.dtos.event_dto import EventDTO
from src.schemas.requests.event_requests import CreateEventRequest, UpdateEventRequest
from src.schemas.responses.events_responses import SafeEventDTO


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

events_repo = EventsRepository()
user_event_repo = UserEventRepository()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Helpers
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


def sanitiseEvent(ev: EventDTO) -> SafeEventDTO:
  sev = {k: v for k, v in asdict(ev).items() if k != "id"}
  return SafeEventDTO(**sev)


def sanitiseEvents(evs: list[EventDTO]) -> list[SafeEventDTO]:
  return [sanitiseEvent(ev) for ev in evs]

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Services
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


def create_event(user_id: int, event: CreateEventRequest) -> SafeEventDTO | None:
  """
  Create an event

  Args:
    user_uuid (str): uuid of the user creating the event
    event (CreateEventRequest): args describing the event to be created

  Returns:
    SafeEventDTO | None: the event, if created else None
  """
  rec = events_repo.add_record(user_id, **vars(event))
  return sanitiseEvent(rec) if rec else None


def get_all_events(user_id: str, start: datetime, end: datetime) -> list[SafeEventDTO]:
  """
  Get all events visible to user

  Args:
    user_uuid (str): uuid of the user making the request
    start (datetime): start of timespan
    end (datetime): end of timespan

  Returns:
    list[SafeEventDTO]: events matching filter params
  """
  evs = events_repo.get_events_by_datetimes(user_id=user_id, start=start, end=end)
  return sanitiseEvents(evs) if evs else []


def update_event(ctx: RequestCtxDep, event_uuid: str, event: UpdateEventRequest) -> SafeEventDTO | None:
  """
  Update an event

  Args:
    event_uuid (str): uuid of the event to be updated
    event (CreateEventRequest): args describing the update params

  Returns:
    SafeEventDTO | None: the event, if created else None
  """
  user_event_associations = user_event_repo.get_multiple_records(user_id=ctx.user.id)
  event_rec = events_repo.get_record(uuid=event_uuid)
  # check if any associations, if None then return
  if not any(assoc.event_id == event_rec.id for assoc in user_event_associations):
    return None
  rec = events_repo.update_record(lookup={"id": event_rec.id}, **vars(event))
  return sanitiseEvent(rec) if rec else None


def delete_event(ctx: RequestCtxDep, event_uuid: str) -> SafeEventDTO | None:
  """
  Delete an event
  """
  user_event_associations = user_event_repo.get_multiple_records(user_id=ctx.user.id)
  event_rec = events_repo.get_record(uuid=event_uuid)
  # check if any associations, if None then return
  if not any(assoc.event_id == event_rec.id for assoc in user_event_associations):
    return None
  rec = events_repo.delete_record(id=event_rec.id)
  return sanitiseEvent(rec) if rec else None
