import asyncio
from collections.abc import AsyncGenerator, Generator
from pathlib import Path

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.database import get_db
from app.core.security import get_password_hash
from app.models import Base
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.requests import router as requests_router


async def _prepare_database(
    engine: AsyncEngine,
    session_maker: async_sessionmaker[AsyncSession],
) -> None:
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    async with session_maker() as session:
        session.add(
            User(
                username="admin",
                hashed_password=get_password_hash("admin"),
                is_admin=True,
            )
        )
        await session.commit()


@pytest.fixture
def client(tmp_path: Path) -> Generator[TestClient]:
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'test.db'}"
    engine = create_async_engine(database_url)
    session_maker = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    asyncio.run(_prepare_database(engine, session_maker))

    async def override_get_db() -> AsyncGenerator[AsyncSession]:
        async with session_maker() as session:
            yield session

    app = FastAPI()
    app.include_router(requests_router)
    app.include_router(auth_router)
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    asyncio.run(engine.dispose())
