from sqlalchemy import Integer, Index, ForeignKey, SmallInteger, String, inspect
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.user_event_role import UserEventRole
from src.schemas.dtos.user_event_dto import UserEventDTO
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
      ForeignKey("users.id", ondelete="CASCADE"),
      primary_key=True,
      nullable=False,
  )

  event_id: Mapped[int] = mapped_column(
      Integer,
      ForeignKey("events.id", ondelete="CASCADE"),
      primary_key=True,
      nullable=False,
  )

  role: Mapped[UserEventRole] = mapped_column(
      SmallInteger,
      nullable=False
  )

  __table_args__ = (
      Index('idx_event_user_user_event', 'user_id', 'event_id'),
  )

  def map_to_dto(self):
    return UserEventDTO(**{
        column.key: getattr(self, column.key)
        for column in inspect(self).mapper.column_attrs
    })
