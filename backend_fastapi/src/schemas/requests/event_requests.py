from pydantic import Field, field_validator, model_validator, BaseModel
from datetime import datetime

from src.schemas.dtos.event_dto import EventDTO

class CreateMultipleEventsRequest(BaseModel):
  """
  Multiple event requests in one go
  """
  events: list[CreateEventRequest]

class CreateEventRequest(BaseModel):
  """
  Request schema for adding an event
  """
  start: datetime
  end: datetime
  name: str = Field(min_length=1, max_length=100)
  colour: str = Field(pattern=r"^#(?:[0-9a-fA-F]{3}){1,2}$")  # check colour is in hex code format
  
  @field_validator('start', 'end')
  @classmethod
  def validate_datetime_not_naive(cls, v: datetime) -> datetime:
    """Ensure datetime has timezone information"""
    if v.tzinfo is None or v.tzinfo.utcoffset(v) is None:
      raise ValueError('Datetime must be timezone-aware')
    return v
  
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
      name=self.name,
      colour=self.colour,
    )