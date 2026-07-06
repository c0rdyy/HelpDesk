from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import RequestPriority, RequestStatus
from app.models import Base
from app.models.mixins import IDMixin, TimestampsMixin

if TYPE_CHECKING:
    from app.models.user import User


class Request(IDMixin, TimestampsMixin, Base):
    """
    Represents a request.

    Attributes:
        id (int): The unique identifier of the request.
        title (str): The title of the request.
        description (str | None): The description of the request.
        status (RequestStatus): The status of the request.
        priority (RequestPriority): The priority of the request.
        creator_id (int): The ID of the user who created the request.
        created_at (datetime): The timestamp when the request was created.
        updated_at (datetime): The timestamp when the request was last updated.
    """

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

    creator_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False, index=True
    )

    creator: Mapped["User"] = relationship("User", back_populates="requests")

    __table_args__ = (
        CheckConstraint("length(title) >= 3", name="ck_requests_title_min_length"),
        CheckConstraint("length(title) <= 120", name="ck_requests_title_max_length"),
        CheckConstraint(
            "description IS NULL OR length(description) <= 1000",
            name="ck_requests_description_max_length",
        ),
    )
