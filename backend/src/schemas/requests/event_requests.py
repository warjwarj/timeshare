from typing import Annotated
from pydantic import BeforeValidator, Field, field_validator, model_validator, BaseModel
from pydantic_extra_types.timezone_name import TimeZoneName
from datetime import datetime

from src.schemas.dtos.event_dto import EventDTO


def empty_str_to_none(val):
  if val is None:
    return None
  if isinstance(val, str) and (val == "" or val.isspace()):
    return None
  return val


OptionalDatetime = Annotated[datetime | None, BeforeValidator(empty_str_to_none)]


class CreateEventRequest(BaseModel):
  """
  Request schema for adding an event
  """
  start: OptionalDatetime
  end: OptionalDatetime
  iana_timezone: TimeZoneName | None
  name: str = Field(min_length=1, max_length=100)
  colour: str = Field(pattern=r"^#(?:[0-9a-fA-F]{3}){1,2}$")  # check colour is in hex code format

  @model_validator(mode='after')
  def validate_end_after_start(self) -> 'CreateEventRequest':
    """Ensure end datetime is after start datetime"""
    if self.end <= self.start:
      raise ValueError('End datetime must be after start datetime')
    return self


class UpdateEventRequest(BaseModel):
  """
  Request schema for updating an event
  """
  start: OptionalDatetime
  end: OptionalDatetime
  name: str = Field(min_length=1, max_length=100)
  colour: str = Field(pattern=r"^#(?:[0-9a-fA-F]{3}){1,2}$")  # check colour is in hex code format

  @model_validator(mode='after')
  def validate_end_after_start(self) -> 'CreateEventRequest':
    """Ensure end datetime is after start datetime"""
    if self.end <= self.start:
      raise ValueError('End datetime must be after start datetime')
    return self

  def map_to_dto(self) -> EventDTO:
    """
    Map request to DTO with additional fields
    """
    return EventDTO(
        start=self.start,
        end=self.end,
        iana_timezone=self.iana_timezone,
        name=self.name,
        colour=self.colour,
    )
