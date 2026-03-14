from typing import Optional
from datetime import datetime
from dataclasses import dataclass


@dataclass
class UserEventDTO:
  """
  DTO for the user-event junction.
  """
  user_id: int
  event_id: int
  role: str
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None
