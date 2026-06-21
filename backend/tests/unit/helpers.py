"""
Shared test helpers, importable from any test module.

All DTO factories live here so they can be reused across test modules.

Usage:
    from tests.unit.helpers import make_ctx, make_user_dto, make_event_dto
"""
from datetime import datetime, timedelta, timezone
from uuid import UUID, uuid4

from src.schemas.dtos.user_dto import UserDTO
from src.schemas.dtos.organisation_dto import OrganisationDTO
from src.schemas.dtos.organisation_user_dto import OrganisationUserDTO
from src.schemas.dtos.request_context import RequestContext
from src.schemas.dtos.event_dto import EventDTO
from src.schemas.dtos.availability_rule_dto import AvailabilityRuleDTO
from src.utils.organisation_user_role import OrganisationUserRole

USER_UUID = "00000000-0000-0000-0000-000000000000"
USER_ID = 42

ORG_UUID = "11111111-1111-1111-1111-111111111111"
ORG_ID = 7


# ---------------------------------------------------------------------------
# user / organisation / junction
# ---------------------------------------------------------------------------


def make_user_dto() -> UserDTO:
  return UserDTO(
      id=USER_ID,
      uuid=UUID(USER_UUID),
      name="Test User",
      email="test@test.com",
      colour="#ffffff"
  )


def make_org_dto() -> OrganisationDTO:
  return OrganisationDTO(
      id=ORG_ID,
      uuid=UUID(ORG_UUID),
      name="Test Organisation",
      parent_id=0,
  )


def make_org_user_dto(
    role: OrganisationUserRole = OrganisationUserRole.org_admin,
    is_default: bool = True,
) -> OrganisationUserDTO:
  """The organisation-user junction record linking USER_ID to ORG_ID."""
  return OrganisationUserDTO(
      org_id=ORG_ID,
      user_id=USER_ID,
      role=role,
      is_default=is_default,
  )


def make_ctx(
    role: OrganisationUserRole = OrganisationUserRole.org_admin,
) -> RequestContext:
  """
  Fully populated request context: the authenticated user, their
  organisation, and the organisation-user junction record.
  """
  return RequestContext(
      user=make_user_dto(),
      org=make_org_dto(),
      org_user=make_org_user_dto(role=role),
  )


# ---------------------------------------------------------------------------
# availability rules
# ---------------------------------------------------------------------------


def make_rule_dto() -> AvailabilityRuleDTO:
  return AvailabilityRuleDTO(
      id=1,
      uuid=uuid4(),
      name="Test Rule",
      start_datetime=datetime(2026, 2, 28, 0, 0, 0),
      end_datetime=datetime(2026, 3, 3, 23, 59, 59),
      user_id=USER_ID,
      iana_timezone="Europe/London",
      prevents_booking=False,
  )


def make_allowing_rule(**overrides) -> AvailabilityRuleDTO:
  """An allowing (non-blocking) rule spanning the whole test window."""
  defaults = dict(
      id=1,
      uuid=uuid4(),
      name="Allowing Rule",
      start_datetime=datetime(2026, 2, 28, 0, 0, 0),
      end_datetime=datetime(2026, 3, 10, 23, 59, 59),
      user_id=USER_ID,
      iana_timezone="Europe/London",
      prevents_booking=False,
  )
  defaults.update(overrides)
  return AvailabilityRuleDTO(**defaults)


# ---------------------------------------------------------------------------
# events
# ---------------------------------------------------------------------------


def make_event(start: datetime, end: datetime, **overrides) -> EventDTO:
  defaults = dict(
      id=1,
      uuid=uuid4(),
      start=start,
      end=end,
      iana_timezone="Europe/London",
      blocking=True,
      name="Busy",
      colour="#000000",
  )
  defaults.update(overrides)
  return EventDTO(**defaults)


def make_event_dto() -> EventDTO:
  now = datetime.now(timezone.utc)
  return EventDTO(
      id=1,
      uuid=uuid4(),
      start=now,
      end=now + timedelta(hours=1),
      iana_timezone="Europe/London",
      name="Test Event",
      colour="#4A90E2",
      blocking=True,
  )

# ---------------------------------------------------------------------------
# user / organisation / junction
# ---------------------------------------------------------------------------