from typing import Annotated

from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.repositories.session_repository import SessionRepository


def get_session_repository(
    db_session: Annotated[AsyncSession, Depends(get_db)],
) -> SessionRepository:
    return SessionRepository(db_session)
