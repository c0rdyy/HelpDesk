from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.dependencies.session_dep import get_session_repository
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService


def get_user_repository(
    db_session: Annotated[AsyncSession, Depends(get_db)],
) -> UserRepository:
    return UserRepository(db_session)


def get_user_service(
    repository: Annotated[UserRepository, Depends(get_user_repository)],
    session_repository: Annotated[SessionRepository, Depends(get_session_repository)],
) -> UserService:
    return UserService(repository, session_repository)
