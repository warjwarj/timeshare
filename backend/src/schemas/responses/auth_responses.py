from dataclasses import dataclass
from pydantic import BaseModel

@dataclass
class LoginResponse():
  """
  Dataclass for responding to a login request
  """
  success: bool
  access_token: str
  token_type: str
  name: str
  email: str

@dataclass
class RegisterResponse():
  """
  Pydantic class for responding to a register request.
  """
  name: str
  email: str

@dataclass
class UpdateAccountResponse():
  """
  Pydantic class for responding to an account update request.
  """
  success: bool
  name: str
  email: str
  updated_at: str