from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import get_settings
from app.core.database import async_session_maker
from app.repositories.user_repository import UserRepository
from app.routers.auth import router as auth_router
from app.routers.requests import router as request_router
from app.services.user_service import UserService


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    async with async_session_maker() as db_session:
        repository = UserRepository(db_session)
        service = UserService(repository)
        await service.ensure_admin_exists()

    yield


app = FastAPI(
    title="HelpDesk API", version="0.1.0", docs_url="/docs", redoc_url="/redoc", lifespan=lifespan
)

settings = get_settings()


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(request_router)
app.include_router(auth_router)


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
