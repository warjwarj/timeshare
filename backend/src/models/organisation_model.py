from sqlalchemy import String, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.models import Base
from src.models.mixins import TimestampMixin, UUIDMixin


class OrganisationModel(Base, UUIDMixin, TimestampMixin):
  """
  Organisation model with hierarchical structure.

  Parent orgs have full visibility of child org objects (users, events).
  Child orgs cannot see parent or sibling objects.
  A null parent_id means the org has no parent (root org).
  """
  __tablename__: str = "organisations"

  id: Mapped[int] = mapped_column(
    Integer,
    nullable=False,
    primary_key=True
  )

  parent_id: Mapped[int | None] = mapped_column(
    Integer,
    ForeignKey("organisations.id"),
    nullable=True,
    index=True,
    comment="Id of parent organisation. Null means root org."
  )

  parent: Mapped["OrganisationModel | None"] = relationship(
    "OrganisationModel",
    remote_side="OrganisationModel.id",
    back_populates="children",
    foreign_keys=[parent_id]
  )

  children: Mapped[list["OrganisationModel"]] = relationship(
    "OrganisationModel",
    back_populates="parent",
    foreign_keys=[parent_id]
  )

  name: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
    comment="Name of the organisation."
  )
