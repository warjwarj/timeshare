from fastapi import APIRouter
import json
import logging
from http import HTTPStatus
import os

from src.dependancies.auth_deps import IsAuthedDep
from src.services.events_service import get_all_events, create_event, create_multiple_events
from src.schemas.requests.event_requests import CreateEventRequest, CreateMultipleEventsRequest

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

@events_router.get("/all", status_code=HTTPStatus.OK)
async def all(jwt_payload: IsAuthedDep):
  """
  Get all events visible to user.
  """
  return get_all_events(jwt_payload["user_uuid"])

@events_router.post("/create", status_code=HTTPStatus.CREATED)
async def create(jwt_payload: IsAuthedDep, event: CreateEventRequest):
  """
  Create an event.
  """
  return create_event(jwt_payload["user_uuid"], event)

@events_router.post("/create-multiple", status_code=HTTPStatus.CREATED)
async def create(jwt_payload: IsAuthedDep, event: CreateMultipleEventsRequest):
  """
  Create multiple events
  """
  return create_multiple_events(jwt_payload["user_uuid"], event)