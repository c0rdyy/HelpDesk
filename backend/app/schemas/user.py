from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, computed_field

from app.enums import UserRole


class UserBase(BaseModel):
    """Base model for user data."""

    id: int = Field(description="Unique user ID")
    username: str = Field(
        min_length=3,
        max_length=50,
        description="The unique username used for account authentication",
        examples=["johndoe77"],
    )
    email: EmailStr = Field(
        description="The unique email address used for account authentication",
        examples=["test@example.com"],
    )


class SUserInfo(UserBase):
    """User information model.

    Attributes:
        is_admin (bool): Is the user an administrator.
    """

    is_admin: bool = Field(description="Is the user an administrator")

    model_config = ConfigDict(from_attributes=True)


class SUserAdminInfo(UserBase):
    """User admin information model.

    Attributes:
        full_name (str | None): Full name of the user.
        role (UserRole): Role of the user.
        is_active (bool): Is the user active.
        is_verified (bool): Is the user verified.
        created_at (datetime): Date and time the user was created.
        last_login_at (datetime | None): Date and time the user last logged in.
    """

    full_name: str | None = Field(default=None, description="Full name of the user")
    role: UserRole
    is_active: bool = Field(description="Is the user active")
    is_verified: bool = Field(description="Is the user verified")
    created_at: datetime = Field(description="Date and time the user was created")
    last_login_at: datetime | None = Field(
        default=None, description="Date and time the user last logged in"
    )
    blocked_at: datetime | None = Field(
        default=None, description="Date and time the user was blocked"
    )

    model_config = ConfigDict(from_attributes=True)


class SUserList(BaseModel):
    """User list model.

    Attributes:
        items (list[SUserAdminInfo]): List of user admin information.
        total (int): Total number of users.
        page (int): Page number.
        page_size (int): Page size.
    """

    items: list[SUserAdminInfo]
    total: int = Field(ge=0, description="Total number of users")
    page: int = Field(ge=1, description="Page number")
    page_size: int = Field(ge=1, description="Page size")

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    def pages(self) -> int:
        return max(1, (self.total + self.page_size - 1) // self.page_size)


class SUserFilter(BaseModel):
    """User filter model.

    Attributes:
        page (int): Page number.
        page_size (int): Page size.
    """

    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Page size")


class SUserRoleUpdate(BaseModel):
    """User role update model.

    Attributes:
        role (UserRole): Role of the user.
    """

    role: UserRole = Field(description="Role of the user")


class SUserBlockUpdate(BaseModel):
    """User block update model.

    Attributes:
        is_active (bool): Is the user active.
    """

    is_active: bool = Field(description="Is the user active")
