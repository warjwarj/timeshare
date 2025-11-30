from datetime import date, timedelta

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
  