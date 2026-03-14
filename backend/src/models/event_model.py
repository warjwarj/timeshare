from sqlalchemy import UUID, String, Integer, Index, DateTime, ForeignKey, inspect
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime

from src.models import Base
from src.models.mixins import TimestampMixin, UUIDMixin
from src.schemas.dtos.event_dto import EventDTO


class EventModel(Base, TimestampMixin, UUIDMixin):
  """
  Event model
  """
  __tablename__: str = "events"

  id: Mapped[int] = mapped_column(
    Integer,
    primary_key=True
  )

  name: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
    comment="Name of event."
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
    comment="End datetime of event. No timezone. UTC time."
  )
  
  iana_timezone: Mapped[str] = mapped_column(
    String(64),
    nullable=True,
    comment="IANA timezone standard string."
  )
  
  colour: Mapped[str] = mapped_column(
    String(16),
    nullable=True,
    comment="Event colour."
  )

  def map_to_dto(self):
    return EventDTO(**{
      column.key: getattr(self, column.key)
      for column in inspect(self).mapper.column_attrs
    })