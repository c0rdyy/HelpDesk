import asyncio
from collections.abc import AsyncGenerator, Generator
from dataclasses import dataclass
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

from app.core.config import get_settings
from app.core.database import get_db
from app.core.security import get_password_hash
from app.enums import UserRole
from app.models import Base
from app.models.user import User
from app.routers.auth import router as auth_router
from app.routers.requests import router as requests_router
from app.routers.users import router as users_router


@dataclass(frozen=True)
class DatabaseContext:
    engine: AsyncEngine
    session_maker: async_sessionmaker[AsyncSession]


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
                email="admin@example.com",
                hashed_password=get_password_hash("admin"),
                role=UserRole.admin,
                is_active=True,
                is_verified=True,
            )
        )
        session.add(
            User(
                username="blocked",
                email="blocked@example.com",
                hashed_password=get_password_hash("blocked"),
                role=UserRole.user,
                is_active=False,
                is_verified=True,
            )
        )
        await session.commit()


@pytest.fixture
def test_db(tmp_path: Path) -> Generator[DatabaseContext]:
    database_url = f"sqlite+aiosqlite:///{tmp_path / 'test.db'}"
    engine = create_async_engine(database_url)
    session_maker = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        expire_on_commit=False,
    )

    asyncio.run(_prepare_database(engine, session_maker))

    yield DatabaseContext(engine=engine, session_maker=session_maker)

    asyncio.run(engine.dispose())


@pytest.fixture
def client(test_db: DatabaseContext) -> Generator[TestClient]:
    async def override_get_db() -> AsyncGenerator[AsyncSession]:
        async with test_db.session_maker() as session:
            yield session

    settings = get_settings()
    app = FastAPI()
    app.include_router(requests_router, prefix=settings.API_PREFIX)
    app.include_router(auth_router, prefix=settings.API_PREFIX)
    app.include_router(users_router, prefix=settings.API_PREFIX)
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()


@pytest.fixture
def admin_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin"},
    )

    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
