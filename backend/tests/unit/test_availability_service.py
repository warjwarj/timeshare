"""
Unit tests for availability_service.py.

All repository interactions are mocked — no database required.
Run with: cd backend && pytest tests/unit -v
"""
from datetime import date, datetime

import pytest

from tests.unit.helpers import (
    USER_UUID,
    USER_ID,
    make_user_dto,
    make_ctx,
    make_rule_dto,
    make_allowing_rule,
    make_event,
)
from src.schemas.dtos.day_availability import DayAvailability
from src.services.availability_service import (
    calculate_day_availability,
    create_availability_rule,
    get_availability_for_user,
    get_availability_rules_for_user,
    get_availability_rule,
    update_availability_rule,
    delete_availability_rule,
    sanitise_availability_rule,
)
from src.schemas.responses.availability_responses import SafeAvailabilityRuleDTO
from src.schemas.requests.availability_requests import (
    CreateAvailabilityRuleRequest,
    GetAvailabilityRequest,
    UpdateAvailabilityRuleRequest,
)

pytestmark = pytest.mark.unit

# ---------------------------------------------------------------------------
# request helpers (DTO factories live in tests/unit/helpers.py)
# ---------------------------------------------------------------------------


def make_create_request() -> CreateAvailabilityRuleRequest:
  return CreateAvailabilityRuleRequest(
      name="Test Rule",
      prevents_booking=True,
      iana_timezone="Europe/London",
  )


def make_update_request() -> UpdateAvailabilityRuleRequest:
  return UpdateAvailabilityRuleRequest(
      name="Updated Rule",
      prevents_booking=False,
  )


def make_get_availability_request(
    start=datetime(2026, 3, 1, 0, 0, 0),
    end=datetime(2026, 3, 4, 0, 0, 0),
) -> GetAvailabilityRequest:
  return GetAvailabilityRequest(
      iana_timezone="Europe/London",
      start_datetime=start,
      end_datetime=end,
  )


# ---------------------------------------------------------------------------
# create_availability_rule
# ---------------------------------------------------------------------------


def test_create_rule_returns_safe_dto(mocker):
  mock_user_repo = mocker.patch("src.services.availability_service.user_repo")
  mock_user_repo.get_record.return_value = make_user_dto()

  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.add_record.return_value = make_rule_dto()

  result = create_availability_rule(USER_UUID, make_create_request())

  assert isinstance(result, SafeAvailabilityRuleDTO)


def test_create_rule_uses_user_id(mocker):
  """The user's DB id (not uuid) is passed to the availability repo."""
  mock_user_repo = mocker.patch("src.services.availability_service.user_repo")
  mock_user_repo.get_record.return_value = make_user_dto()

  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.add_record.return_value = make_rule_dto()

  create_availability_rule(USER_UUID, make_create_request())

  _, kwargs = mock_avail_repo.add_record.call_args
  assert kwargs.get("user_id") == USER_ID


# ---------------------------------------------------------------------------
# get_availability_rules_for_user
# ---------------------------------------------------------------------------

def test_get_rules_returns_empty_when_none(mocker):
  mock_user_repo = mocker.patch("src.services.availability_service.user_repo")
  mock_user_repo.get_record.return_value = make_user_dto()

  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.get_record.return_value = None

  result = get_availability_rules_for_user(user_uuid=USER_UUID)

  assert result == []


def test_get_rules_returns_sanitised_list(mocker):
  mock_user_repo = mocker.patch("src.services.availability_service.user_repo")
  mock_user_repo.get_record.return_value = make_user_dto()

  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.get_record.return_value = [make_rule_dto(), make_rule_dto()]

  result = get_availability_rules_for_user(user_uuid=USER_UUID)

  assert isinstance(result, list)
  assert all(isinstance(r, SafeAvailabilityRuleDTO) for r in result)


# ---------------------------------------------------------------------------
# get_availability_rule
# ---------------------------------------------------------------------------

def test_get_rule_not_found_returns_none(mocker):
  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.get_record.return_value = None

  result = get_availability_rule("some-uuid")

  assert result is None


def test_get_rule_found_returns_dto(mocker):
  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.get_record.return_value = make_rule_dto()

  result = get_availability_rule("some-uuid")

  assert isinstance(result, SafeAvailabilityRuleDTO)


# ---------------------------------------------------------------------------
# update_availability_rule
# ---------------------------------------------------------------------------

def test_update_rule_returns_safe_dto(mocker):
  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.update_record.return_value = make_rule_dto()

  result = update_availability_rule(make_ctx(), "some-uuid", make_update_request())

  assert isinstance(result, SafeAvailabilityRuleDTO)


# ---------------------------------------------------------------------------
# delete_availability_rule
# ---------------------------------------------------------------------------

def test_delete_rule_returns_safe_dto(mocker):
  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.delete_record.return_value = make_rule_dto()

  result = delete_availability_rule(make_ctx(), "some-uuid")

  assert isinstance(result, SafeAvailabilityRuleDTO)


def test_delete_rule_returns_none_when_not_found(mocker):
  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.delete_record.return_value = None

  result = delete_availability_rule(make_ctx(), "some-uuid")

  assert result is None


# ---------------------------------------------------------------------------
# sanitise_availability_rule
# ---------------------------------------------------------------------------

def test_sanitise_rule_strips_user_id_and_id():
  dto = make_rule_dto()
  result = sanitise_availability_rule(dto)

  assert isinstance(result, SafeAvailabilityRuleDTO)
  assert not hasattr(result, "user_id")
  assert not hasattr(result, "id")


# ---------------------------------------------------------------------------
# calculate_day_availability
# ---------------------------------------------------------------------------

def test_calculate_single_rule_full_day_when_no_events(mocker):
  """A rule covering the window with no events => every day is 'Full Day'."""
  mock_events = mocker.patch("src.services.availability_service.events_repo")
  mock_events.get_events_by_datetimes.return_value = []

  # Window is Mar 1 -> Mar 4 inclusive (4 days).
  result = calculate_day_availability(
      make_ctx(), make_get_availability_request(), [make_allowing_rule()]
  )

  assert len(result) == 4
  assert all(isinstance(da, DayAvailability) for da in result)
  assert all(da.brief == "Full Day" for da in result)


def test_calculate_weekday_restriction_blocks_non_matching_days(mocker):
  """Days whose weekday is not in rule.weekdays are marked 'None'."""
  mock_events = mocker.patch("src.services.availability_service.events_repo")
  mock_events.get_events_by_datetimes.return_value = []

  # 2026-03-01 is a Sunday (weekday 6); restrict the rule to Mon-Fri.
  rule = make_allowing_rule(weekdays=[0, 1, 2, 3, 4])
  result = calculate_day_availability(
      make_ctx(), make_get_availability_request(), [rule]
  )

  by_date = {da.date.date(): da for da in result}
  sunday = by_date[date(2026, 3, 1)]
  assert sunday.brief == "None"
  assert sunday.start_time is None and sunday.end_time is None

  monday = by_date[date(2026, 3, 2)]
  assert monday.brief == "Full Day"


def test_calculate_blocking_event_makes_day_unavailable(mocker):
  """A day falling fully inside a blocking event range is marked 'None'."""
  mock_events = mocker.patch("src.services.availability_service.events_repo")
  # Event spans Mar 2 00:00 -> Mar 4 00:00, so Mar 3 is strictly inside it.
  mock_events.get_events_by_datetimes.return_value = [
      make_event(datetime(2026, 3, 2, 0, 0, 0), datetime(2026, 3, 4, 0, 0, 0))
  ]

  result = calculate_day_availability(
      make_ctx(), make_get_availability_request(), [make_allowing_rule()]
  )

  by_date = {da.date.date(): da for da in result}
  assert by_date[date(2026, 3, 3)].brief == "None"
  assert by_date[date(2026, 3, 3)].start_time is None
  assert by_date[date(2026, 3, 3)].end_time is None


def test_calculate_events_queried_with_user_db_id(mocker):
  """Events are fetched using the context user's DB id."""
  mock_events = mocker.patch("src.services.availability_service.events_repo")
  mock_events.get_events_by_datetimes.return_value = []

  calculate_day_availability(
      make_ctx(), make_get_availability_request(), [make_allowing_rule()]
  )

  args, _ = mock_events.get_events_by_datetimes.call_args
  assert args[0] == USER_ID


def test_calculate_mismatched_timezones_raises(mocker):
  """Rules with differing timezones are rejected."""
  mocker.patch("src.services.availability_service.events_repo")

  rule1 = make_allowing_rule(iana_timezone="Europe/London")
  rule2 = make_allowing_rule(iana_timezone="America/New_York")

  with pytest.raises(RuntimeError):
    calculate_day_availability(
        make_ctx(), make_get_availability_request(), [rule1, rule2]
    )


def test_calculate_no_rules_returns_empty(mocker):
  mock_events = mocker.patch("src.services.availability_service.events_repo")
  mock_events.get_events_by_datetimes.return_value = []

  result = calculate_day_availability(
      make_ctx(), make_get_availability_request(), []
  )

  assert result == []


# ---------------------------------------------------------------------------
# get_availability_for_user
# ---------------------------------------------------------------------------

def test_get_availability_for_user_returns_day_list(mocker):
  mock_user_repo = mocker.patch("src.services.availability_service.user_repo")
  mock_user_repo.get_record.return_value = make_user_dto()

  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.get_multiple_records.return_value = [make_allowing_rule()]

  mock_events = mocker.patch("src.services.availability_service.events_repo")
  mock_events.get_events_by_datetimes.return_value = []

  result = get_availability_for_user(make_ctx(), make_get_availability_request())

  assert isinstance(result, list)
  assert len(result) == 4
  assert all(isinstance(da, DayAvailability) for da in result)


def test_get_availability_for_user_no_rules_returns_empty(mocker):
  mock_user_repo = mocker.patch("src.services.availability_service.user_repo")
  mock_user_repo.get_record.return_value = make_user_dto()

  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.get_multiple_records.return_value = None

  mock_events = mocker.patch("src.services.availability_service.events_repo")
  mock_events.get_events_by_datetimes.return_value = []

  result = get_availability_for_user(make_ctx(), make_get_availability_request())

  assert result == []
