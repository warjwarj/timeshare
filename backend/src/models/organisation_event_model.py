from sqlalchemy import Integer, Index, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column

from src.models import Base
from src.models.mixins import TimestampMixin


class OrganisationEventModel(Base, TimestampMixin):
  """
  Junction table for many-to-many relationship between organisations and events.

  Composite primary key on (org_id, event_id).
  """
  __tablename__: str = "organisation_events"

  org_id: Mapped[int] = mapped_column(
    Integer,
    ForeignKey("organisations.id"),
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
    Index('idx_org_event_event_org', 'event_id', 'org_id'),
  )
