"""
Unit tests for events_service.py.

All repository interactions are mocked — no database required.
Run with: cd backend && pytest tests/unit -v
"""
import pytest
from datetime import datetime, timedelta, timezone

from tests.unit.helpers import make_ctx, make_event_dto
from src.services.events_service import (
    create_event,
    update_event,
    delete_event,
    get_all_events,
    sanitiseEvent,
)
from src.schemas.responses.events_responses import SafeEventDTO
from src.schemas.requests.event_requests import (
    CreateEventRequest,
    UpdateEventRequest,
)

pytestmark = pytest.mark.unit


def make_create_request() -> CreateEventRequest:
  now = datetime.now(timezone.utc)
  return CreateEventRequest(
      name="Test Event",
      colour="#4A90E2",
      iana_timezone="Europe/London",
      start=now,
      end=now + timedelta(hours=1),
      blocking=True,
  )


def make_update_request() -> UpdateEventRequest:
  now = datetime.now(timezone.utc)
  return UpdateEventRequest(
      name="Updated Event",
      colour="#4A90E2",
      start=now,
      end=now + timedelta(hours=1),
      blocking=True,
  )


# ---------------------------------------------------------------------------
# create_event
# ---------------------------------------------------------------------------

def test_create_event_returns_safe_dto(mocker):
  mock_repo = mocker.patch("src.services.events_service.events_repo")
  mock_repo.add_record.return_value = make_event_dto()

  result = create_event("user-uuid", make_create_request())

  assert isinstance(result, SafeEventDTO)
  assert hasattr(result, "uuid")


def test_create_event_repo_none_returns_none(mocker):
  mock_repo = mocker.patch("src.services.events_service.events_repo")
  mock_repo.add_record.return_value = None

  result = create_event("user-uuid", make_create_request())

  assert result is None


# ---------------------------------------------------------------------------
# update_event
# ---------------------------------------------------------------------------

def test_update_event_returns_safe_dto(mocker):
  mock_repo = mocker.patch("src.services.events_service.events_repo")
  mock_repo.update_record.return_value = make_event_dto()
  mock_repo = mocker.patch("src.services.events_service.user_event_repo")
  mock_repo.get_multiple_records.return_value = [make_user_eventa()]

  result = update_event(make_ctx(), "some-uuid", make_update_request())

  assert isinstance(result, SafeEventDTO)


def test_update_event_repo_none_returns_none(mocker):
  mock_repo = mocker.patch("src.services.events_service.events_repo")
  mock_repo.update_record.return_value = None

  result = update_event(make_ctx(), "some-uuid", make_update_request())

  assert result is None


# ---------------------------------------------------------------------------
# delete_event
# ---------------------------------------------------------------------------

def test_delete_event_returns_safe_dto(mocker):
  mock_repo = mocker.patch("src.services.events_service.events_repo")
  mock_repo.delete_record.return_value = make_event_dto()

  result = delete_event("some-uuid")

  assert isinstance(result, SafeEventDTO)


def test_delete_event_returns_none_when_not_found(mocker):
  mock_repo = mocker.patch("src.services.events_service.events_repo")
  mock_repo.delete_record.return_value = None

  result = delete_event("some-uuid")

  assert result is None


# ---------------------------------------------------------------------------
# get_all_events
# ---------------------------------------------------------------------------

def test_get_all_events_returns_safe_dtos(mocker):
  mock_repo = mocker.patch("src.services.events_service.events_repo")
  mock_repo.get_events_by_datetimes.return_value = [make_event_dto(), make_event_dto()]

  now = datetime.now(timezone.utc)
  result = get_all_events("user-uuid", now, now + timedelta(days=1))

  assert len(result) == 2
  assert all(isinstance(r, SafeEventDTO) for r in result)


def test_get_all_events_empty_list(mocker):
  mock_repo = mocker.patch("src.services.events_service.events_repo")
  mock_repo.get_events_by_datetimes.return_value = []

  now = datetime.now(timezone.utc)
  result = get_all_events("user-uuid", now, now + timedelta(days=1))

  assert result == []

# ---------------------------------------------------------------------------
# sanitiseEvent
# ---------------------------------------------------------------------------


def test_sanitise_event_strips_id():
  dto = make_event_dto()
  result = sanitiseEvent(dto)

  assert isinstance(result, SafeEventDTO)
  assert not hasattr(result, "id")
