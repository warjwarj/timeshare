from typing import Optional
from datetime import datetime, time
from dataclasses import dataclass
from uuid import UUID
  

@dataclass
class AvailabilityRuleDTO:
  """
  
  DTO for communicating an availability rule.
  
  """
  uuid: str
  name: str
  created_by_user_uuid: str
  prevents_booking: bool = None
  weekdays: Optional[list[int]] = None
  start_time: Optional[time] = None
  end_time: Optional[time] = None
  start_datetime: Optional[datetime] = None
  end_datetime: Optional[datetime] = None