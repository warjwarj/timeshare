import logging

from sqlalchemy import select

from src.models.organisation_user_model import OrganisationUserModel
from src.models.organisation_model import OrganisationModel
from src.models.user_model import UserModel
from src.schemas.dtos.user_dto import UserDTO
from src.repositories.repository import Repository

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# UserRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class OrganisationRepository(Repository[UserModel, UserDTO]):
  """
  
  Repository for managing user records
  
  """
  model_class=OrganisationModel
  
  def get_orgs_for_user(user_uuid: str):
    stmt = (
      select(OrganisationModel, OrganisationUserModel)
      .join(OrganisationModel.id)
      .where(OrganisationModel.id == OrganisationUserModel.org_id)      
    )
    