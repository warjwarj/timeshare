from typing import Optional
from datetime import datetime
from dataclasses import dataclass

from src.utils.organisation_user_role import OrganisationUserRole


@dataclass
class OrganisationUserDTO:
  """
  DTO for the organisation-user junction.
  """
  org_id: int
  user_id: int
  role: OrganisationUserRole
  is_default: bool
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None
