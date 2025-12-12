from fastapi import APIRouter
import json
import logging
import os
from src.dependancies.auth_deps import IsAuthedDep

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

# get testevents
@events_router.get("/testevents")
async def testevents(jwt_payload: IsAuthedDep):
  filename = os.path.join(os.path.dirname(__file__), "./testevents.json")
  with open(filename) as f:
    return json.load(f)

# get testevent by id
@events_router.get("/testevents/{id}")
async def testevents_id(
    id: str,
    jwt_payload: IsAuthedDep
):
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