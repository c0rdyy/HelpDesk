from sqlalchemy import Boolean, CheckConstraint, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base
from app.models.mixins import IDMixin, TimestampsMixin


class User(IDMixin, TimestampsMixin, Base):
    __tablename__ = "users"

    username: Mapped[str] = mapped_column(Text, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    __table_args__ = (
        CheckConstraint("length(username) >= 3", name="ck_username_min_length"),
        CheckConstraint("length(username) <= 50", name="ck_username_max_length"),
    )
