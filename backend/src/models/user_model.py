from sqlalchemy import Integer, String, Index, Text
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
  
  def map_to_dto(self):
    return UserDTO(
      name=self.name,
      email=self.email,
      password=self.password,
      role=self.role,
      created_at=self.created_at,
      updated_at=self.updated_at,
      uuid=self.uuid
    )
