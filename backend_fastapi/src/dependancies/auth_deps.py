from typing import Annotated
from fastapi import Depends, Header

import jwt

from src.services.auth_service import decode_token
from src.schemas.auth_dtos import JwtPayload

def verify_token(
    token: Annotated[str, Header()],
  ) -> JwtPayload:
  """
  Dependancy for reading a jwt from a request.
  Should error if it fails, and return the decoded jwt if it's valid.
  """
  
  token = token.strip()
  if token.startswith("Bearer "):
    token = token[7:]
    
  decoded_token = decode_token(token)
  return decoded_token
 
IsAuthedDep = Annotated[dict, Depends(verify_token)]