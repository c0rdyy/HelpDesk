from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, CheckConstraint, DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.enums import UserRole
from app.models.base import Base, StrUniq
from app.models.mixins import IDMixin, TimestampsMixin

if TYPE_CHECKING:
    from app.models.request import Request


class User(IDMixin, TimestampsMixin, Base):
    """
    Represents a user.

    Attributes:
        id (int): The unique identifier of the user.
        username (str): The username of the user.
        email (str): The email of the user.
        hashed_password (str): The hashed password of the user.
        role (UserRole): The role of the user.
        first_name (str | None): The first name of the user.
        last_name (str | None): The last name of the user.
        middle_name (str | None): The middle name of the user.
        phone (str | None): The phone number of the user.
        is_active (bool): Indicates if the user is active.
        is_verified (bool): Indicates if the user is verified.
        last_login_at (datetime | None): The timestamp of the user's last login.
        blocked_at (datetime | None): The timestamp when the user was blocked.
        created_at (datetime): The timestamp when the user was created.
        updated_at (datetime): The timestamp when the user was last updated.
    """

    __tablename__ = "users"

    username: Mapped[StrUniq]
    email: Mapped[StrUniq]

    hashed_password: Mapped[str] = mapped_column(Text, nullable=False)

    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, name="user_role", native_enum=False, length=20),
        nullable=False,
        default=UserRole.user,
    )

    first_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    last_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    middle_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)

    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    last_login_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    blocked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    requests: Mapped[list["Request"]] = relationship(
        "Request", back_populates="creator", cascade="all, delete-orphan"
    )

    sessions: Mapped[list["UserSession"]] = relationship(
        "UserSession",
        back_populates="user",
        cascade="all, delete-orphan",
    )

    __table_args__ = (
        CheckConstraint("length(username) >= 3", name="ck_username_min_length"),
        CheckConstraint("length(username) <= 50", name="ck_username_max_length"),
        CheckConstraint("phone IS NULL OR length(phone) <= 32", name="ck_users_phone_max_length"),
    )

    @property
    def is_admin(self) -> bool:
        return self.role == UserRole.admin

    @property
    def full_name(self) -> str | None:
        parts = [self.last_name, self.first_name, self.middle_name]
        values = " ".join(part for part in parts if part)
        return values or None


class UserSession(IDMixin, TimestampsMixin, Base):
    """
    Represents a user session.

    Attributes:
        id (int): The unique identifier of the session.
        user_id (int): The ID of the user associated with the session.
        refresh_token_hash (str): The hashed refresh token for the session.
        expires_at (datetime): The expiration timestamp of the session.
        revoked_at (datetime | None): The timestamp when the session was revoked.
        user_agent (str | None): The user agent string of the session.
        ip_address (str | None): The IP address of the session.
        created_at (datetime): The timestamp when the session was created.
        updated_at (datetime): The timestamp when the session was last updated.
    """

    __tablename__ = "user_sessions"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    refresh_token_hash: Mapped[StrUniq]
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    remember_me: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user_agent: Mapped[str | None] = mapped_column(String(255), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(64), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="sessions")
