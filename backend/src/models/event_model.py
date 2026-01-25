from sqlalchemy import String, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime
from datetime import datetime

from src.models.mixins import TimestampMixin, UUIDMixin
from src.schemas.dtos.event_dto import EventDTO

Base = declarative_base()

class EventModel(Base, TimestampMixin, UUIDMixin):
  """  
  
  Event model
  
  """
  __tablename__: str = "events"
  name: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
    comment="Name of event."
  )  
  created_by_user_uuid: Mapped[str] = mapped_column(
    String(36), 
    index=True, 
    nullable=False,
    comment="The uuid of the user who created this event."    
  )
  start: Mapped[datetime] = mapped_column(
    DateTime, 
    index=True, 
    nullable=True,
    comment="Start datetime of event. No timezone. UTC time."
  )
  end: Mapped[datetime] = mapped_column(
    DateTime, 
    index=True, 
    nullable=True,
    comment="Start datetime of event. No timezone. UTC time."
  )
  iana_timezone: Mapped[str] = mapped_column(
    String(64),
    nullable=True,
    comment="iana timezone standard string."
  )  
  colour: Mapped[str] = mapped_column(
    String(16),
    nullable=True,
    comment="Event colour."
  )

  # example index - come back to this
  __table_args__: tuple[Index] = (
    Index('idx_name_start', 'name', 'start'),
  )
  
  def map_to_dto(self):
    return EventDTO(
      start=self.start,
      end=self.end,
      iana_timezone=self.iana_timezone,
      name=self.name,
      colour=self.colour,
      created_at=self.created_at,
      updated_at=self.updated_at,
      uuid=self.uuid,
      created_by_user_uuid=self.created_by_user_uuid
    )