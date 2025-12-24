from sqlalchemy import String, Index, Text
from sqlalchemy.ext.declarative import declarative_base
from src.schemas.dtos.user_dto import UserDTO
from sqlalchemy.orm import Mapped, mapped_column

from src.models.mixins import TimestampMixin, UUIDMixin

Base = declarative_base()

class UserModel(Base, TimestampMixin, UUIDMixin):
  """
  
  User model
  
  """
  __tablename__: str = "users"
    
  name: Mapped[str | None] = mapped_column(String(255), index=True)
  email: Mapped[str | None] = mapped_column(String(255), index=True, unique=True)
  password: Mapped[str] = mapped_column(Text, nullable=False)
  role: Mapped[str | None] = mapped_column(String(64), index=True)
  
  # example index - come back to this
  __table_args__: tuple[Index] = (
    Index('idx_email_role', 'email', 'role'),
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