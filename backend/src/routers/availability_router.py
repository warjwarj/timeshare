from fastapi import APIRouter
import logging
from http import HTTPStatus

from src.dependancies.auth import RequestCtxDep
from src.services.availability_service import (
    get_availability_for_user,
    get_availability_rules_for_user,
    create_availability_rule,
    update_availability_rule,
    delete_availability_rule
)
from src.schemas.requests.availability_requests import (
    CreateAvailabilityRuleRequest,
    GetAvailabilityRequest,
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
async def all(ctx: RequestCtxDep):
  """
  Get all availability rules for the user.
  """
  return get_availability_rules_for_user(id=ctx.user.id)


@availability_router.post("/", status_code=HTTPStatus.CREATED)
async def create(ctx: RequestCtxDep, req: CreateAvailabilityRuleRequest):
  """
  Create an availability rule.
  """
  return create_availability_rule(ctx.user.id, req)


@availability_router.put("/{rule_uuid}", status_code=HTTPStatus.OK)
async def update(ctx: RequestCtxDep, rule_uuid: str, req: UpdateAvailabilityRuleRequest):
  """
  Update an availability rule.
  """
  return update_availability_rule(ctx, rule_uuid, req)


@availability_router.delete("/{uuid}", status_code=HTTPStatus.OK)
async def delete(ctx: RequestCtxDep, uuid: str):
  """
  Delete an availability rule.
  """
  return delete_availability_rule(ctx, uuid)


@availability_router.post("/getAvailability", status_code=HTTPStatus.OK)
async def get_availability(ctx: RequestCtxDep, req: GetAvailabilityRequest):
  """
  Get availability for a user, within a set of dates.
  """
  return get_availability_for_user(ctx, req)
