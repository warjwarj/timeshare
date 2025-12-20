from typing import Optional
from datetime import datetime
from dataclasses import dataclass
from uuid import UUID
  

@dataclass
class UserDTO:
  """
  
  DTO for communicating information pertaining to a user.
  
  """
  name: str
  email: str
  role: Optional[str] = None
  uuid: Optional[UUID] = None
  password: Optional[str] = None
  created_at: Optional[datetime] = None