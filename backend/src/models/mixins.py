from sqlalchemy import UUID, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime, timezone
from uuid import uuid7


class UUIDMixin:
  """Mixin for UUID column"""
  uuid: Mapped[str] = mapped_column(
    UUID,
    unique=True,
    index=True,
    default=lambda: str(uuid7())
  )

class TimestampMixin:
  """Mixin for created_at and updated_at"""
  created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    default=lambda: datetime.now(timezone.utc),
    nullable=False
  )

  updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    default=lambda: datetime.now(timezone.utc),
    onupdate=lambda: datetime.now(timezone.utc),
    nullable=False
  )
