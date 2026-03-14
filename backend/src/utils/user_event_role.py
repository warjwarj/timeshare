from enum import IntEnum

class UserEventRole(IntEnum):
  """
  Relationship between a user and an event.
  Ints instead of strings - faster, and explicit heirachy.
  """
  admin=200
  viewer=100