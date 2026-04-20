from typing import Optional
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class SafeOrganisationDTO(BaseModel):
  """

  DTO for communicating an organisation.
  Omits sensitive data.

  """
  uuid: UUID
  name: str
  parent_id: int | None = None
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None
