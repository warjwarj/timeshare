from datetime import date, timedelta, datetime, timezone

# get previous Monday


def getWeekStart() -> date:
  today = date.today()
  Monday = today - timedelta(days=today.weekday())
  return Monday

# get coming Sunday


def getWeekEnd() -> date:
  today = date.today()
  Sunday = today + timedelta(days=today.weekday())
  return Sunday


def getUnixEpoch() -> int:
  """
  Get the current time as a unix timestamp - seconds since 1970/01/01 or whatever

  :return: int representation of the current unix epoch
  :rtype: int
  """

  return int(datetime.now(timezone.utc).timestamp())


def getUtcDatetimeNow() -> str:
  """
  Get the current datetime as utc readable string

  :return: utc datetime now as readable string
  :rtype: int
  """

  return datetime.now(timezone.utc)
