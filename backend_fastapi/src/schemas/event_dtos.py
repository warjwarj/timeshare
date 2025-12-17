from pydantic import BaseModel, Field, field_validator
from datetime import datetime



class EventDTO():
  """
  
  EventDTO
  
  """
  
  id: str
  start: str
  end: str
  title: str
  colour: str