from http import HTTPStatus
from typing import Annotated
from uuid import UUID
from fastapi import Depends, HTTPException, Header, Query


from src.repositories.organisation_repository import OrganisationRepository
from src.repositories.organisation_user_repository import OrganisationUserRepository
from src.repositories.users_repository import UserRepository
from src.schemas.dtos.request_context import RequestContext
from src.services.auth_service import decode_token

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


RequestCtxDep = Annotated[RequestContext, Depends(get_request_context)]


def get_request_target_context(
    org_user_uuid: Annotated[UUID, None, Query(alias="target_uuid")] = None
) -> RequestTargetCtxDep:
  """
  Dependancy for reading request context the query parameters.
  Get the org user, org and user records.
  """
  if org_user_uuid is None:
    return None

  # get user, org, org user
  org_user = org_users_repo.get_record(uuid=org_user_uuid)
  if not org_user:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not find organisation user association."
    )
  user = users_repo.get_record(id=org_user.user_id)
  if not user:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not find user using given uuid."
    )
  org = org_repo.get_record(id=org_user.org_id)
  if not org:
    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Could not find organisation using given uuid."
    )
  return RequestContext(
      user,
      org,
      org_user
  )


RequestTargetCtxDep = Annotated[RequestContext, Depends(get_request_target_context)]
