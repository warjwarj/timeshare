from datetime import date, timedelta, datetime, timezone
import colorsys
import random

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


def random_colour(min_lightness=0.3, max_lightness=0.7):
  """
  Random colour of a certain luminance so not too bright or dark
  """
  h = random.random()
  s = random.uniform(0.5, 1.0)
  l = random.uniform(min_lightness, max_lightness)
  # colorsys uses HLS (note the order)
  r, g, b = colorsys.hls_to_rgb(h, l, s)
  return "#%02x%02x%02x" % (int(r * 255), int(g * 255), int(b * 255))
