from typing import Optional
from datetime import datetime
from dataclasses import dataclass


@dataclass
class OrganisationEventDTO:
  """
  DTO for the organisation-event junction.
  """
  org_id: int
  event_id: int
  role: str
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None
