from typing import Generator
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from settings import settings


def build_db_url() -> str:
  """
  build database utl from settings
  """
  return (
    f"postgresql://{settings.POSTGRES_USER}:{settings.POSTGRES_PASSWORD}@{settings.POSTGRES_HOST}:{settings.POSTGRES_PORT}/{settings.POSTGRES_DB}"
  )


def get_engine(database_url: str, echo=False) -> Engine:
  """
  Creates and returns a SQLAlchemy Engine object for connecting to a database.

  Parameters:
    database_url (str): The URL of the database to connect to.

  Returns:
    Engine: A SQLAlchemy Engine object representing the database connection.
  """
  engine = create_engine(database_url, echo=echo)
  return engine

def get_sessionmaker(database_url: str, echo=False) -> sessionmaker:
  """
  Create and return a sessionmaker object for a local database session.

  Parameters:
    database_url (str): The URL of the local database.

  Returns:
    sessionmaker: A sessionmaker object configured for the local database session.
  """
  engine = get_engine(database_url, echo)
  return sessionmaker(autocommit=False, autoflush=False, bind=engine)

@contextmanager
def yield_session(database_url: str) -> Generator[Session]:
  """
  Context manager for database sessions with automatic commit/rollback.
  Rolls back changes if catches exception, else commits them.
  """
  session_factory = get_sessionmaker(database_url)
  session = session_factory()
  
  try:
    yield session
    session.commit()
  except Exception:
    session.rollback()
    raise
  finally:
    session.close()


# store it so no recalc
DB_URL = build_db_url()