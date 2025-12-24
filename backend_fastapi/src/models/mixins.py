from sqlalchemy import String, Text, DateTime
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from datetime import datetime, timezone
from uuid import UUID, uuid4

class UUIDMixin:
  """Mixin for UUID primary key"""
  uuid: Mapped[str] = mapped_column(
    String(36),
    primary_key=True,
    default=lambda: str(uuid4())
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