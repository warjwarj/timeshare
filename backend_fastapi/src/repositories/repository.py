import logging
import threading
from _thread import LockType
from typing import TypeVar, Generic, List, Optional
from abc import ABC

from sqlalchemy import inspect

from src.db.session import DB_URL, get_engine
from src.models.event_model import Base, EventModel
from src.schemas.user_dtos import UserDTO

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# UserRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

T = TypeVar('T')

class Repository(ABC, Generic[T]):
    
  """
  Abstract class for inheriting from and defining custom repositories.
  """
  
  model_class: type[T] = None # the model that the derived class is a repository of 
  
  _instances = {}
  _locks = {}

  def __new__(cls, *args, **kwargs):
    """
    Singleton repository class for handling database operations on 'T' entities.
    """
    if cls not in cls._locks:
      cls._locks[cls] = threading.Lock()
    
    if cls not in cls._instances:
      with cls._locks[cls]:
        if cls not in cls._instances:
          cls._instances[cls] = super(Repository, cls).__new__(cls)
    return cls._instances[cls]

  def __init__(self) -> None:
    """
    Initialize the singleton.
    """
    # Only initialize once
    if not hasattr(self, "_initialised"):
      self._ensure_tables_exist()
      self._initialised = True

  def _ensure_tables_exist(self):
    """
    Check if the database table exists and create it if it doesn't
    """
    if self.model_class is None:
      raise ValueError(f"{self.__class__.__name__} must define entity_class")
    
    try:
      engine = get_engine(DB_URL)
      inspector = inspect(engine)
      existing_tables = inspector.get_table_names()
      
      if self.model_class.__tablename__ not in existing_tables:
        Base.metadata.create_all(engine, tables=[self.model_class.__table__])
    except Exception as e:
      print("ERROR CREATING TABLE", e)
      raise
