from http import HTTPStatus
from typing import Annotated
from fastapi import Depends, HTTPException, Header

import jwt

from src.repositories.organisation_repository import OrganisationRepository
from src.repositories.organisation_user_repository import OrganisationUserRepository
from src.repositories.users_repository import UserRepository
from src.schemas.dtos.request_context import RequestContext
from src.services.auth_service import decode_token
from src.schemas.dtos.jwt_payload import JwtPayload

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

users_repo = UserRepository()
org_repo = OrganisationRepository()
org_users_repo = OrganisationUserRepository()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Auth dependancy
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


def get_request_context(
    Authorization: Annotated[str, Header()],
) -> RequestContext:
  """
  Dependancy for describing the context behind a request.
  In practice describes the organisation user whom made the request.
  """
  # get jwt payload
  token = Authorization.strip()
  if token.startswith("Bearer "):
    token = token[7:]
  decoded_token = decode_token(token)

  # get user, org, org user
  user = users_repo.get_record(uuid=decoded_token['user_uuid'])
  if not user:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not find user using given uuid."
    )
  org = org_repo.get_record(uuid=decoded_token['org_uuid'])
  if not org:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not find organisation using given uuid."
    )
  org_user = org_users_repo.get_record(org_id=org.id, user_id=user.id)
  if not org_user:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not find organisation user association."
    )
  return RequestContext(
      user,
      org,
      org_user
  )


RequestContextDep = Annotated[RequestContext, Depends(get_request_context)]
