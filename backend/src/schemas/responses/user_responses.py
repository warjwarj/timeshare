from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class SafeUserDTO(BaseModel):
  """

  DTO for communicating a user.
  Omits sensitive data.

  """
  uuid: UUID
  name: str | None
  email: str | None
  role: str | None = None
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None
