from datetime import datetime
from typing import Optional
from dataclasses import dataclass
from uuid import UUID

@dataclass
class EventDTO():
  """  
  EventDTO  
  """
  id: int
  uuid: UUID
  start: datetime
  end: datetime
  iana_timezone: str
  name: str
  colour: str
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None