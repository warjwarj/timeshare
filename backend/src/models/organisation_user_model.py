from sqlalchemy import Integer, Index, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

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
    ForeignKey("organisations.id"),
    primary_key=True,
    nullable=False,
  )

  user_id: Mapped[int] = mapped_column(
    Integer,
    ForeignKey("users.id"),
    primary_key=True,
    nullable=False,
  )
  
  role: Mapped[str] = mapped_column(
    String(64),
    nullable=False
  )

  __table_args__ = (
    Index('idx_org_user_user_org', 'user_id', 'org_id'),
  )