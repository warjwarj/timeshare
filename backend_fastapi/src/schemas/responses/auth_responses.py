from pydantic import BaseModel
from dataclasses import dataclass
from datetime import datetime
from typing import Annotated
from typing import Optional
from pydantic import StringConstraints
from uuid import UUID

class LoginResponse(BaseModel):
  """
  Dataclass for responding to a login request
  """
  success: bool
  access_token: str
  token_type: Optional[Annotated[str, StringConstraints(max_length=255)]]

@dataclass
class JwtPayload:
  """
  Dataclass epresents the data encoded into a jwt payaload
  """
  user_uuid: str
  role: str
  expires_at: datetime
  iat: datetime