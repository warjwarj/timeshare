from sqlalchemy import Boolean, Integer, Index, ForeignKey, SmallInteger, String, inspect
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.organisation_user_role import OrganisationUserRole
from src.schemas.dtos.organisation_user_dto import OrganisationUserDTO
from src.models import Base
from src.models.mixins import TimestampMixin


class OrganisationUserModel(Base, TimestampMixin):
  """
  Junction table for many-to-many relationship between organisations and users.

  Composite primary key on (org_id, user_id).
  """
  __tablename__: str = "organisation_users"

  org_id: Mapped[int] = mapped_column(
      Integer,
      ForeignKey("organisations.id", ondelete="CASCADE"),
      primary_key=True,
      nullable=False,
  )

  user_id: Mapped[int] = mapped_column(
      Integer,
      ForeignKey("users.id", ondelete="CASCADE"),
      primary_key=True,
      nullable=False,
  )

  role: Mapped[OrganisationUserRole] = mapped_column(
      SmallInteger,
      nullable=False
  )

  is_default: Mapped[bool] = mapped_column(
      Boolean,
      nullable=False,
      comment="The org which a user initially logs into."
  )

  __table_args__ = (
      Index('idx_org_user_user_org', 'user_id', 'org_id'),
  )

  def map_to_dto(self):
    return OrganisationUserDTO(**{
        column.key: getattr(self, column.key)
        for column in inspect(self).mapper.column_attrs
    })
