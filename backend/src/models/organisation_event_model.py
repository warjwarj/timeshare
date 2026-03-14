from sqlalchemy import Integer, Index, ForeignKey, SmallInteger, String, inspect
from sqlalchemy.orm import Mapped, mapped_column

from src.utils.organisation_event_role import OrganisationEventRole
from src.schemas.dtos.organisation_event_dto import OrganisationEventDTO
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
      ForeignKey("organisations.id", ondelete="CASCADE"),
      primary_key=True,
      nullable=False,
  )

  event_id: Mapped[int] = mapped_column(
      Integer,
      ForeignKey("events.id", ondelete="CASCADE"),
      primary_key=True,
      nullable=False,
  )

  role: Mapped[OrganisationEventRole] = mapped_column(
      SmallInteger,
      nullable=False
  )

  __table_args__ = (
      Index('idx_org_event_event_org', 'event_id', 'org_id'),
  )

  def map_to_dto(self):
    return OrganisationEventDTO(**{
        column.key: getattr(self, column.key)
        for column in inspect(self).mapper.column_attrs
    })
