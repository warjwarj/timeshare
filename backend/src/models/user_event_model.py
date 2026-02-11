from sqlalchemy import Integer, Index, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from src.models import Base
from src.models.mixins import TimestampMixin


class UserEventModel(Base, TimestampMixin):
  """
  Junction table for many-to-many relationship between users and events.

  Composite primary key on (user_id, event_id).
  """
  __tablename__: str = "user_events"

  user_id: Mapped[int] = mapped_column(
    Integer,
    ForeignKey("users.id"),
    primary_key=True,
    nullable=False,
  )

  event_id: Mapped[int] = mapped_column(
    Integer,
    ForeignKey("events.id"),
    primary_key=True,
    nullable=False,
  )
  
  role: Mapped[str] = mapped_column(
    String(64),
    nullable=False
  )

  __table_args__ = (
    Index('idx_event_user_user_event', 'user_id', 'event_id'),
  )