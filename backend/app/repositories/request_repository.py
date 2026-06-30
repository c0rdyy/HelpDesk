from typing import Any

from sqlalchemy import Select, asc, case, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums import RequestPriority, RequestStatus
from app.models.request import Request
from app.schemas.request import SRequestCreate, SRequestFilter


class RequestRepository:
    def __init__(self, db_session: AsyncSession) -> None:
        self.db_session = db_session

    async def get_by_id(self, request_id: int) -> Request | None:
        return await self.db_session.get(Request, request_id)

    async def get_list(self, filters: SRequestFilter) -> list[Request]:
        offset = (filters.page - 1) * filters.page_size

        statement = select(Request)
        statement = self._apply_filters(statement, filters)
        statement = self._apply_sorting(statement, filters)
        statement = statement.offset(offset).limit(filters.page_size)

        result = await self.db_session.execute(statement)
        return list(result.scalars().all())

    async def create(self, data: SRequestCreate) -> Request:
        request = Request(title=data.title, description=data.description, priority=data.priority)

        self.db_session.add(request)
        await self.db_session.commit()
        await self.db_session.refresh(request)

        return request

    def _apply_sorting(self, statement: Select[Any], filters: SRequestFilter) -> Select[Any]:
        if filters.sort_by == "priority":
            priority_order = case(
                (Request.priority == RequestPriority.low, 1),
                (Request.priority == RequestPriority.normal, 2),
                (Request.priority == RequestPriority.high, 3),
                else_=0,
            )

            sort_expression = (
                desc(priority_order) if filters.sort_order == "desc" else asc(priority_order)
            )
        else:
            sort_expression = (
                desc(Request.created_at)
                if filters.sort_order == "desc"
                else asc(Request.created_at)
            )

        return statement.order_by(sort_expression, desc(Request.id))

    async def update_status(self, request: Request, status: RequestStatus) -> Request:
        request.status = status

        await self.db_session.commit()
        await self.db_session.refresh(request)

        return request

    async def delete(self, request: Request) -> None:
        await self.db_session.delete(request)
        await self.db_session.commit()

    async def count(self, filters: SRequestFilter) -> int:
        statement = select(func.count(Request.id))
        statement = self._apply_filters(statement, filters)

        result = await self.db_session.execute(statement)
        return int(result.scalar_one())

    def _apply_filters(self, statement: Select[Any], filters: SRequestFilter) -> Select[Any]:
        if filters.status is not None:
            statement = statement.where(Request.status == filters.status)

        if filters.priority is not None:
            statement = statement.where(Request.priority == filters.priority)

        if filters.search is not None:
            search = f"%{filters.search}%"

            statement = statement.where(
                or_(Request.title.ilike(search), Request.description.ilike(search))
            )

        return statement
