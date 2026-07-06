from datetime import datetime
from typing import Self

from pydantic import BaseModel, EmailStr, Field, model_validator


class SUserLogin(BaseModel):
    """
    Schema for user login data.

    Attributes:
        username (str): The username of the user.
        password (str): The password of the user.
        remember_me (bool): Option to remember the user.
    """

    username: str = Field(min_length=3, max_length=50, description="User login")
    password: str = Field(min_length=1, max_length=50, description="User password")
    remember_me: bool = Field(default=False, description="Remember me option")


class SUserRegister(BaseModel):
    """Schema for user registration data.

    Attributes:
      username (str): The username of the user.
      email (str): The email of the user.
      password (str): The password of the user.
      confirm_password (str): The password confirmation of the user.
    """

    username: str = Field(min_length=3, max_length=50, description="User login")
    email: EmailStr = Field(min_length=3, max_length=50, description="User email")
    password: str = Field(min_length=1, max_length=50, description="User password")
    confirm_password: str = Field(
        min_length=1, max_length=50, description="User password confirmation"
    )

    @model_validator(mode="after")
    def check_passwords_match(self) -> Self:
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self


class SUserSessionCreate(BaseModel):
    user_id: int
    refresh_token_hash: str
    expires_at: datetime
    remember_me: bool = False
    user_agent: str | None = None
    ip_address: str | None = None


class SToken(BaseModel):
    """
    Schema for JWT token response.

    Attributes:
        access_token (str): The JWT access token.
        token_type (str): The type of the token.
    """

    access_token: str = Field(description="JWT access token")
    token_type: str = "bearer"


class STokenPayload(BaseModel):
    """
    Schema for JWT token payload.

    Attributes:
        sub (str): The subject of the token.
    """

    sub: str
