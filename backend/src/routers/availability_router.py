from fastapi import APIRouter
import logging
from http import HTTPStatus

from src.dependancies.auth_deps import IsAuthedDep
from src.services.availability_service import (
  get_availability_rules,
  get_availability_rule,
  create_availability_rule,
  update_availability_rule,
  create_multiple_availability_rules,
  delete_availability_rule
)
from src.schemas.requests.availability_requests import (
  CreateAvailabilityRuleRequest,
  UpdateAvailabilityRuleRequest,
  CreateMultipleAvailabilityRulesRequest
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
async def all(jwt_payload: IsAuthedDep):
  """
  Get all availability rules for the user.
  """
  return get_availability_rules(jwt_payload["user_uuid"])

@availability_router.post("/create", status_code=HTTPStatus.CREATED)
async def create(jwt_payload: IsAuthedDep, rule: CreateAvailabilityRuleRequest):
  """
  Create an availability rule.
  """
  return create_availability_rule(jwt_payload["user_uuid"], rule)

@availability_router.post("/update", status_code=HTTPStatus.OK)
async def update(jwt_payload: IsAuthedDep, rule: UpdateAvailabilityRuleRequest):
  """
  Update an availability rule.
  """
  return update_availability_rule(jwt_payload["user_uuid"], rule)

@availability_router.post("/create-multiple", status_code=HTTPStatus.CREATED)
async def create_multiple(jwt_payload: IsAuthedDep, rules: CreateMultipleAvailabilityRulesRequest):
  """
  Create multiple availability rules.
  """
  return create_multiple_availability_rules(jwt_payload["user_uuid"], rules)

@availability_router.delete("/delete/{uuid}", status_code=HTTPStatus.OK)
async def delete(uuid: str, jwt_payload: IsAuthedDep):
  """
  Delete an availability rule.
  """
  print(uuid)
  return delete_availability_rule(uuid)

