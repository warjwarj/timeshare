from pydantic import BaseModel
from dataclasses import dataclass
from datetime import datetime
from typing import Annotated
from typing import Optional
from pydantic import StringConstraints
from uuid import UUID

class LoginRequest(BaseModel):
  """
  Pydantic class for validating a login request.
  """
  name: Optional[Annotated[str, StringConstraints(max_length=255)]]
  email: Optional[Annotated[str, StringConstraints(max_length=255)]]
  password: Annotated[str, StringConstraints(max_length=255)]

class LoginResponse(BaseModel):
  """
  Dataclass for responding to a login request
  """
  success: bool
  access_token: str
  token_type: Optional[Annotated[str, StringConstraints(max_length=255)]]
  
class RegisterRequest(BaseModel):
  """
  Pydantic class for validating a login request.
  """
  name: Annotated[str, StringConstraints(max_length=255)]
  email: Annotated[str, StringConstraints(max_length=255)]
  password: Optional[Annotated[str, StringConstraints(max_length=255)]]
  role: Optional[Annotated[str, StringConstraints(max_length=255)]]

# @dataclass
# class RegisterResponse(BaseModel):
#   """
#   Pydantic class for validating a login request.
#   """
#   name: Annotated[str, StringConstraints(max_length=255)]
#   email: Annotated[str, StringConstraints(max_length=255)]
#   password: Optional[Annotated[str, StringConstraints(max_length=255)]]
#   role: Optional[Annotated[str, StringConstraints(max_length=255)]]

@dataclass
class JwtPayload:
  """
  Dataclass epresents the data encoded into a jwt payaload
  """
  user_id: str
  role: str
  expires_at: datetime
  iat: datetime