from datetime import datetime, time, timedelta
import logging
from dataclasses import asdict
from uuid import UUID
from zoneinfo import ZoneInfo

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


def get_availability_for_user(req: GetAvailabilityRequest) -> GetAvailabilityResponse | None:
  """
  Get availability for the given user within the date range

  Args:
      rule_uuid (str): uuid of the user

  Returns:
      GetAvailabilityResponse
  """
  user = user_repo.get_record(uuid=req.user_uuid)
  rules = get_availability_rules_for_user(user_id=user.id)
  return calculate_day_availability(req, rules)


def calculate_day_availability(req: GetAvailabilityRequest, rules: AvailabilityRuleDTO) -> GetAvailabilityResponse:
  """
  Get availability for days within date range.

  Apply allowing rules first, then blocking rules.

  Returns:
      GetAvailabilityResponse: Availability for days within date range
  """

  # I think this is necessary
  for prev, curr in zip(rules, rules[1:]):
    if prev and prev.iana_timezone != curr.iana_timezone:
      raise RuntimeError("Can't use rules with different timezones")

  # I think the strat is to get explicitly 'allowed' rules first then apply the blocking ones.
  allowing_rules = [r for r in rules if not r.prevents_booking]
  # blocking_rules = [r for r in rules if r.prevents_booking]

  # allowing and blocking weekdays
  allowing_weekdays = set().union(*(r.weekdays or [] for r in allowing_rules))
  # blocking_weekdays = set().union(*(r.weekdays for r in blocking_rules))

  # this is the list we'll return
  day_availabilitys = []

  # filter out the weekdays we can't do
  # allowed_weekdays = [wd for wd in allowing_weekdays if wd not in blocking_weekdays]

  # flatten date ranges for no overlaps
  ranges: list[list[datetime, datetime, time, time]] = []
  for rule in sorted(allowing_rules, key=lambda rule: rule.start_datetime):
    if not rule.start_datetime or not rule.end_datetime:
      continue
    for range in ranges:
      if range[0] <= rule.start_datetime and range[1] >= rule.end_datetime:
        # rule is eclipsed or equal
        break
      elif range[0] > rule.start_datetime and range[0] < rule.end_datetime and range[1] > rule.end_datetime:
        # rule start before, rule end within range
        range[0] = rule.start_datetime
        break
      elif range[0] < rule.start_datetime and range[1] > rule.start_datetime and range[1] < rule.end_datetime:
        # start within, end after
        range[1] = rule.end_datetime
        break
    else:
      ranges.append([rule.start_datetime, rule.end_datetime, rule.start_time, rule.end_time])

  for range in ranges:
    # induvidual dates for each day in the range
    range_dates = [
        req.start_datetime.replace(tzinfo=ZoneInfo(rules[0].iana_timezone))
        + timedelta(days=x)
        for x in range(
            (req.end_datetime - req.start_datetime).days + 1
        )
    ]
    # iter over the range dates
    for rd in range_dates:
      avail = DayAvailability(
          date=rd,
          brief="Full Day",
          start_time=range[2],
          end_time=range[3]
      )
      if (rd > req.end_datetime):
        # outside of requested range
        break
      if (rd.weekday() not in allowing_weekdays):
        # no booking on this weekday
        avail.brief = "None"
      else:
        # if the range datetime ends outside of the range time
        if (req.start_datetime.time() < range[3]):
          avail.brief = "Part Day"
      day_availabilitys.append(avail)

  return day_availabilitys
