from sqlalchemy import CheckConstraint, Enum, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.enums import RequestPriority, RequestStatus
from app.models import Base
from app.models.mixins import IDMixin, TimestampsMixin


class Request(IDMixin, TimestampsMixin, Base):
    __tablename__ = "requests"

    title: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[RequestStatus] = mapped_column(
        Enum(RequestStatus, name="request_status", native_enum=False, length=20),
        nullable=False,
        default=RequestStatus.new,
    )
    priority: Mapped[RequestPriority] = mapped_column(
        Enum(RequestPriority, name="request_priority", native_enum=False, length=20),
        nullable=False,
        default=RequestPriority.normal,
    )

    __table_args__ = (
        CheckConstraint("length(title) >= 3", name="ck_requests_title_min_length"),
        CheckConstraint("length(title) <= 120", name="ck_requests_title_max_length"),
        CheckConstraint(
            "description IS NULL OR length(description) <= 1000",
            name="ck_requests_description_max_length",
        ),
    )
