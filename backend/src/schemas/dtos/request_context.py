from dataclasses import dataclass

from src.schemas.dtos.organisation_dto import OrganisationDTO
from src.schemas.dtos.jwt_payload import JwtPayload
from src.schemas.dtos.user_dto import UserDTO
from src.schemas.dtos.organisation_user_dto import OrganisationUserDTO


@dataclass
class RequestContext():
  user: UserDTO
  org: OrganisationDTO
  org_user: OrganisationUserDTO
