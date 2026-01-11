from typing import Optional
from datetime import datetime, time
from dataclasses import dataclass
  

@dataclass
class SafeAvailabilityRuleDTO:
  """
  
  DTO for communicating an availability rule.
  Omits sensitive data.
  
  """
  name: str
  prevents_booking: bool = None
  weekdays: Optional[list[int]] = None
  start_time: Optional[time] = None
  end_time: Optional[time] = None
  start_datetime: Optional[datetime] = None
  end_datetime: Optional[datetime] = None