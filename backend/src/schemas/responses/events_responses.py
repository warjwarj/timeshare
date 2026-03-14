from typing import Optional
from datetime import datetime
from dataclasses import dataclass
from uuid import UUID
from pydantic import BaseModel


class SafeEventDTO(BaseModel):
  """

  DTO for communicating an event DTO.
  Omits sensitive data.

  """
  uuid: UUID
  start: datetime
  end: datetime
  iana_timezone: str
  name: str
  colour: str
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None
