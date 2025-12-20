from uuid import uuid4
from sqlalchemy import Column, String, Index
from sqlalchemy.ext.declarative import declarative_base

from src.schemas.dtos.event_dto import EventDTO

Base = declarative_base()

class EventModel(Base):
  """  
  Event model. Only for use when interacting directly with the db since provides validation so slower
  """
  __tablename__: str = "events"
  
  uuid = Column(String, primary_key=True, default=lambda: str(uuid4()))
  start= Column(String, index=True, nullable=True)
  end = Column(String, index=True, nullable=True)
  title = Column(String, index=True, nullable=True)
  colour = Column(String, index=True, nullable=True)
  created_by_user_uuid = Column(String, index=True, nullable=False)
  
  # example index - come back to this
  __table_args__: tuple[Index] = (
    Index('idx_title_start', 'title', 'start'),
  )
  
  def map_to_dto(event_model: EventModel):
    if event_model is not None:
      return EventDTO(
        uuid=event_model.uuid,
        start=event_model.start,
        end=event_model.end,
        title=event_model.title,
        colour=event_model.colour,
        created_by_user_uuid=event_model.created_by_user_uuid
      )
    return None