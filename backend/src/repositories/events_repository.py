import logging
from datetime import datetime

from src.models.event_model import EventModel
from src.schemas.dtos.event_dto import EventDTO
from src.repositories.repository import Repository
from src.db.session import yield_session, DB_URL

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# EventRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class EventsRepository(Repository[EventModel, EventDTO]):
  """  
  Repository for events  
  """
  model_class = EventModel
  
  def get_events_by_datetimes(self, user_uuid: str, start: datetime, end: datetime):
    """
    Get all events visible to user, within the given timespan
    """
    try:

      with yield_session(DB_URL) as session:
        records = session.query(self.model_class).filter_by(
            created_by_user_uuid=user_uuid
          ).filter(
            self.model_class.start <= end,
            self.model_class.end >= start
          ).all()
        if records:
          return [r.map_to_dto() for r in records]
      return []

    except Exception as e:
      print(f"ERROR GETTING RECORD: {e}")
  
  def add_event(self, user_uuid: str, start: datetime, end: datetime):
    """
    Get all events visible to user, within the given timespan
    """
    try:

      with yield_session(DB_URL) as session:
        records = session.query(self.model_class).filter_by(
            created_by_user_uuid=user_uuid
          ).filter(
            self.model_class.start <= end,
            self.model_class.end >= start
          ).all()
        if records:
          return [r.map_to_dto() for r in records]
      return []

    except Exception as e:
      print(f"ERROR GETTING RECORD: {e}")