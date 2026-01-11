from pydantic import Field, field_validator, model_validator, BaseModel
from datetime import datetime, time


class CreateAvailabilityRuleRequest(BaseModel):
  """
  Request schema for creating an availability rule
  """
  name: str = Field(min_length=1, max_length=255)
  prevents_booking: bool
  weekdays: list[int] | None = Field(default=None)
  start_time: time | None = Field(default=None)
  end_time: time | None = Field(default=None)
  start_date: datetime | None = Field(default=None)
  end_date: datetime | None = Field(default=None)

  @field_validator('weekdays')
  @classmethod
  def validate_weekdays(cls, v: list[int] | None) -> list[int] | None:
    """Ensure weekdays are valid (0-6 for Monday-Sunday)"""
    if v is not None:
      for day in v:
        if day < 0 or day > 6:
          raise ValueError('Weekday must be between 0 (Monday) and 6 (Sunday)')
    return v

  @field_validator('start_date', 'end_date')
  @classmethod
  def validate_datetime_not_naive(cls, v: datetime | None) -> datetime | None:
    """Ensure datetime has timezone information if provided"""
    if v is not None and (v.tzinfo is None or v.tzinfo.utcoffset(v) is None):
      raise ValueError('Datetime must be timezone-aware')
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
    """Ensure end_date is after start_date if both are provided"""
    if self.start_date is not None and self.end_date is not None:
      if self.end_date <= self.start_date:
        raise ValueError('End date must be after start date')
    return self


class UpdateAvailabilityRuleRequest(BaseModel):
  """
  Request schema for updating an availability rule
  """
  uuid: str
  name: str = Field(min_length=1, max_length=255)
  prevents_booking: bool
  weekdays: list[int] | None = Field(default=None)
  start_time: time | None = Field(default=None)
  end_time: time | None = Field(default=None)
  start_date: datetime | None = Field(default=None)
  end_date: datetime | None = Field(default=None)

  @field_validator('weekdays')
  @classmethod
  def validate_weekdays(cls, v: list[int] | None) -> list[int] | None:
    """Ensure weekdays are valid (0-6 for Monday-Sunday)"""
    if v is not None:
      for day in v:
        if day < 0 or day > 6:
          raise ValueError('Weekday must be between 0 (Monday) and 6 (Sunday)')
    return v

  @field_validator('start_date', 'end_date')
  @classmethod
  def validate_datetime_not_naive(cls, v: datetime | None) -> datetime | None:
    """Ensure datetime has timezone information if provided"""
    if v is not None and (v.tzinfo is None or v.tzinfo.utcoffset(v) is None):
      raise ValueError('Datetime must be timezone-aware')
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
    """Ensure end_date is after start_date if both are provided"""
    if self.start_date is not None and self.end_date is not None:
      if self.end_date <= self.start_date:
        raise ValueError('End date must be after start date')
    return self


class CreateMultipleAvailabilityRulesRequest(BaseModel):
  """
  Multiple availability rule requests in one go
  """
  rules: list[CreateAvailabilityRuleRequest]
