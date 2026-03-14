from dataclasses import dataclass
from datetime import datetime


@dataclass
class JwtPayload:
  """
  Dataclass epresents the data encoded into a jwt payaload
  """
  user_uuid: str
  role: str
  expires_at: datetime
  iat: datetime
