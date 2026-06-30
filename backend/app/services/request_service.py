from app.enums import RequestStatus
from app.models.request import Request
from app.repositories.request_repository import RequestRepository
from app.schemas.request import SRequestCreate, SRequestFilter, SRequestInfo, SRequestList
from app.services.request_exceptions import (
    DoneRequestCannotBeDeletedError,
    DoneRequestCannotBeEditedError,
    OnlyAdminCanDeleteRequestError,
    RequestNotFoundError,
)


class RequestService:
    def __init__(self, repository: RequestRepository) -> None:
        self.repository = repository

    async def create(self, data: SRequestCreate) -> Request:
        return await self.repository.create(data)

    async def get_list(self, filters: SRequestFilter) -> SRequestList:
        requests = await self.repository.get_list(filters)
        total = await self.repository.count(filters)

        return SRequestList(
            items=[SRequestInfo.model_validate(request) for request in requests],
            total=total,
            page=filters.page,
            page_size=filters.page_size,
        )

    async def update_status(self, request_id: int, status: RequestStatus) -> Request:
        request = await self.repository.get_by_id(request_id)

        if request is None:
            raise RequestNotFoundError

        if request.status == RequestStatus.done:
            raise DoneRequestCannotBeEditedError

        return await self.repository.update_status(request, status)

    async def delete(self, request_id: int, is_admin: bool) -> None:
        if not is_admin:
            raise OnlyAdminCanDeleteRequestError

        request = await self.repository.get_by_id(request_id)

        if request is None:
            raise RequestNotFoundError

        if request.status == RequestStatus.done:
            raise DoneRequestCannotBeDeletedError

        await self.repository.delete(request)
