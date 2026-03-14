from typing import Optional
from datetime import datetime
from dataclasses import dataclass
from uuid import UUID
  

@dataclass
class OrganisationDTO:
  """
  
  DTO for communicating information pertaining to a user.
  
  """
  id: int
  uuid: UUID
  name: str
  parent_id: int
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None