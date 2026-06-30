from pydantic import BaseModel, Field


class SUserAuth(BaseModel):
    username: str = Field(min_length=3, max_length=50, description="Admin login")
    password: str = Field(min_length=1, max_length=50, description="Admin password")


class SToken(BaseModel):
    access_token: str = Field(description="JWT access token")
    token_type: str = "bearer"


class STokenPayload(BaseModel):
    sub: str
