from enum import IntEnum

class OrganisationUserRole(IntEnum):
  """
  Relationship between an organisation and a user.
  Ints instead of strings - faster, and explicit heirachy.
  """
  org_admin=400
  admin=300
  trusted_user=200
  user=100