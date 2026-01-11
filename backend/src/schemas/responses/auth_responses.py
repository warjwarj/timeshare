from pydantic import BaseModel

class LoginResponse(BaseModel):
  """
  Dataclass for responding to a login request
  """
  success: bool
  access_token: str
  token_type: str
  name: str
  email: str
  
class RegisterResponse(BaseModel):
  """
  Pydantic class for responding to a register request.
  """
  success: bool
  name: str
  email: str

class UpdateAccountResponse(BaseModel):
  """
  Pydantic class for responding to an account update request.
  """
  success: bool
  name: str
  email: str
  updated_at: str