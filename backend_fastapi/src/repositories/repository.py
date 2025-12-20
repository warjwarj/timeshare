import logging
import threading
from _thread import LockType
from typing import TypeVar, Generic, List, Optional
from abc import ABC

from sqlalchemy import inspect

from src.db.session import DB_URL, get_engine, get_sessionmaker, yield_session
from src.models.event_model import Base, EventModel
from src.schemas.dtos.user_dto import UserDTO

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# UserRepository
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

ModelClass = TypeVar('ModelClass')
DtoClass = TypeVar('D')

class Repository(ABC, Generic[ModelClass, DtoClass]):
    
  """
  Abstract class for inheriting from and defining custom repositories.
  """
  
  model_class: type[ModelClass] = None   # the model that the derived class is a repository of
  
  _instances = {}
  _locks = {}

  def __new__(cls, *args, **kwargs):
    """
    Singleton repository class for handling database operations on 'model_class' entities.
    """
    
    if cls not in cls._locks:
      cls._locks[cls] = threading.Lock()
    
    if cls not in cls._instances:
      with cls._locks[cls]:
        if cls not in cls._instances:
          cls._instances[cls] = super(Repository, cls).__new__(cls)
    return cls._instances[cls]

  def __init__(self):
    """
    Initialize the singleton.
    """
    
    if not hasattr(self, "_initialised"):
      self._ensure_tables_exist()
      self._initialised = True

  def _ensure_tables_exist(self):
    """
    Check if the database table exists and create it if it doesn't
    """
    
    if self.model_class is None:
      raise ValueError(f"{self.__class__.__name__} must define 'model_class")
    
    try:
      engine = get_engine(DB_URL)
      inspector = inspect(engine)
      existing_tables = inspector.get_table_names()
      
      if self.model_class.__tablename__ not in existing_tables:
        Base.metadata.create_all(engine, tables=[self.model_class.__table__])
    except Exception as e:
      print("ERROR CREATING TABLE", e)
      raise
  
  def update_record(self, uuid: str, **kwargs) -> ModelClass | None:
    """
    Update a record of model_class
    """
    
    if not self.model_class.hasattr(self.model_class, "uuid"):
      raise ValueError(f"{self.model_class} must define 'uuid'")
    
    with yield_session(DB_URL) as session:
      session.query(self.model_class).filter(self.model_class.uuid).update(kwargs)
    
    return self.get_record_by_uuid(uuid)

  def add_record(self, **kwargs) -> ModelClass | None:
    """
    Add a record of T
    """
    
    for attr in kwargs:
      if not self.model_class.hasattr(self.model_class, attr):
        raise ValueError(f"{self.model_class} must define '{attr}'")
    
    rec = self.model_class(**kwargs)
    with yield_session(DB_URL) as session:
      session.add(rec)
    return rec
  
  def get_record_by_uuid(self, uuid: str) -> DtoClass | None:
    """
    Retreive a record of T by it's uuid
    """
    
    with yield_session(DB_URL) as session:
      return session.query(self.model_class).filter(
          self.model_class.uuid == uuid
        ).first().map_to_dto()
      
  def get_all_matching(self, **kwargs) -> list[DtoClass]:
    """
    Get all entities matching the provided field values.
    """

    valid_filters = {}
    for key, value in kwargs.items():
      if hasattr(self.model_class, key):
        valid_filters[key] = value
    with yield_session(DB_URL) as session:
      models = session.query(self.model_class).filter_by(**valid_filters).all()
      return [m.map_to_dto() for m in models]
      
      
  def delete_record(self, uuid: str) -> ModelClass | None:
    """
    Delete a record of T by it's uuid
    """
    
    rec = self.get_record_by_uuid(uuid)    
    with yield_session(DB_URL) as session:
      if rec:
        session.delete(rec)
    return rec
