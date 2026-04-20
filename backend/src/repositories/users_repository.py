import logging
from uuid import UUID

from src.db.session import DB_URL, yield_session
from src.repositories.organisation_repository import OrganisationRepository
from src.utils.organisation_user_role import OrganisationUserRole
from src.repositories.organisation_user_repository import OrganisationUserRepository
from src.models.user_model import UserModel
from src.schemas.dtos.user_dto import UserDTO
from src.repositories.repository import Repository
from sqlalchemy import func, or_, select, case

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

org_user_rep = OrganisationUserRepository()
org_rep = OrganisationRepository()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# UserRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


class UserRepository(Repository[UserModel, UserDTO]):
  """

  Repository for managing user records

  """
  model_class = UserModel

  def get_default_org_user(self, user_uuid: str) -> UserDTO | None:
    """
    Given org and user uuids, get orguser relationship
    """
    user = super().get_record(uuid=user_uuid)
    return org_user_rep.get_record(user_id=user.id, is_default=True)

  def search_users(session, q: str, limit: int = 20):
    """

    Args:
        session (_type_): _description_
        q (str): _description_
        limit (int, optional): _description_. Defaults to 20.

    Returns:
        _type_: _description_
    """
    name_sim = func.similarity(UserModel.name, q)
    email_sim = func.similarity(UserModel.email, q)
    score = func.greatest(name_sim, email_sim)
    with yield_session(DB_URL) as session:
      stmt = (
          select(UserModel, score.label("score"))
          .where(
              or_(
                  UserModel.name.op("%")(q),
                  UserModel.email.op("%")(q),
              )
          )
          .order_by(score.desc())
          .limit(limit)
      )
      records = session.execute(stmt).scalars().all()
      if records:
        return [r.map_to_dto() for r in records]
      return []
