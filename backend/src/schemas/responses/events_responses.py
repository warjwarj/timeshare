from typing import Optional
from datetime import datetime
from dataclasses import dataclass
from pydantic import BaseModel


class SafeEventDTO(BaseModel):
  """

  DTO for communicating an event DTO.
  Omits sensitive data.

  """
  uuid: str
  start: datetime
  end: datetime
  name: str
  colour: str
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None
