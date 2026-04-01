"""
Unit tests for availability_service.py.

All repository interactions are mocked — no database required.
Run with: cd backend && pytest tests/unit -v
"""
from datetime import datetime

import pytest
from uuid import uuid4, UUID

from src.schemas.dtos.user_dto import UserDTO
from src.services.availability_service import (
    calculate_day_availability,
    create_availability_rule,
    get_availability_rules_for_user,
    get_availability_rule,
    update_availability_rule,
    delete_availability_rule,
    sanitise_availability_rule,
)
from src.schemas.dtos.availability_rule_dto import AvailabilityRuleDTO
from src.schemas.responses.availability_responses import SafeAvailabilityRuleDTO
from src.schemas.requests.availability_requests import (
    CreateAvailabilityRuleRequest,
    GetAvailabilityRequest,
    UpdateAvailabilityRuleRequest,
)

pytestmark = pytest.mark.unit

USER_UUID = "00000000-0000-0000-0000-000000000000"
USER_ID = 42

# ---------------------------------------------------------------------------
# helpers
# ---------------------------------------------------------------------------


def make_user_dto() -> UserDTO:
  return UserDTO(
      id=USER_ID,
      uuid=UUID(USER_UUID),
      name="Test User",
      email="test@test.com",
  )


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


def make_get_availability_request() -> GetAvailabilityRequest:
  return GetAvailabilityRequest(
      user_uuid=USER_UUID,
      start_datetime=datetime(2026, 3, 1, 23, 59, 59),
      end_datetime=datetime(2026, 3, 4, 23, 59, 59)
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

  result = update_availability_rule("some-uuid", make_update_request())

  assert isinstance(result, SafeAvailabilityRuleDTO)


# ---------------------------------------------------------------------------
# delete_availability_rule
# ---------------------------------------------------------------------------

def test_delete_rule_returns_safe_dto(mocker):
  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.delete_record.return_value = make_rule_dto()

  result = delete_availability_rule("some-uuid")

  assert isinstance(result, SafeAvailabilityRuleDTO)


def test_delete_rule_returns_none_when_not_found(mocker):
  mock_avail_repo = mocker.patch("src.services.availability_service.availability_repo")
  mock_avail_repo.delete_record.return_value = None

  result = delete_availability_rule("some-uuid")

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


# ---------------------------------------------
# calculate availability
# ---------------------------------------------

def test_calculate_day_availability(mocker):
  req = make_get_availability_request()
  dto1 = AvailabilityRuleDTO(
      id=1,
      uuid=uuid4(),
      name="Test Rule1",
      start_datetime=datetime(2026, 2, 28, 0, 0, 0),
      end_datetime=datetime(2026, 3, 3, 23, 59, 59),
      user_id=USER_ID,
      iana_timezone="Europe/London",
      prevents_booking=False,
  )
  dto2 = AvailabilityRuleDTO(
      id=2,
      uuid=uuid4(),
      name="Test Rule2",
      start_datetime=datetime(2026, 2, 28, 0, 0, 0),
      end_datetime=datetime(2026, 3, 3, 23, 59, 59),
      user_id=USER_ID,
      iana_timezone="Europe/London",
      prevents_booking=False,
  )
  dto3 = AvailabilityRuleDTO(
      id=3,
      uuid=uuid4(),
      name="Test Rule3",
      start_datetime=datetime(2026, 3, 6, 0, 0, 0),
      end_datetime=datetime(2026, 3, 20, 23, 59, 59),
      user_id=USER_ID,
      iana_timezone="Europe/London",
      prevents_booking=False,
  )
  dto4 = AvailabilityRuleDTO(
      id=3,
      uuid=uuid4(),
      name="Test Rule4",
      start_datetime=datetime(2026, 3, 15, 0, 0, 0),
      end_datetime=datetime(2026, 3, 25, 23, 59, 59),
      user_id=USER_ID,
      iana_timezone="Europe/London",
      prevents_booking=False,
  )
  res = calculate_day_availability(req, [dto1, dto2, dto3, dto4])
  assert True
