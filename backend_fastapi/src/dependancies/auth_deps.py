from typing import Annotated
from fastapi import Depends

from src.services.auth_service import AuthService
from src.schemas.auth_dtos import JwtPayload

def get_auth_service() -> AuthService:
  """
  Dependancy for the auth service. FastAPI will inject into routes
  """
  return AuthService()

AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]

def verify_token(
    token: str,
    auth_service: AuthServiceDep
  ) -> JwtPayload:
  """
  Dependancy for reading a jwt from a request.
  Should error if it fails, and return the decoded jwt if it's valid.
  """
  print(token)
  return auth_service.verify_token(token)
 
IsAuthedDep = Annotated[JwtPayload, Depends(verify_token)]