from enum import IntEnum

class OrganisationEventRole(IntEnum):
  """
  Relationship between an organisation and an event.
  Ints instead of strings - faster, and explicit heirachy.
  """
  created_in=300
  shared_with_edit=200
  shared_with_view=100