import logging
from dataclasses import asdict

from src.repositories.users_repository import UserRepository
from src.repositories.availability_repository import AvailabilityRepository
from src.schemas.dtos.availability_rule_dto import AvailabilityRuleDTO
from src.schemas.requests.availability_requests import (
    CreateAvailabilityRuleRequest,
    UpdateAvailabilityRuleRequest
)
from src.schemas.responses.availability_responses import SafeAvailabilityRuleDTO


# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

availability_repo = AvailabilityRepository()
user_repo = UserRepository()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Helpers
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


def sanitise_availability_rule(rule: AvailabilityRuleDTO) -> SafeAvailabilityRuleDTO:
  sar = {k: v for k, v in asdict(rule).items() if k != "user_id" and k != "id"}
  return SafeAvailabilityRuleDTO(**sar)


def sanitise_availability_rules(rules: list[AvailabilityRuleDTO]) -> list[SafeAvailabilityRuleDTO]:
  return [sanitise_availability_rule(rule) for rule in rules]

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Services
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


def create_availability_rule(user_id: str, rule: CreateAvailabilityRuleRequest) -> SafeAvailabilityRuleDTO | None:
  """
  Create an availability rule

  Args:
      user_uuid (str): uuid of the user making the request
      rule (CreateAvailabilityRuleRequest): req object describing the rule to be created

  Returns:
      SafeAvailabilityRuleDTO: sanitised availability rule dto
  """
  user = user_repo.get_record(id=user_id)
  rec = availability_repo.add_record(**vars(rule), user_id=user.id)
  return sanitise_availability_rule(rec) if rec else None


def get_availability_rules_for_user(user_id: str) -> list[SafeAvailabilityRuleDTO]:
  """
  Get all availability rules pertaining to the user making the request

  Args:
      user_uuid (str): uuid of pertinent user

  Returns:
      list[SafeAvailabilityRuleDTO]: list of the pertinent rules
  """
  user = user_repo.get_record(id=user_id)
  rules = availability_repo.get_multiple_records(user_id=user.id)
  return sanitise_availability_rules(rules) if rules else []


def get_availability_rule(rule_uuid: str) -> SafeAvailabilityRuleDTO | None:
  """
  Get availability rule by uuid

  Args:
      rule_uuid (str): uuid of the rule that the caller wants to retreive

  Returns:
      SafeAvailabilityRuleDTO | None: the rule if it exists
  """
  rule = availability_repo.get_record(uuid=rule_uuid)
  return sanitise_availability_rule(rule) if rule else None


def update_availability_rule(rule_uuid: str, rule: UpdateAvailabilityRuleRequest) -> SafeAvailabilityRuleDTO | None:
  """
  Update availability rule by uuid

  Args:
      rule_uuid (str): uuid of the rule you want to update
      rule (UpdateAvailabilityRuleRequest): update params

  Returns:
      SafeAvailabilityRuleDTO: the udpated rule, or None if failed
  """
  rec = availability_repo.update_record(lookup={"uuid": rule_uuid}, **vars(rule))
  return sanitise_availability_rule(rec) if rec else None


def delete_availability_rule(rule_uuid: str) -> SafeAvailabilityRuleDTO | None:
  """
  Delete an avaiability rule

  Args:
      rule_uuid (str): uuid of the rule you want to delete

  Returns:
      SafeAvailabilityRuleDTO | None: the deleted rule, or None if failed.
  """
  rec = availability_repo.delete_record(uuid=rule_uuid)
  return sanitise_availability_rule(rec) if rec else None
