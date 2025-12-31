import logging
from fastapi import APIRouter
from datetime import datetime, timezone


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

common_router = APIRouter(
  prefix="/common", 
  tags=["common"]
)

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Routes
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

@common_router.get("/current-datetime")
async def get_current_datetime():
  """
  Returns the current datetime in UTC
  """
  return {
    "datetime": datetime.now(timezone.utc).isoformat(),
    "timezone": "UTC"
  }