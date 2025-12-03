from pydantic import BaseModel
from datetime import datetime
  
class JwtPayload:
  """
  
  The data we serialise into a JWT payload.
  
  """
  user_id: str
  role: str
  exp: datetime
  iat: datetime