from typing import Generator
from contextlib import contextmanager
from functools import lru_cache

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

@lru_cache(maxsize=None)
def get_engine(database_url: str, echo=False) -> Engine:
    """
    Creates and returns a cached SQLAlchemy Engine object.
    Engine is created once per unique database_url and reused.
    """
    return create_engine(
      database_url, 
      echo=echo,
      pool_size=10,              # Maximum number of connections to keep
      max_overflow=20,           # Additional connections if pool is full
      pool_pre_ping=True,        # Verify connections before using
      pool_recycle=3600,         # Recycle connections after 1 hour
    )

@lru_cache(maxsize=None)
def get_sessionmaker(database_url: str, echo=False) -> sessionmaker:
    """
    Create and return a cached sessionmaker object.
    """
    engine = get_engine(database_url, echo)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)

@contextmanager
def yield_session(database_url: str) -> Generator[Session, None, None]:
    """
    Context manager for database sessions with automatic commit/rollback.
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