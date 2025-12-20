from fastapi import APIRouter
import json
import logging
import os

from src.dependancies.auth_deps import IsAuthedDep
from src.services.events_service import get_all_events, add_event

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

@events_router.get("/all")
async def all(jwt_payload: IsAuthedDep):
  return get_all_events(jwt_payload["user_uuid"])

@events_router.post("/add")
async def add(jwt_payload: IsAuthedDep):
  add_event("asasd")
  return True

@events_router.get("/testevents")
async def testevents(jwt_payload: IsAuthedDep):
  filename = os.path.join(os.path.dirname(__file__), "./testevents.json")
  with open(filename) as f:
    return json.load(f)

@events_router.get("/testevents/{id}")
async def testevents_id(
    id: str,
    jwt_payload: IsAuthedDep
):
  print(jwt_payload)
  filename = os.path.join(os.path.dirname(__file__), "./testevents.json")
  with open(filename) as f:
    jsn = json.load(f)
    return [ev for ev in jsn if ev["id"] == id]

# # create event
# @app.post("/api/create_event/")
# async def create_event(req: CreateEvent) -> EventModel:
#   event = EventModel(
#     id=str(uuid.uuid4()),
#     **req.model_dump()
#   )
#   return event