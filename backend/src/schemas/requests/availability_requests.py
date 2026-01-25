from typing import Annotated, Optional
from zoneinfo import ZoneInfo
from pydantic import BeforeValidator, Field, field_serializer, field_validator, model_validator, BaseModel
from pydantic_extra_types.timezone_name import TimeZoneName
from datetime import datetime, time

def empty_str_to_none(val):
    if val is None:
        return None
    if isinstance(val, str) and (val == "" or val.isspace()):
        return None
    return val

OptionalTime = Annotated[time | None, BeforeValidator(empty_str_to_none)]
OptionalDatetime = Annotated[datetime | None, BeforeValidator(empty_str_to_none)]

class CreateAvailabilityRuleRequest(BaseModel):
  """
  Request schema for creating an availability rule
  """
  name: str = Field(min_length=1, max_length=255)
  prevents_booking: bool | None
  iana_timezone: TimeZoneName | None
  weekdays: list[int] | None = Field(default=None)
  start_time: OptionalTime = Field(default=None)
  end_time: OptionalTime = Field(default=None)
  start_datetime: OptionalDatetime = Field(default=None)
  end_datetime: OptionalDatetime = Field(default=None)

  @field_validator('weekdays')
  @classmethod
  def validate_weekdays(cls, v: list[int] | None) -> list[int] | None:
    """Ensure weekdays are valid (0-6 for Monday-Sunday)"""
    if v is not None:
      for day in v:
        if day < 0 or day > 6:
          raise ValueError('Weekday must be between 0 (Monday) and 6 (Sunday)')
    return v

  @model_validator(mode='after')
  def validate_time_range(self) -> 'CreateAvailabilityRuleRequest':
    """Ensure end_time is after start_time if both are provided"""
    if self.start_time is not None and self.end_time is not None:
      if self.end_time <= self.start_time:
        raise ValueError('End time must be after start time')
    return self

  @model_validator(mode='after')
  def validate_date_range(self) -> 'CreateAvailabilityRuleRequest':
    """Ensure end_datetime is after start_datetime if both are provided"""
    if self.start_datetime is not None and self.end_datetime is not None:
      if self.end_datetime <= self.start_datetime:
        raise ValueError('End date must be after start date')
    return self


class UpdateAvailabilityRuleRequest(BaseModel):
  """
  Request schema for updating an availability rule
  """
  name: str = Field(min_length=1, max_length=255)
  prevents_booking: bool | None
  weekdays: list[int] | None = Field(default=None)
  start_time: OptionalTime = Field(default=None)
  end_time: OptionalTime = Field(default=None)
  start_datetime: OptionalDatetime = Field(default=None)
  end_datetime: OptionalDatetime = Field(default=None)

  @field_validator('weekdays')
  @classmethod
  def validate_weekdays(cls, v: list[int] | None) -> list[int] | None:
    """Ensure weekdays are valid (0-6 for Monday-Sunday)"""
    if v is not None:
      for day in v:
        if day < 0 or day > 6:
          raise ValueError('Weekday must be between 0 (Monday) and 6 (Sunday)')
    return v

  @model_validator(mode='after')
  def validate_time_range(self) -> 'UpdateAvailabilityRuleRequest':
    """Ensure end_time is after start_time if both are provided"""
    if self.start_time is not None and self.end_time is not None:
      if self.end_time <= self.start_time:
        raise ValueError('End time must be after start time')
    return self

  @model_validator(mode='after')
  def validate_date_range(self) -> 'UpdateAvailabilityRuleRequest':
    """Ensure end_datetime is after start_datetime if both are provided"""
    if self.start_datetime is not None and self.end_datetime is not None:
      if self.end_datetime <= self.start_datetime:
        raise ValueError('End date must be after start date')
    return self


class CreateMultipleAvailabilityRulesRequest(BaseModel):
  """
  Multiple availability rule requests in one go
  """
  rules: list[CreateAvailabilityRuleRequest]
