from services import AuthService
from typing import Annotated, Depends
from schemas import JwtPayload

def get_auth_service() -> AuthService:
  """
  Dependancy for the auth service. FastAPI will inject into routes
  """
  return AuthService()

AuthServiceDep = Annotated[dict, Depends(get_auth_service)]

def verify_token(
    token: str,
    auth_service: AuthServiceDep
  ) -> JwtPayload:
  """
  Dependancy for reading a jwt from a request.
  Should error if it fails, and return the decoded jwt if it's valid.
  """
  return auth_service.verify_token(token)
 
IsAuthedDep = Annotated[JwtPayload, Depends(verify_token)]