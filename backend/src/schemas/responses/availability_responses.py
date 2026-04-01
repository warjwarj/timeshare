from typing import Optional
from datetime import datetime, time
from dataclasses import dataclass
from pydantic_extra_types.timezone_name import TimeZoneName

from src.schemas.dtos.day_availability import DayAvailability


@dataclass
class SafeAvailabilityRuleDTO:
  """

  DTO for communicating an availability rule.
  Omits sensitive data.

  """
  uuid: str
  name: str
  prevents_booking: bool = None
  iana_timezone: TimeZoneName = None
  weekdays: Optional[list[int]] = None
  start_time: Optional[time] = None
  end_time: Optional[time] = None
  start_datetime: Optional[datetime] = None
  end_datetime: Optional[datetime] = None
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None


@dataclass
class GetAvailabilityResponse:
  """

  DTO for communicating a users availability.

  """
  user_uuid: str
  list[DayAvailability]
