import logging
import os
from datetime import datetime

from sqlalchemy import create_engine, MetaData, Table, Column, Integer, String, DateTime, insert


class CustomLogHandler(logging.StreamHandler):
  """
  Custom log handler that writes logging messages to a SQLite database using SQLAlchemy Core.
  """

  def __init__(self, db_path):
    super().__init__()
    self.db_path = db_path
    self._init_db()

  def _init_db(self):
    """
    Initialize the database engine and create logs table if needed.
    """
    os.makedirs(os.path.dirname(self.db_path) or '.', exist_ok=True)
    self.engine = create_engine(f'sqlite:///{self.db_path}')
    self.metadata = MetaData()
    
    # logs for our application
    self.logs_table = Table(
      'log',
      self.metadata,
      Column('id', Integer, primary_key=True, autoincrement=True),
      Column('timestamp', DateTime, nullable=False),
      Column('logger_name', String, nullable=False),
      Column('level', String, nullable=False),
      Column('message', String, nullable=False),
    )
    
    self.metadata.create_all(self.engine)
    
  def emit(self, record):
    """
    Write log record to SQLite database.
    """
    msg = self.format(record)

    stmt = insert(self.logs_table).values(
      timestamp=datetime.fromtimestamp(record.created),
      logger_name=record.name,
      level=record.levelname,
      message=msg
    )
    
    with self.engine.connect() as conn:
      conn.execute(stmt)
      conn.commit()