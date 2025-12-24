from pydantic import BaseModel
from typing import Annotated
from typing import Optional
from pydantic import StringConstraints

class LoginRequest(BaseModel):
  """
  Pydantic class for validating a login request.
  """
  name: Optional[Annotated[str, StringConstraints(max_length=255)]]
  email: Optional[Annotated[str, StringConstraints(max_length=255)]]
  password: Annotated[str, StringConstraints(max_length=255)]
  
class RegisterRequest(BaseModel):
  """
  Pydantic class for validating a login request.
  """
  name: Annotated[str, StringConstraints(max_length=255)]
  email: Annotated[str, StringConstraints(max_length=255)]
  password: Optional[Annotated[str, StringConstraints(max_length=255)]]
  role: Optional[Annotated[str, StringConstraints(max_length=255)]]