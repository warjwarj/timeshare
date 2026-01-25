from datetime import datetime
from typing import Optional
from dataclasses import dataclass

@dataclass
class EventDTO():
  """  
  EventDTO  
  """
  
  uuid: Optional[str]
  start: datetime
  end: datetime
  iana_timezone: str
  name: str
  colour: str
  created_by_user_uuid: str
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None