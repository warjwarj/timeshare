from pydantic import BaseModel
from typing import Annotated
from typing import Optional
from pydantic import StringConstraints
from dataclasses import dataclass

@dataclass
class LoginResponse():
  """
  Dataclass for responding to a login request
  """
  success: bool
  access_token: str
  token_type: str
  
@dataclass
class RegisterResponse():
  """
  Pydantic class for responding to a register request.
  """
  success: bool
  name: str
  email: str