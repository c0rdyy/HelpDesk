from pydantic import BaseModel, ConfigDict, Field


class SUserInfo(BaseModel):
    id: int = Field(description="Unique user ID")
    username: str = Field(
        description="The unique username used for account authentication",
        examples=["johndoe77"],
    )
    is_admin: bool = Field(description="Is the user an administrator")

    model_config = ConfigDict(from_attributes=True)
