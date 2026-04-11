from fastapi import APIRouter
import logging
from http import HTTPStatus
from datetime import datetime

from src.dependancies.auth import RequestContextDep
from src.services.events_service import get_all_events, create_event, update_event, delete_event
from src.schemas.requests.event_requests import CreateEventRequest, UpdateEventRequest

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

events_router = APIRouter(
    prefix="/events",
    tags=["events"],
)

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Routes
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


@events_router.get("/", status_code=HTTPStatus.OK)
async def all(ctx: RequestContextDep, start: datetime, end: datetime):
  """
  Get all events visible to user.
  """
  return get_all_events(ctx.user.id, start, end)


@events_router.post("/", status_code=HTTPStatus.CREATED)
async def create(ctx: RequestContextDep, event: CreateEventRequest):
  """
  Create an event.
  """
  return create_event(ctx.user.id, event)


@events_router.put("/{event_uuid}", status_code=HTTPStatus.OK)
async def update(ctx: RequestContextDep, event_uuid: str, event: UpdateEventRequest):
  """
  Update an event.
  """
  return update_event(ctx, event_uuid, event)


@events_router.delete("/{event_uuid}", status_code=HTTPStatus.OK)
async def delete(ctx: RequestContextDep, event_uuid: str):
  """
  Delete an event.
  """
  return delete_event(ctx, event_uuid)
