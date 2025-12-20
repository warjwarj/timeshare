from pydantic import BaseModel, Field, field_validator
from datetime import datetime



class EventDTO():
  """
  
  EventDTO
  
  """
  
  uuid: str
  start: datetime
  end: datetime
  title: str
  colour: str