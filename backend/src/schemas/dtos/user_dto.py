from typing import Optional
from datetime import datetime
from dataclasses import dataclass
from uuid import UUID


@dataclass
class UserDTO:
  """
  DTO for communicating information pertaining to a user.  
  """
  id: int
  uuid: UUID
  name: str
  email: str
  colour: str
  role: Optional[str] = None
  password: Optional[str] = None
  created_at: Optional[datetime] = None
  updated_at: Optional[datetime] = None
