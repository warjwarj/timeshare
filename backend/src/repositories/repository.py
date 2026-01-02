import logging
import threading
from _thread import LockType
from typing import TypeVar, Generic, List, Optional, Iterable
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
DtoClass = TypeVar('DtoClass')

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
  
  def update_record(self, uuid: str, **kwargs) -> DtoClass | None:
    """
    Update a record by its uuid
    """
    if not kwargs:
      raise ValueError("No fields provided for update")
    
    # Validate all fields exist on model
    for attr in kwargs:
      if not hasattr(self.model_class, attr):
        raise ValueError(f"{self.model_class.__name__} has no attribute '{attr}'")  
    
    with yield_session(DB_URL) as session:
      record = session.query(self.model_class).filter(
        self.model_class.uuid == uuid
      ).first()                
      if not record:
        return None
      
      for key, value in kwargs.items():
        setattr(record, key, value)        
      session.commit()
      session.refresh(record)
      
      return record.map_to_dto() if record else None

  def add_record(self, **kwargs) -> DtoClass | None:
    """
    Add a record and get a dto of that record which was added
    """
    try:
      
      for attr in kwargs:
        if not hasattr(self.model_class, attr):
          raise ValueError(f"{self.model_class} must define '{attr}'")
      
      with yield_session(DB_URL) as session:
        model = self.model_class(**kwargs)
        session.add(model)
        session.commit()
        session.refresh(model)
        dto = model.map_to_dto()
        return dto
      
    except Exception as e:
      print(f"ERROR ADDING RECORD: {e}")

  def add_multiple_records(self, records: Iterable[ModelClass]) -> list[DtoClass] | None:
    """
    Add a record and get a dto of that record which was added
    """
    try:
      
      with yield_session(DB_URL) as session:
        session.add_all(records)
        session.commit()
        [session.refresh(r) for r in records]
        return [r.map_to_dto() for r in records]
      
    except Exception as e:
      print(f"ERROR ADDING MULTIPLE RECORDS: {e}")
      
  def get_record(self, multiple: bool = False, **kwargs) -> DtoClass | list[DtoClass] | None:
    """
    Get one or more records that match the provided filters

    :param kwargs: key/val pairs where the key is the field name, and the value is what we want to filter on.
    :param all: Whether to retreive every record matching the provided filters, or just the first.
    :return: None, or one or more records matching the provided filters.
    :rtype: DtoClass | list[DtoClass] | None:
    """
    try:
      
      if not kwargs:
        raise ValueError("Must provide at least one filter parameter")

      for key, value in kwargs.items():
        if not hasattr(self.model_class, key):
          raise ValueError(f"{self.model_class} must define '{value}'")

      with yield_session(DB_URL) as session:
        if multiple:
          records = session.query(self.model_class).filter_by(**kwargs).all()
          return [r.map_to_dto() for r in records] if records else None
        else:
          rec = session.query(self.model_class).filter_by(**kwargs).first()
          return rec.map_to_dto() if rec else None

    except Exception as e:
      print(f"ERROR GETTING RECORD: {e}")
      
      
  def delete_record(self, uuid: str) -> ModelClass | None:
    """
    Delete a record of T by it's uuid
    """
    try:
    
      with yield_session(DB_URL) as session:
        rec = session.query(self.model_class).filter_by(uuid=uuid).first()
        if rec:
          session.delete(rec)
      return rec
    
    except Exception as e:
      print(f"ERROR DELETING RECORD: {e}")
