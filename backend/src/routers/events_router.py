from fastapi import APIRouter
import json
import logging
from http import HTTPStatus
import os
from datetime import datetime

from src.dependancies.auth_deps import IsAuthedDep
from src.services.events_service import get_all_events, create_event, update_event, create_multiple_events, delete_event
from src.schemas.requests.event_requests import CreateEventRequest, UpdateEventRequest, CreateMultipleEventsRequest

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
async def all(jwt_payload: IsAuthedDep, start: datetime, end: datetime):
  """
  Get all events visible to user.
  """
  user_uuid = jwt_payload["user_uuid"]
  return get_all_events(user_uuid, start, end)

@events_router.post("/", status_code=HTTPStatus.CREATED)
async def create(jwt_payload: IsAuthedDep, event: CreateEventRequest):
  """
  Create an event.
  """
  user_uuid = jwt_payload["user_uuid"]
  return create_event(user_uuid, event)

@events_router.put("/{uuid}", status_code=HTTPStatus.OK)
async def update(uuid: str, jwt_payload: IsAuthedDep, event: UpdateEventRequest):
  """
  Update an event.
  """
  return update_event(uuid, event)

@events_router.delete("/{uuid}", status_code=HTTPStatus.OK)
async def delete(uuid: str, jwt_payload: IsAuthedDep):
  """
  Delete an event.
  """
  return delete_event(uuid)

@events_router.post("/create-multiple", status_code=HTTPStatus.CREATED)
async def create(jwt_payload: IsAuthedDep, event: CreateMultipleEventsRequest):
  """
  Create multiple events
  """
  return create_multiple_events(jwt_payload["user_uuid"], event)