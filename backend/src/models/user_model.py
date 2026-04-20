from sqlalchemy import Integer, String, Index, Text, inspect
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.schemas.dtos.user_dto import UserDTO
from src.models import Base
from src.models.mixins import TimestampMixin, UUIDMixin


class UserModel(Base, TimestampMixin, UUIDMixin):
  """
  User model
  """
  __tablename__: str = "users"

  id: Mapped[int] = mapped_column(
      Integer,
      primary_key=True
  )

  name: Mapped[str | None] = mapped_column(String(255), index=True)
  email: Mapped[str | None] = mapped_column(String(255), index=True, unique=True)
  password: Mapped[str] = mapped_column(Text, nullable=False)
  role: Mapped[str | None] = mapped_column(String(64), index=True)

  availability_rules: Mapped[list["AvailabilityRuleModel"]] = relationship(
      "AvailabilityRuleModel",
      back_populates="user",
      foreign_keys="AvailabilityRuleModel.user_id"
  )

  __table_args__ = (
      Index(
          "ix_users_name_trgm",
          "name",
          postgresql_using="gin",
          postgresql_ops={"name": "gin_trgm_ops"},
      ),
      Index(
          "ix_users_email_trgm",
          "email",
          postgresql_using="gin",
          postgresql_ops={"email": "gin_trgm_ops"},
      ),
  )

  def map_to_dto(self):
    return UserDTO(**{
        column.key: getattr(self, column.key)
        for column in inspect(self).mapper.column_attrs
    })
