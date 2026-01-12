import logging
from dataclasses import asdict

from src.repositories.availability_repository import AvailabilityRepository
from src.schemas.dtos.availability_rule_dto import AvailabilityRuleDTO
from src.models.availability_rule_model import AvailabilityRuleModel
from src.schemas.requests.availability_requests import (
  CreateAvailabilityRuleRequest,
  UpdateAvailabilityRuleRequest,
  CreateMultipleAvailabilityRulesRequest
)
from src.schemas.responses.availability_responses import SafeAvailabilityRuleDTO


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Helpers
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

def sanitise_availability_rule(rule: AvailabilityRuleDTO) -> SafeAvailabilityRuleDTO:
  sar = {k: v for k, v in asdict(rule).items() if k != "created_by_user_uuid"}
  return SafeAvailabilityRuleDTO(**sar)

def sanitise_availability_rules(rules: list[AvailabilityRuleDTO]) -> list[SafeAvailabilityRuleDTO]:
  return [sanitise_availability_rule(rule) for rule in rules]

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Services
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

def create_availability_rule(user_uuid: str, rule: CreateAvailabilityRuleRequest) -> SafeAvailabilityRuleDTO:
  """
  Create an availability rule
  """
  availability_repo = AvailabilityRepository()

  rec = availability_repo.add_record(
    name=rule.name,
    prevents_booking=rule.prevents_booking,
    weekdays=rule.weekdays,
    start_time=rule.start_time,
    end_time=rule.end_time,
    start_datetime=rule.start_datetime,
    end_datetime=rule.end_datetime,
    created_by_user_uuid=user_uuid
  )
  if rec is not None:
    return sanitise_availability_rule(rec)

def update_availability_rule(user_uuid: str, rule: UpdateAvailabilityRuleRequest) -> SafeAvailabilityRuleDTO:
  """
  Update an availability rule
  """
  availability_repo = AvailabilityRepository()

  rec = availability_repo.update_record(
    uuid=rule.uuid,
    name=rule.name,
    prevents_booking=rule.prevents_booking,
    weekdays=rule.weekdays,
    start_time=rule.start_time,
    end_time=rule.end_time,
    start_datetime=rule.start_datetime,
    end_datetime=rule.end_datetime,
  )
  if rec is not None:
    return sanitise_availability_rule(rec)

def create_multiple_availability_rules(user_uuid: str, req: CreateMultipleAvailabilityRulesRequest) -> list[SafeAvailabilityRuleDTO]:
  """
  Create multiple availability rules
  """
  availability_repo = AvailabilityRepository()

  objs = [
    { **r.model_dump(), "created_by_user_uuid": user_uuid }
    for r in req.rules
  ]
  models = [AvailabilityRuleModel(**o) for o in objs]
  rules = availability_repo.add_multiple_records(models)
  if rules:
    return sanitise_availability_rules(rules)

def get_availability_rules(user_uuid: str) -> list[SafeAvailabilityRuleDTO]:
  """
  Get all availability rules for a user
  """
  availability_repo = AvailabilityRepository()

  rules = availability_repo.get_record(multiple=True, created_by_user_uuid=user_uuid)

  if rules:
    return sanitise_availability_rules(rules)
  return []

def get_availability_rule(rule_uuid: str) -> SafeAvailabilityRuleDTO | None:
  """
  Get a single availability rule by uuid
  """
  availability_repo = AvailabilityRepository()

  rule = availability_repo.get_record(uuid=rule_uuid)

  if rule:
    return sanitise_availability_rule(rule)
  return None

def delete_availability_rule(rule_uuid: str) -> dict:
  """
  Delete an availability rule
  """
  availability_repo = AvailabilityRepository()
  availability_repo.delete_record(rule_uuid)
  return {"success": True}
