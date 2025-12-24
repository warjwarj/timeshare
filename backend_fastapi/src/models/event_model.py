from sqlalchemy import String, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import String, Index
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime

from src.models.mixins import TimestampMixin, UUIDMixin
from src.schemas.dtos.event_dto import EventDTO

Base = declarative_base()

class EventModel(Base, TimestampMixin, UUIDMixin):
  """  
  
  Event model
  
  """
  __tablename__: str = "events"
  
  start: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
  end: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True, nullable=False)
  name: Mapped[str] = mapped_column(String(255), index=True, nullable=False)
  colour: Mapped[str] = mapped_column(String(16), index=True, nullable=True)
  created_by_user_uuid: Mapped[str] = mapped_column(String(36), index=True, nullable=False)
  
  # example index - come back to this
  __table_args__: tuple[Index] = (
    Index('idx_name_start', 'name', 'start'),
  )
  
  def map_to_dto(self):
    return EventDTO(
      start=self.start,
      end=self.end,
      name=self.name,
      colour=self.colour,
      created_at=self.created_at,
      updated_at=self.updated_at,
      uuid=self.uuid,
      created_by_user_uuid=self.created_by_user_uuid
    )