from pydantic import BaseModel, Field
from datetime import datetime

class EventModel(BaseModel):
  """Event model"""
  id: str
  start: datetime
  end: datetime
  title: str = Field(min_length=1, max_length=100)
  colour: str = Field(pattern=r"^#(?:[0-9a-fA-F]{3}){1,2}$") # check colour is in hex code format