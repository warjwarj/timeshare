from sqlalchemy import Column, String, Index, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from schemas.user_dtos import UserDTO

Base = declarative_base()

class UserModel(Base):
  """
  
  User model. Only for use when interacting directly with the db.
  
  """
  __tablename__: str = "users"
      
  id: Column[UUID] = Column(UUID(as_uuid=True), primary_key=True, default=uuid4) # native postgres uuid type
  name: Column[str] = Column(String(255), index=True, nullable=True)
  email: Column[str] = Column(String(255), index=True, nullable=True, unique=True)
  password: Column[str] = Column(Text, nullable=True) # text instead of string for variable length
  role: Column[str] = Column(String(64), index=True, nullable=True)
  
  # Composite index for common queries
  __table_args__: tuple[Index] = (
    Index('idx_email_role', 'email', 'role'),
  )
  
def map_to_dto(user_model: UserModel):
  if user_model is not None:
    return UserDTO(
      id=user_model.id,
      name=user_model.name,
      email=user_model.email,
      password=user_model.password,
      role=user_model.role
    )
  return None