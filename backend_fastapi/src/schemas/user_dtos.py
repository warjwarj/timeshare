from datetime import datetime
from typing import Optional
from dataclasses import dataclass

@dataclass
class UserDTO:
  """
  
  DTO for communicating information pertaining to a user.
  
  """
  id: Optional[str]
  name: str
  email: str
  password: Optional[str]
  role: str