from typing import Annotated, Optional
from pydantic import StringConstraints, UUID7, BaseModel


class RegisterRequest(BaseModel):
  """
  Pydantic class for validating a register request.

  This is for registering an organisation, and the admin of that organisation.
  """
  org_name: Annotated[str, StringConstraints(max_length=255)]
  name: Optional[Annotated[str, StringConstraints(max_length=255)]]
  email: Annotated[str, StringConstraints(max_length=255)]
  password: Annotated[str, StringConstraints(max_length=255)]


class LoginRequest(BaseModel):
  """
  Pydantic class for validating a login request.  
  Can send name, email, or both - but not neither
  """
  name: Optional[Annotated[str, StringConstraints(max_length=255)]]
  email: Optional[Annotated[str, StringConstraints(max_length=255)]]
  password: Annotated[str, StringConstraints(max_length=255)]


class UpdateAccountRequest(BaseModel):
  """
  Pydantic class for validating an account update request.
  Can send either name or email.
  """
  name: Optional[Annotated[str, StringConstraints(max_length=255)]] = None
  email: Optional[Annotated[str, StringConstraints(max_length=255)]] = None
