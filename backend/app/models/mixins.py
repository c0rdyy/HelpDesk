from datetime import UTC, datetime

from sqlalchemy import DateTime
from sqlalchemy.orm import Mapped, mapped_column


def utc_now() -> datetime:
    return datetime.now(UTC)


class IDMixin:
    """
    Mixin class that provides an auto-incrementing primary key column named `id`.
    """

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)


class CreatedAtMixin:
    """
    Mixin class that provides a `created_at` column to track the creation timestamp of a record.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now
    )


class UpdatedAtMixin:
    """
    Mixin class that provides an `updated_at` column to track the last update
    timestamp of a record.
    """

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, default=utc_now, onupdate=utc_now
    )


class TimestampsMixin(CreatedAtMixin, UpdatedAtMixin):
    """Mixin class that provides both created_at and updated_at columns."""

    pass
