from pydantic import BaseModel
from typing import Annotated
from typing import Optional
from pydantic import StringConstraints
from pydantic import BaseModel
from dataclasses import dataclass

class LoginResponse(BaseModel):
  """
  Dataclass for responding to a login request
  """
  success: bool
  access_token: str
  token_type: str
  
class RegisterResponse(BaseModel):
  """
  Pydantic class for responding to a register request.
  """
  success: bool
  name: str
  email: str