from uuid import uuid4
from sqlalchemy import Column, String
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class EventModel(Base):
  """
  
  Event model. Only for use when interacting directly with the db.
  
  """
  __tablename__: str = "events"
  
  id = Column(String, primary_key=True, default=lambda: str(uuid4()))
  start= Column(String, index=True, nullable=True)
  end = Column(String, index=True, nullable=True)
  title = Column(String, index=True, nullable=True)
  colour = Column(String, index=True, nullable=True)
    
    