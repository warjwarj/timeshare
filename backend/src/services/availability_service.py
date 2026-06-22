from collections import namedtuple
from datetime import datetime, time, timedelta, timezone
import logging
from dataclasses import asdict
from uuid import UUID
from zoneinfo import ZoneInfo

from src.schemas.dtos.event_dto import EventDTO
from src.repositories.events_repository import EventsRepository
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
events_repo = EventsRepository()

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
  return calculate_day_availability(ctx, req, rules)


def calculate_day_availability(ctx: RequestContextDep, req: GetAvailabilityRequest, rules: AvailabilityRuleDTO) -> GetAvailabilityResponse:
  """
  Get availability for days within date range.

  Apply allowing rules first, then blocking rules.

  Returns:
      GetAvailabilityResponse: Availability for days within date range
  """

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

  allowing_rules = [r for r in rules if not r.prevents_booking]

  AvailabilityDateRange = namedtuple("AvailabilityDateRange", ["start", "end", "blocking"])

  # get events and flatten date ranges
  # this might be slower that the extra iterations caused by just iterating over the event's ranges without flattening
  events = events_repo.get_events_by_datetimes(ctx.user.id, request_start, request_end, filter_on_blocking=True)
  flattened_blocking_ranges: list[AvailabilityDateRange] = []
  for event in sorted(events, key=lambda event: event.start):

    event.start = event.start.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(event.iana_timezone))
    event.end = event.end.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(event.iana_timezone))
    overriding_start = event.start
    overriding_end = event.end

    for i, fr in enumerate(flattened_blocking_ranges):
      if fr and fr.start <= event.start and fr.end >= event.end:
        # range is eclipsed or equal
        flattened_blocking_ranges[i] = fr._replace(start=overriding_start)
        flattened_blocking_ranges[i] = fr._replace(end=overriding_end)
        break
      elif fr and fr.start >= event.start and fr.end <= event.end:
        # range is contained or equal
        break
      elif fr and event.start >= fr.start and event.start < fr.end and event.end > fr.end:
        # start within or at start of range, end after
        flattened_blocking_ranges[i] = fr._replace(end=overriding_end)
        break
      elif fr and event.start < fr.start and event.end > fr.start and event.end <= fr.end:
        # start before, end within or at end of range
        flattened_blocking_ranges[i] = fr._replace(start=overriding_start)
        break
    else:
      flattened_blocking_ranges.append(AvailabilityDateRange(start=overriding_start, end=overriding_end, blocking=True))

  # this is the list we'll return
  day_availabilitys = []

  for rule in allowing_rules:

    bounded_rule_start = rule.start_datetime if rule.start_datetime > request_start else request_start
    bounded_rule_end = rule.end_datetime if rule.end_datetime < request_end else request_end
    bounded_rule_start = bounded_rule_start.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(rule.iana_timezone))
    bounded_rule_end = bounded_rule_end.replace(tzinfo=timezone.utc).astimezone(ZoneInfo(rule.iana_timezone))
    rule_range_dates = [bounded_rule_start + timedelta(days=i) for i in range((bounded_rule_end - bounded_rule_start).days + 1)]

    # iter over rule dates
    for rule_dt in rule_range_dates:

      # availability description for day
      avail = next((da for da in day_availabilitys if da.date.date() == rule_dt.date()), None)
      if not avail:
        avail = DayAvailability(
            date=rule_dt,
            blocking=False,  # for now
            brief="Full Day",
            start_time=rule.start_time,
            end_time=rule.end_time,
            blocked_segments=[]
        )

      # no need for further calcs if date blocked
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

      # these ranges are blocked off
      for blocking_range in flattened_blocking_ranges:

        curr_date = rule_dt.date()
        br_start_date = blocking_range.start.date()
        br_end_date = blocking_range.end.date()
        br_start_time = blocking_range.start.time()
        br_end_time = blocking_range.end.time()

        if curr_date == br_start_date and curr_date == br_end_date:
          if avail.start_time and avail.end_time:
            if br_start_time < avail.start_time and br_end_time < avail.end_time:
              # start before end within
              avail.start_time = br_end_time
              avail.brief = "Part Day"
            elif br_start_time > avail.start_time and br_end_time > avail.end_time:
              # start within end after
              avail.end_time = br_start_time
              avail.brief = "Part Day"
            elif br_start_time < avail.start_time and br_end_time > avail.end_time:
              # start before end after
              avail.start_time, avail.end_time = None, None
              avail.brief = "None"
            elif br_start_time > avail.start_time and br_end_time < avail.end_time:
              # start and end within
              avail.blocked_segments.append((br_start_time, br_end_time))
              avail.brief = "Part Day"

        elif curr_date == br_start_date:
          if avail.start_time and avail.end_time:
            avail_start_dt = datetime.combine(curr_date, avail.start_time).replace(tzinfo=timezone.utc).astimezone(ZoneInfo(rule.iana_timezone))
            avail_end_dt = datetime.combine(curr_date, avail.end_time).replace(tzinfo=timezone.utc).astimezone(ZoneInfo(rule.iana_timezone))
            if avail.start_time < br_start_time and avail.end_time > br_start_time:
              avail.end_time = br_start_time
              avail.brief = "Part Day"
            elif blocking_range.start < avail_start_dt and br_start_date > avail_end_dt:
              avail.start_time, avail.end_time = None, None
              avail.brief = "None"

        elif curr_date == br_end_date:
          if avail.start_time and avail.end_time:
            avail_start_dt = datetime.combine(curr_date, avail.start_time).replace(tzinfo=timezone.utc).astimezone(ZoneInfo(rule.iana_timezone))
            avail_end_dt = datetime.combine(curr_date, avail.end_time).replace(tzinfo=timezone.utc).astimezone(ZoneInfo(rule.iana_timezone))
            if avail.start_time < br_end_time and avail.end_time > br_end_time:
              avail.start_time = br_end_time
              avail.brief = "Part Day"
            elif blocking_range.end > avail_end_dt and br_start_date < avail_start_dt:
              avail.start_time, avail.end_time = None, None
              avail.brief = "None"

        # day falls within blocking range
        elif curr_date < br_end_date and curr_date > br_start_date:
          avail.start_time, avail.end_time = None, None
          avail.brief = "None"

      day_availabilitys.append(avail)

  return day_availabilitys
