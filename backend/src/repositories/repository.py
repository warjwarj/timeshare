from dataclasses import dataclass
import logging
import threading
from typing import Any, TypeVar, Generic, Iterable
from abc import ABC

from sqlalchemy import inspect

from src.models import Base
from src.db.session import DB_URL, get_engine, yield_session

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Module vars
# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

logger = logging.getLogger(__name__)

# ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
# Repository
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

    # crash the app, this should never happen
    if self.model_class is None:
      err = f"_ENSURE_TABLES_EXIST: {self.__class__.__name__} must define 'model_class"
      logger.critical(err)
      raise ValueError(err)

    try:

      engine = get_engine(DB_URL)
      inspector = inspect(engine)
      existing_tables = inspector.get_table_names()
      if self.model_class.__tablename__ not in existing_tables:
        Base.metadata.create_all(engine)

    except Exception as e:
      logger.critical(F"ERROR CREATING TABLE: {e}")
      raise

  def attr_checks(self, **kwargs) -> None:
    """
    Given the provided kwargs, check that they all exist as fields on the model class of the repository.

    Raises:
      ValueError: If any of the checks fail.
    """
    if not kwargs:
      err = "UPDATE_RECORD: kwargs not provided to update_record."
      logger.critical(err)
      raise ValueError(err)
    for attr in kwargs:
      if not hasattr(self.model_class, attr):
        err = f"UPDATE_RECORD: {self.model_class.__name__} has no attribute '{attr}'"
        logger.critical(err)
        raise ValueError(err)

  def update_record(self, lookup: dict, **kwargs) -> DtoClass | None:
    """
    Update a record by its uuid
    """
    self.attr_checks(**kwargs)
    try:

      with yield_session(DB_URL) as session:
        record = session.query(self.model_class).filter_by(**lookup).first()
        if not record:
          return None
        for key, value in kwargs.items():
          setattr(record, key, value)
        session.commit()
        session.refresh(record)
        return record.map_to_dto() if record else None

    except Exception as e:
      logger.error(f"ERROR UPDATING RECORD: {e}")

  def add_record(self, **kwargs) -> DtoClass | None:
    """
    Add a record of the repository's model class to the database

    Returns:
      DtoClass | None: Either a DTO representing the record which was added, or None if the add operation failed.
    """
    self.attr_checks(**kwargs)
    try:

      with yield_session(DB_URL) as session:
        model = self.model_class(**kwargs)
        session.add(model)
        session.commit()
        session.refresh(model)
        session.expunge(model)
        return model.map_to_dto()

    except Exception as e:
      logger.error(f"ERROR ADDING RECORD: {e}")

  def get_record(self, **kwargs) -> DtoClass | None:
    """
    Get a single record that matches the provided filters

    Returns:
        DtoClass | None: A DTO representing the record which was retreived
    """
    self.attr_checks(**kwargs)
    try:

      with yield_session(DB_URL) as session:
        rec = session.query(self.model_class).filter_by(**kwargs).first()
        return rec.map_to_dto() if rec else None

    except Exception as e:
      logger.error(f"ERROR GETTING RECORD: {e}")

  def get_all_records(self) -> list[DtoClass] | None:
    """
    Retreive all records of the model class.

    Returns:
      list[DtoClass] | None: A list of DTOs representing all records
    """
    try:

      with yield_session(DB_URL) as session:
        records = session.query(self.model_class).all()
        return [r.map_to_dto() for r in records] if records else None

    except Exception as e:
      logger.error(f"ERROR GETTING ALL RECORDS: {e}")

  def get_multiple_records(self, **kwargs) -> list[DtoClass] | None:
    """
    Retreive a list of records that match the provided filters.

    Returns:
      list[DtoClass] | None: A list of DTOs representing the retreived records
    """
    self.attr_checks(**kwargs)
    try:

      with yield_session(DB_URL) as session:
        records = session.query(self.model_class).filter_by(**kwargs).all()
        return [r.map_to_dto() for r in records] if records else None

    except Exception as e:
      logger.error(f"ERROR GETTING MULTIPLE RECORDS: {e}")

  def delete_record(self, **kwargs) -> DtoClass | None:
    """
    Delete a record of the model class by its uuid
    """
    try:

      with yield_session(DB_URL) as session:
        rec = session.query(self.model_class).filter_by(**kwargs).first()
        if rec:
          session.delete(rec)
          return rec.map_to_dto()

    except Exception as e:
      logger.error(f"ERROR DELETING RECORD: {e}")
