from datetime import datetime, time
from sqlalchemy import ARRAY, Boolean, DateTime, Integer, String, Index, Text, Time
from sqlalchemy.ext.declarative import declarative_base
from src.schemas.dtos.availability_rule_dto import AvailabilityRuleDTO
from src.schemas.dtos.user_dto import UserDTO
from sqlalchemy.orm import Mapped, mapped_column

from src.models.mixins import TimestampMixin, UUIDMixin

Base = declarative_base()


class AvailabilityRuleModel(Base, TimestampMixin, UUIDMixin):
  """

  User model

  """
  __tablename__: str = "availability_rules"

  name: Mapped[str] = mapped_column(
    String(255),
    index=True,
    nullable=False,
    comment="Name of the rule."
  )
  created_by_user_uuid: Mapped[str] = mapped_column(
    String(36),
    index=True,
    nullable=False,
    comment="the uuid of the user who created this rule."
  )
  prevents_booking: Mapped[bool] = mapped_column(
    Boolean,
    index=True,
    nullable=False,
    comment="Whether the rule prevents booking. if false, then it allows booking."
  )
  weekdays: Mapped[list[int] | None] = mapped_column(
    ARRAY(Integer),
    nullable=True,
    comment="If not null, then a list of weekdays that the rule refers to."
  )
  start_time: Mapped[time | None] = mapped_column(
    Time,
    nullable=True,
    comment="Start time within each day covered by the availability rule that the rule is referencing. No timezone. UTC time."
  )
  end_time: Mapped[time | None] = mapped_column(
    Time,
    nullable=True,
    comment="End time within each day covered by the availability rule that the rule is referencing. No timezone. UTC time."
  )
  start_datetime: Mapped[datetime | None] = mapped_column(
    DateTime,
    nullable=True,
    comment="Start datetime of availability window. No timezone. UTC time."
  )
  end_datetime: Mapped[datetime | None] = mapped_column(
    DateTime,
    nullable=True,
    comment="End datetime of availability window. No timezone. UTC time."
  )
  iana_timezone: Mapped[str | None] = mapped_column(
    String(64),
    nullable=True,
    comment="iana timezone standard string."
  )

  def map_to_dto(self):
    return AvailabilityRuleDTO(
      uuid=self.uuid,
      name=self.name,
      created_by_user_uuid=self.created_by_user_uuid,
      prevents_booking=self.prevents_booking,
      weekdays=self.weekdays,
      start_time=self.start_time,
      end_time=self.end_time,
      start_datetime=self.start_datetime,
      end_datetime=self.end_datetime,
      iana_timezone=self.iana_timezone
    )
