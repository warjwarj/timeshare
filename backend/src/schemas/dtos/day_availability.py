from dataclasses import dataclass
from datetime import datetime, time
from typing import List, Literal, Tuple


@dataclass
class DayAvailability():
  """
  If brief description is part day then we use the times.
  Otherwise we'll just use the 
  """
  date: datetime
  blocking: bool
  brief: Literal["Full Day", "Part Day", "None"]
  start_time: time
  end_time: time
  blocked_segments: List[Tuple[time, time]]
