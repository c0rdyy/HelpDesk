from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserBase(BaseModel):
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


class SUserInfo(BaseModel):
    id: int = Field(description="Unique user ID")
    username: str = Field(
        description="The unique username used for account authentication",
        examples=["johndoe77"],
    )
    is_admin: bool = Field(description="Is the user an administrator")

    model_config = ConfigDict(from_attributes=True)
