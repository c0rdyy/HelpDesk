from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.request_repository import RequestRepository
from app.services.request_service import RequestService


def get_request_repository(
    db_session: Annotated[AsyncSession, Depends(get_db)],
) -> RequestRepository:
    return RequestRepository(db_session)


def get_request_service(
    repository: Annotated[RequestRepository, Depends(get_request_repository)],
) -> RequestService:
    return RequestService(repository)
