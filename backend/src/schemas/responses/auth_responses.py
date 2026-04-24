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
  uuid: str
  name: str
  email: str
  colour: str


@dataclass
class UpdateAccountResponse():
  """
  Pydantic class for responding to an account update request.
  """
  success: bool
  updated_at: str
  name: str
  email: str
  colour: str
