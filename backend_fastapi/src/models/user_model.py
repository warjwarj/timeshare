from sqlmodel import Field, SQLModel
from uuid import uuid4

class UserModel(SQLModel, table=True):
  id: str = Field(default=uuid4(), primary_key=True)
  email: str = Field(index=True)
  password: str = Field(default=None, index=True)