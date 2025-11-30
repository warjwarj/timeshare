from typing import Optional, List
from sqlmodel import SQLModel, create_engine, Session, select
from datetime import datetime

from models.user_model import UserModel

class UsersRepository:
  _instance = None
  _initialised = False
  
  def __new__(cls, *args, **kwargs):
    """gatekeep access to ensure we're a singlaton"""
    if cls._instance is None:
      cls._instance = super().__new__(cls)
    return cls._instance
  
  def __init__(
    self,
    host: str,
    db: str,
    user: str,
    passw: str,
    port: int
  ):
    """Initialize repository with PostgreSQL connection"""
    if self._initialised:
      return    
    connection_string = f"postgresql://{user}:{passw}@{host}:{port}/{db}"
    self.engine = create_engine(connection_string, echo=False)
    self._initialised = True    
        
  def create_tables(self):
    """init tables if needed"""
    SQLModel.metadata.create_all(self.engine)
    
  def create_user(self, user: UserModel) -> UserModel:
    """create a new user"""
    with Session(self.engine) as session:
      session.add(user)
      session.commit()
      session.refresh(user)
      return user
    
  def get_user_by_id(self, user_id: str) -> Optional[UserModel]:
    """get user by id"""
    with Session(self.engine) as session:
        return session.get(UserModel, user_id)
  
  def get_user_by_email(self, email: str) -> Optional[UserModel]:
    """get user by email"""
    with Session(self.engine) as session:
      statement = select(UserModel).where(UserModel.email == email)
      return session.exec(statement).first()
  
  def update_user(self, user_id: str, **kwargs) -> Optional[UserModel]:
    """update user fields"""
    with Session(self.engine) as session:
      user = session.get(UserModel, user_id)
      if not user:
        return None      
      for key, value in kwargs.items():
        if hasattr(user, key):
          setattr(user, key, value)
      session.add(user)
      session.commit()
      session.refresh(user)
      return user

  def delete_user(self, user_id: str) -> bool:
    """delete user"""
    with Session(self.engine) as session:
      user = session.get(UserModel, user_id)
      if not user:
        return False
      
      session.delete(user)
      session.commit()
      return True
  
  def user_exists(self, email: str) -> bool:
    """check if user exists by against their email"""
    with Session(self.engine) as session:
      statement = select(UserModel).where(UserModel.email == email)
      return session.exec(statement).first() is not None

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# getters for controlling access to the singleton
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

def get_users_repo() -> UsersRepository:
  """get singleton instance"""
  global _users_repo_instance
  if _users_repo_instance is None:
    raise RuntimeError("users repository not initialised, init before getting.")
  return _users_repo_instance

def init_users_repo(
    host: str, 
    db: str, 
    user: str, 
    passw: str, 
    port: int
  ) -> UsersRepository:
  """initialise the singleton instance"""
  global _users_repo_instance
  _users_repo_instance = UsersRepository(host, db, user, passw, port)
  return _users_repo_instance
