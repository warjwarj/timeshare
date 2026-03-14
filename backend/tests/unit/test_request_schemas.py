"""
Unit tests for request schema validation.

Pure Pydantic validation — no mocking, no DB required.
Run with: cd backend && pytest tests/unit/test_request_schemas.py -v
"""
import pytest
from datetime import datetime, timedelta, timezone
from pydantic import ValidationError

from src.schemas.requests.event_requests import (
    CreateEventRequest,
    UpdateEventRequest,
    empty_str_to_none,
)
from src.schemas.requests.availability_requests import (
    CreateAvailabilityRuleRequest,
    UpdateAvailabilityRuleRequest,
)

pytestmark = pytest.mark.unit


# ===========================================================================
# Helpers
# ===========================================================================

def _now() -> datetime:
    return datetime.now(timezone.utc)


def valid_event_payload(**overrides) -> dict:
    now = _now()
    base = {
        "name": "Test Event",
        "colour": "#4A90E2",
        "iana_timezone": "Europe/London",
        "start": now,
        "end": now + timedelta(hours=1),
    }
    base.update(overrides)
    return base


def valid_rule_payload(**overrides) -> dict:
    base = {
        "name": "Test Rule",
        "prevents_booking": True,
        "iana_timezone": "Europe/London",
    }
    base.update(overrides)
    return base


# ===========================================================================
# CreateEventRequest
# ===========================================================================

def test_create_event_valid():
    req = CreateEventRequest(**valid_event_payload())
    assert req.name == "Test Event"
    assert req.colour == "#4A90E2"


def test_create_event_end_before_start_raises():
    now = _now()
    with pytest.raises(ValidationError):
        CreateEventRequest(**valid_event_payload(
            start=now + timedelta(hours=1),
            end=now,
        ))


def test_create_event_end_equals_start_raises():
    now = _now()
    with pytest.raises(ValidationError):
        CreateEventRequest(**valid_event_payload(start=now, end=now))


def test_create_event_invalid_colour_raises():
    with pytest.raises(ValidationError):
        CreateEventRequest(**valid_event_payload(colour="red"))


def test_create_event_shorthand_hex_colour_valid():
    req = CreateEventRequest(**valid_event_payload(colour="#FFF"))
    assert req.colour == "#FFF"


def test_create_event_name_too_long_raises():
    with pytest.raises(ValidationError):
        CreateEventRequest(**valid_event_payload(name="x" * 101))


def test_create_event_empty_name_raises():
    with pytest.raises(ValidationError):
        CreateEventRequest(**valid_event_payload(name=""))


def test_create_event_empty_string_datetime_becomes_none():
    """BeforeValidator converts empty string to None before model validation."""
    assert empty_str_to_none("") is None
    assert empty_str_to_none("   ") is None
    assert empty_str_to_none(None) is None
    assert empty_str_to_none("2024-01-01") == "2024-01-01"


# ===========================================================================
# UpdateEventRequest
# ===========================================================================

def test_update_event_valid():
    now = _now()
    req = UpdateEventRequest(
        name="Updated Event",
        colour="#ABC123",
        start=now,
        end=now + timedelta(hours=2),
    )
    assert req.name == "Updated Event"


def test_update_event_end_before_start_raises():
    now = _now()
    with pytest.raises(ValidationError):
        UpdateEventRequest(
            name="Bad Event",
            colour="#4A90E2",
            start=now + timedelta(hours=1),
            end=now,
        )


def test_update_event_invalid_colour_raises():
    now = _now()
    with pytest.raises(ValidationError):
        UpdateEventRequest(
            name="Event",
            colour="blue",
            start=now,
            end=now + timedelta(hours=1),
        )


# ===========================================================================
# CreateAvailabilityRuleRequest
# ===========================================================================

def test_create_rule_valid_minimal():
    req = CreateAvailabilityRuleRequest(**valid_rule_payload())
    assert req.name == "Test Rule"
    assert req.prevents_booking is True
    assert req.weekdays is None


def test_create_rule_weekday_too_high_raises():
    with pytest.raises(ValidationError):
        CreateAvailabilityRuleRequest(**valid_rule_payload(weekdays=[7]))


def test_create_rule_weekday_negative_raises():
    with pytest.raises(ValidationError):
        CreateAvailabilityRuleRequest(**valid_rule_payload(weekdays=[-1]))


def test_create_rule_all_valid_weekdays():
    req = CreateAvailabilityRuleRequest(**valid_rule_payload(weekdays=[0, 1, 2, 3, 4, 5, 6]))
    assert req.weekdays == [0, 1, 2, 3, 4, 5, 6]


def test_create_rule_end_time_before_start_time_raises():
    from datetime import time
    with pytest.raises(ValidationError):
        CreateAvailabilityRuleRequest(**valid_rule_payload(
            start_time=time(14, 0),
            end_time=time(10, 0),
        ))


def test_create_rule_end_datetime_before_start_raises():
    now = _now()
    with pytest.raises(ValidationError):
        CreateAvailabilityRuleRequest(**valid_rule_payload(
            start_datetime=now + timedelta(hours=2),
            end_datetime=now,
        ))


def test_create_rule_name_empty_raises():
    with pytest.raises(ValidationError):
        CreateAvailabilityRuleRequest(**valid_rule_payload(name=""))


def test_create_rule_name_too_long_raises():
    with pytest.raises(ValidationError):
        CreateAvailabilityRuleRequest(**valid_rule_payload(name="x" * 256))


# ===========================================================================
# UpdateAvailabilityRuleRequest
# ===========================================================================

def test_update_rule_valid():
    from datetime import time
    now = _now()
    req = UpdateAvailabilityRuleRequest(
        name="Updated Rule",
        prevents_booking=False,
        weekdays=[0, 1, 4],
        start_time=time(9, 0),
        end_time=time(17, 0),
        start_datetime=now,
        end_datetime=now + timedelta(days=7),
    )
    assert req.name == "Updated Rule"
    assert req.prevents_booking is False
    assert req.weekdays == [0, 1, 4]
