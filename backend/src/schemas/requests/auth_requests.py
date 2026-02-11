from pydantic import UUID7, BaseModel
from typing import Annotated
from typing import Optional
from pydantic import StringConstraints, UUID7

class LoginRequest(BaseModel):
  """
  Pydantic class for validating a login request.  
  Can send either name or email but not neither
  """
  name: Optional[Annotated[str, StringConstraints(max_length=255)]]
  email: Optional[Annotated[str, StringConstraints(max_length=255)]]
  password: Annotated[str, StringConstraints(max_length=255)]
  
class RegisterRequest(BaseModel):
  """
  Pydantic class for validating a register request.
  All fields required.
  """
  # organisation_uuid shouldn't be optional in prod. Hardcoding for now.
  organisation_uuid: Optional[UUID7]
  name: Optional[Annotated[str, StringConstraints(max_length=255)]]
  email: Annotated[str, StringConstraints(max_length=255)]
  password: Annotated[str, StringConstraints(max_length=255)]

class UpdateAccountRequest(BaseModel):
  """
  Pydantic class for validating an account update request.
  Can send either name or email.
  """
  name: Optional[Annotated[str, StringConstraints(max_length=255)]] = None
  email: Optional[Annotated[str, StringConstraints(max_length=255)]] = None