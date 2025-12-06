from _thread import LockType
from sqlalchemy import Select, select, inspect
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, String, Text
from sqlalchemy.dialects.postgresql import UUID
from uuid import uuid4
from typing import Optional, List, Tuple
from contextlib import contextmanager
import threading

from models.user_model import UserModel, map_to_dto
from schemas.user_dtos import UserDTO

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

# sqlalchemy thing
Base = declarative_base()

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# UserRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

class UserRepository:
  """
  Singleton repository class for handling database operations on User entities
  """
  _instance = None
  _lock: LockType = threading.Lock()
  
  def __new__(cls, *args, **kwargs):
    """      
    Ensure thread safe singleton. 
    __new__ runs before init so we can only use the __init__ for actual initialisation.
    """
    if not cls._instance:
      with cls._lock:
        # Double-check locking pattern
        if not cls._instance:
          cls._instance = super(UserRepository, cls).__new__(cls)
    return cls._instance
  
  def __init__(self, session_factory: sessionmaker = None) -> None:
    """
    Initialize repository with a session factory (only on first instantiation)
    
    Args:
      session_factory: SQLAlchemy session factory for creating database sessions
    """
    # Only initialize once
    if not hasattr(self, '_initialized'):
      if session_factory is None:
        raise ValueError("session_factory must be provided on first instantiation")
      self.session_factory = session_factory
      self.engine = session_factory.kw.get('bind')
      self._ensure_tables_exist() # check users table exists
      self._initialized = True
      
  def _ensure_tables_exist(self):
    """
    Check if the database table exists and create it if it doesn't
    """
    try:
      inspector = inspect(self.engine)
      existing_tables = inspector.get_table_names()      
      if UserModel.__tablename__ not in existing_tables:
        Base.metadata.create_all(self.engine, tables=[UserModel.__table__])
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
  
  @contextmanager
  def get_session(self):
    """
    Context manager for database sessions with automatic commit/rollback.
    If an operation fails we can roll the changes back.
    And commit the changes if succcess
    """
    session = self.session_factory()
    try:
      yield session
      session.commit()
    except Exception:
      session.rollback()
      raise
    finally:
      session.close()
  
  def create_user(self, user: UserDTO) -> UserDTO:
    """
    Create a new user in the database
    
    Args:
      UserDTO: UserDTO representing the user you want to create
        
    Returns:
      UserModel: The created user object
    """
    with self.get_session() as session:
      user_model = UserModel(
        # UUID generated automatically by default=uuid4 in model
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
    with self.get_session() as session:
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
    with self.get_session() as session:
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
    with self.get_session() as session:
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
    with self.get_session() as session:
      stmt: Select[Tuple[UserModel]] = select(UserModel).where(UserModel.id == user_id)
      result = session.execute(stmt)
      user = result.scalar_one_or_none()
      
      if user:
        session.delete(user)
        return True
      return False