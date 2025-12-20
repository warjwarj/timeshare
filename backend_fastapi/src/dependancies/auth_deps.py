from typing import Annotated
from fastapi import Depends, Header

import jwt

from src.services.auth_service import decode_token
from src.schemas.dtos.jwt_payload import JwtPayload


def verify_token(
    Authorization: Annotated[str, Header()],
  ) -> JwtPayload:
  """
  Dependancy for reading a jwt from a request.
  Should error if it fails, and return the decoded jwt if it's valid.
  """
  token = Authorization.strip()
  if token.startswith("Bearer "):
    token = token[7:]
    
  decoded_token = decode_token(token)
  print(decoded_token)
  return decoded_token
 
IsAuthedDep = Annotated[dict, Depends(verify_token)]