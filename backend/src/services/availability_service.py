from datetime import datetime, time, timedelta, timezone
import logging
from dataclasses import asdict
from uuid import UUID
from zoneinfo import ZoneInfo

from src.dependancies.auth import RequestContextDep
from src.schemas.dtos.day_availability import DayAvailability
from src.repositories.users_repository import UserRepository
from src.repositories.availability_repository import AvailabilityRepository
from src.schemas.dtos.availability_rule_dto import AvailabilityRuleDTO
from src.schemas.requests.availability_requests import (
    CreateAvailabilityRuleRequest,
    GetAvailabilityRequest,
    UpdateAvailabilityRuleRequest
)
from src.schemas.responses.availability_responses import GetAvailabilityResponse, SafeAvailabilityRuleDTO


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


def get_availability_rules_for_user(**kwargs) -> list[SafeAvailabilityRuleDTO]:
  """
  Get all availability rules pertaining to the user making the request

  Args:
      kwargs: find the user which we're retreiving the rules of.

  Returns:
      list[SafeAvailabilityRuleDTO]: list of the pertinent rules
  """
  user = user_repo.get_record(**kwargs)
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


def update_availability_rule(ctx: RequestContextDep, rule_uuid: str, rule: UpdateAvailabilityRuleRequest) -> SafeAvailabilityRuleDTO | None:
  """
  Update availability rule by uuid

  Args:
      rule_uuid (str): uuid of the rule you want to update
      rule (UpdateAvailabilityRuleRequest): update params

  Returns:
      SafeAvailabilityRuleDTO: the udpated rule, or None if failed
  """
  rec = availability_repo.update_record(lookup={"uuid": rule_uuid, "user_id": ctx.user.id}, **vars(rule))
  return sanitise_availability_rule(rec) if rec else None


def delete_availability_rule(ctx: RequestContextDep, rule_uuid: str) -> SafeAvailabilityRuleDTO | None:
  """
  Delete an avaiability rule

  Args:
      rule_uuid (str): uuid of the rule you want to delete

  Returns:
      SafeAvailabilityRuleDTO | None: the deleted rule, or None if failed.
  """
  rec = availability_repo.delete_record(uuid=rule_uuid, user_id=ctx.user.id)
  return sanitise_availability_rule(rec) if rec else None


def get_availability_for_user(ctx: RequestContextDep, req: GetAvailabilityRequest) -> GetAvailabilityResponse | None:
  """
  Get availability for the given user within the date range

  Args:
      rule_uuid (str): uuid of the user

  Returns:
      GetAvailabilityResponse
  """
  user = user_repo.get_record(uuid=ctx.user.uuid)
  rules = get_availability_rules_for_user(id=user.id)
  return calculate_day_availability(req, rules)


def calculate_day_availability(req: GetAvailabilityRequest, rules: AvailabilityRuleDTO) -> GetAvailabilityResponse:
  """
  Get availability for days within date range.

  Apply allowing rules first, then blocking rules.

  Returns:
      GetAvailabilityResponse: Availability for days within date range
  """

  # make sure all rules use the same timezone
  for prev, curr in zip(rules, rules[1:]):
    if prev and prev.iana_timezone != curr.iana_timezone:
      raise RuntimeError("Can't use rules with different timezones")

  # request dates in request timezone
  request_start = req.start_datetime.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(req.iana_timezone))
  request_end = req.end_datetime.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(req.iana_timezone))

  # rule dates not None and timezone aware
  for rule in rules:
    rule.start_datetime = rule.start_datetime and rule.start_datetime.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(rule.iana_timezone)) or datetime.min.replace(tzinfo=timezone.utc)
    rule.end_datetime = rule.end_datetime and rule.end_datetime.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(rule.iana_timezone)) or datetime.max.replace(tzinfo=timezone.utc)

  # only handle allowing rules for the min
  allowing_rules = [r for r in rules if not r.prevents_booking]

  # this is the list we'll return
  day_availabilitys = []

  for rule in allowing_rules:
    bounded_rule_start = rule.start_datetime if rule.start_datetime > request_start else request_start
    bounded_rule_end = rule.end_datetime if rule.end_datetime < request_end else request_end
    rule_range_dates = [bounded_rule_start + timedelta(days=i) for i in range((bounded_rule_end - bounded_rule_start).days + 1)]
    for rule_dt in rule_range_dates:
      avail = next((da for da in day_availabilitys if da.date.date() == rule_dt.date()), None)
      if not avail:
        avail = DayAvailability(
            date=rule_dt,
            blocking=False,  # for now
            brief="Full Day",
            start_time=rule.start_time,
            end_time=rule.end_time
        )
      if (rule_dt > request_end):
        break
      if (rule.weekdays and rule_dt.weekday() not in rule.weekdays):
        avail.brief = "None"
        avail.start_time, avail.end_time = None, None
      else:
        avail.brief = "Full Day"
        # rule dt starts after rule start time
        if rule.start_datetime.date() == rule_dt.date():
          if rule.start_time and rule.start_time < rule.start_datetime.time():
            avail.brief = "Part Day"
            avail.start_time = rule.start_datetime.time()
        # rule dt ends before rule end time
        if rule.end_datetime.date() == rule_dt.date():
          if rule.end_time and rule.end_time > rule.end_datetime.time():
            avail.brief = "Part Day"
            avail.end_time = rule.end_datetime.time()
      day_availabilitys.append(avail)

  return day_availabilitys


# NOT USED
# # flatten rules by date range, ensuring no overlaps.
# flattened_rules: list[AvailabilityRuleDTO] = []
# for rule in sorted(allowing_rules, key=lambda rule: rule.start_datetime):
#   for fr in flattened_rules:
#     if fr.start_datetime <= rule.start_datetime and fr.end_datetime >= rule.end_datetime:
#       # rule is eclipsed or equal
#       break
#     elif fr.start_datetime > rule.start_datetime and fr.start_datetime < rule.end_datetime and fr.end_datetime > rule.end_datetime:
#       # rule start before, rule end within range
#       rule.start_datetime = rule.start_datetime
#       break
#     elif fr.start_datetime < rule.start_datetime and fr.end_datetime > rule.start_datetime and fr.end_datetime < rule.end_datetime:
#       # start within, end after
#       rule.end_datetime = rule.end_datetime
#       break
#   else:
#     flattened_rules.append(rule)
