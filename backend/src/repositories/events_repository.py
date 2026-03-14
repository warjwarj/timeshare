import logging
from datetime import datetime

from sqlalchemy import select

from src.utils.organisation_event_role import OrganisationEventRole
from src.repositories.organisation_user_repository import OrganisationUserRepository
from src.repositories.organisation_event_repository import OrganisationEventRepository
from src.utils.user_event_role import UserEventRole
from src.repositories.user_event_repository import UserEventRepository
from src.models.user_event_model import UserEventModel
from src.repositories.users_repository import UserRepository
from src.models.event_model import EventModel
from src.schemas.dtos.event_dto import EventDTO
from src.repositories.repository import Repository
from src.db.session import yield_session, DB_URL

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

users_rep = UserRepository()
user_event_rep = UserEventRepository()
org_event_rep = OrganisationEventRepository()
org_user_rep = OrganisationUserRepository()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# EventRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


class EventsRepository(Repository[EventModel, EventDTO]):
  """  
  Repository for managing events, and those events relationships with other entities.
  """
  model_class = EventModel

  def add_record(self, user_id: str, **kwargs) -> EventDTO | None:
    """ 
    Add an event record, along with its associations.

    Args:
      user_uuid (str): uuid of user account making the request
    """
    # get user id and their org id
    user = users_rep.get_record(id=user_id)
    org_user = org_user_rep.get_record(user_id=user.id)

    # add recs
    event = super().add_record(**kwargs)
    user_event_rep.add_record(
        user_id=user.id,
        event_id=event.id,
        role=UserEventRole.admin
    )
    org_event_rep.add_record(
        org_id=org_user.org_id,
        event_id=event.id,
        role=OrganisationEventRole.created_in
    )
    return event

  def get_events_by_datetimes(self, user_id: str, start: datetime, end: datetime) -> list[EventDTO]:
    """
    Get events for user within the given timespan.

    Args:
      user_uuid (str): uuid of user account making the request
      start (datetime): start of timespan
      end (datetime): end of timespan
    """
    user = users_rep.get_record(id=user_id)
    with yield_session(DB_URL) as session:
      records = session.execute(
          select(EventModel)
          .join(UserEventModel, UserEventModel.event_id == EventModel.id)
          .filter(
              UserEventModel.user_id == user.id,
              self.model_class.start <= end,
              self.model_class.end >= start
          )).scalars().all()
      if records:
        return [r.map_to_dto() for r in records]
    return []
