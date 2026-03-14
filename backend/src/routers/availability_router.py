from fastapi import APIRouter
import logging
from http import HTTPStatus

from src.dependancies.auth import RequestContextDep
from src.services.availability_service import (
    get_availability_rules_for_user,
    create_availability_rule,
    update_availability_rule,
    delete_availability_rule
)
from src.schemas.requests.availability_requests import (
    CreateAvailabilityRuleRequest,
    UpdateAvailabilityRuleRequest
)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

availability_router = APIRouter(
    prefix="/availability",
    tags=["availability"],
)

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Routes
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


@availability_router.get("/", status_code=HTTPStatus.OK)
async def all(ctx: RequestContextDep):
  """
  Get all availability rules for the user.
  """
  return get_availability_rules_for_user(ctx.user.id)


@availability_router.post("/", status_code=HTTPStatus.CREATED)
async def create(ctx: RequestContextDep, rule: CreateAvailabilityRuleRequest):
  """
  Create an availability rule.
  """
  return create_availability_rule(ctx.user.id, rule)


@availability_router.put("/{uuid}", status_code=HTTPStatus.OK)
async def update(_: RequestContextDep, uuid: str, rule: UpdateAvailabilityRuleRequest):
  """
  Update an availability rule.
  """
  return update_availability_rule(uuid, rule)


@availability_router.delete("/{uuid}", status_code=HTTPStatus.OK)
async def delete(_: RequestContextDep, uuid: str):
  """
  Delete an availability rule.
  """
  return delete_availability_rule(uuid)
