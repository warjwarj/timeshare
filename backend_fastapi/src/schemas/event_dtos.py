from pydantic import BaseModel, Field, field_validator
from datetime import datetime

class CreateEvent(BaseModel):
  """DTO for the creation of an event"""
  start: datetime
  end: datetime
  title: str = Field(min_length=1, max_length=100)
  colour: str = Field(pattern=r"^#(?:[0-9a-fA-F]{3}){1,2}$")
  
  @field_validator('end')
  @classmethod
  def end_must_be_after_start(cls, v, info):
    """validate start and end dates"""
    if 'start' in info.data and v <= info.data['start']:
        raise ValueError('end time must be after start time')
    return v
  
  @field_validator('colour')
  @classmethod
  def normalize_colour(cls, v):
      """Normalize colour to uppercase"""
      return v.upper()