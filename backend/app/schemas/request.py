from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_validator

from app.enums import RequestPriority, RequestStatus


class RequestBase(BaseModel):
    title: str = Field(min_length=3, max_length=120, description="Title of the request")
    description: str | None = Field(
        default=None, max_length=1000, description="Detailed description of the request"
    )
    priority: RequestPriority = Field(
        default=RequestPriority.normal, description="Priority of the request"
    )


class SRequestCreate(RequestBase):
    pass


class SRequestInfo(RequestBase):
    id: int = Field(description="Unique request ID")
    status: RequestStatus = Field(description="Status of the request")
    created_at: datetime = Field(description="Request creation time")
    updated_at: datetime = Field(description="Request modification time")

    model_config = ConfigDict(from_attributes=True)


class SRequestStatusUpdate(BaseModel):
    status: RequestStatus = Field(description="New status of the request")


class SRequestList(BaseModel):
    items: list[SRequestInfo] = Field(description="List of requests")
    total: int = Field(ge=0, description="Total number of requests")
    page: int = Field(ge=1, description="Current page")
    page_size: int = Field(ge=1, description="Page size")

    model_config = ConfigDict(from_attributes=True)

    @computed_field
    def pages(self) -> int:
        return (self.total + self.page_size - 1) // self.page_size


class SRequestFilter(BaseModel):
    status: RequestStatus | None = Field(default=None, description="Filter requests by status")
    priority: RequestPriority | None = Field(
        default=None, description="Filter requests by priotity"
    )
    search: str | None = Field(
        default=None, min_length=1, max_length=200, description="The search bar"
    )
    sort_by: Literal["created_at", "priority"] = Field(
        default="created_at", description="Sorting field"
    )
    sort_order: Literal["asc", "desc"] = Field(default="desc", description="Sorting direction")
    page: int = Field(default=1, ge=1, description="Page number")
    page_size: int = Field(default=20, ge=1, le=100, description="Page size")

    @field_validator("search")
    @classmethod
    def normalize_searc(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None
