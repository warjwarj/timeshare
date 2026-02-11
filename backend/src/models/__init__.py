from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
  pass

# Import all models so they are registered with Base.metadata
from src.models.organisation_model import OrganisationModel
from src.models.user_model import UserModel
from src.models.event_model import EventModel
from src.models.availability_rule_model import AvailabilityRuleModel
from src.models.organisation_user_model import OrganisationUserModel
from src.models.organisation_event_model import OrganisationEventModel
from src.models.user_event_model import UserEventModel
