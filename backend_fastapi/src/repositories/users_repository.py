from _thread import LockType
from sqlalchemy import Select, select, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from typing import Optional, Tuple
from contextlib import contextmanager
import threading
import logging

from src.models.user_model import UserModel, Base, map_to_dto
from src.schemas.user_dtos import UserDTO
from src.db.session import get_sessionmaker, yield_session, get_engine, DB_URL

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# UserRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class UserRepository:
  
  _instance = None
  _initialised = False
  _lock: LockType = threading.Lock()
  
  def __new__(cls, *args, **kwargs):
    """
    Singleton repository class for handling database operations on User entities.
    """
    if not cls._instance:
      with cls._lock:
        # Double-check locking pattern
        if not cls._instance:
          cls._instance = super(UserRepository, cls).__new__(cls)
    return cls._instance
  
  def __init__(self) -> None:
    """
    Initialize the singleton.
    """
    # Only initialize once
    if not self._initialised:
      self._ensure_tables_exist()
      self._initialised = True
      
  def _ensure_tables_exist(self):
    """
    Check if the database table exists and create it if it doesn't
    """
    try:
      engine = get_engine(DB_URL)
      inspector = inspect(engine)
      existing_tables = inspector.get_table_names()      
      if UserModel.__tablename__ not in existing_tables:
        Base.metadata.create_all(engine, tables=[UserModel.__table__])
    except Exception as e:
      print("ERROR CREATING TABLE", e)
      raise
  
  @classmethod
  def get_instance(cls) -> 'UserRepository':
    """
    Get the singleton instance of UserRepository
    
    Returns:
      UserRepository: The singleton instance
        
    Raises:
      RuntimeError: If repository hasn't been initialized yet
    """
    if cls._instance is None:
        raise RuntimeError("UserRepository not initialized. Call UserRepository(session_factory) first.")
    return cls._instance
  
  def create_user(self, user: UserDTO) -> UserDTO:
    """
    Create a new user in the database
    
    Args:
      UserDTO: UserDTO representing the user you want to create
        
    Returns:
      UserModel: The created user object
    """
    with yield_session(DB_URL) as session:
      user_model = UserModel(
        name=user.name,
        email=user.email,
        password=user.password,
        role=user.role
      )
      session.add(user_model)
      session.flush()
      session.refresh(user_model)
      return map_to_dto(user_model)
  
  def get_user_by_id(self, user_id: str) -> Optional[UserDTO]:
    """
    Retrieve a user by their ID
    
    Args:
      user_id: The user's ID
        
    Returns:
      UserModel or None if not found
    """
    with yield_session(DB_URL) as session:
      stmt: Select[Tuple[UserModel]] = select(UserModel).where(UserModel.id == user_id)
      result = session.execute(stmt)
      return map_to_dto(result.scalar_one_or_none())
  
  def get_user_by_email(self, email: str) -> Optional[UserDTO]:
    """
    Retrieve a user by their email
    
    Args:
      email: The user's email
        
    Returns:
      UserModel or None if not found
    """
    with yield_session(DB_URL) as session:
      stmt: Select[Tuple[UserModel]] = select(UserModel).where(UserModel.email == email)
      result = session.execute(stmt)
      return map_to_dto(result.scalar_one_or_none())
  
  def update_user(self, user_id: str, **kwargs) -> Optional[UserDTO]:
    """
    Update a user's information
    
    Args:
      user_id: The user's ID
      **kwargs: Fields to update (name, email, password, role)
        
    Returns:
      Updated UserModel or None if not found
    """
    with yield_session(DB_URL) as session:
      stmt: Select[Tuple[UserModel]] = select(UserModel).where(UserModel.id == user_id)
      result = session.execute(stmt)
      user_model = result.scalar_one_or_none()
      
      if user_model:
        for key, value in kwargs.items():
          if hasattr(user_model, key):
            setattr(user_model, key, value)
        session.flush()
        session.refresh(user_model)
        return map_to_dto(user_model)
      return None
  
  def delete_user(self, user_id: str) -> bool:
    """
    Delete a user from the database
    
    Args:
      user_id: The user's ID
        
    Returns:
      True if deleted, False if not found or failed
    """
    with yield_session(DB_URL) as session:
      stmt: Select[Tuple[UserModel]] = select(UserModel).where(UserModel.id == user_id)
      result = session.execute(stmt)
      user = result.scalar_one_or_none()
      
      if user:
        session.delete(user)
        return True
      return False