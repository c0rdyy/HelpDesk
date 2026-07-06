from datetime import UTC, datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status

from app.core.config import get_settings
from app.dependencies.users_dep import get_user_service
from app.schemas.auth import SToken, SUserLogin, SUserRegister
from app.services.user_exceptions import (
    EmailAlreadyExistsError,
    InvalidRefreshTokenError,
    UsernameAlreadyExistsError,
)
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Auth"])


def _set_refresh_cookie(response: Response, refresh_token: str, expires_at: datetime) -> None:
    settings = get_settings()

    max_age = int((expires_at - datetime.now(UTC)).total_seconds())

    response.set_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=max_age,
        httponly=True,
        secure=settings.REFRESH_COOKIE_SECURE,
        samesite=settings.REFRESH_COOKIE_SAMESITE,
        path=settings.REFRESH_COOKIE_PATH,
    )


def _clear_refresh_cookie(response: Response) -> None:
    settings = get_settings()

    response.delete_cookie(
        key=settings.REFRESH_COOKIE_NAME,
        path=settings.REFRESH_COOKIE_PATH,
        secure=settings.REFRESH_COOKIE_SECURE,
        httponly=True,
        samesite=settings.REFRESH_COOKIE_SAMESITE,
    )


def _client_meta(request: Request) -> tuple[str | None, str | None]:
    user_agent = request.headers.get("user-agent")
    ip_address = request.client.host if request.client else None

    return user_agent, ip_address


@router.post("/register", response_model=SToken, status_code=status.HTTP_201_CREATED)
async def register(
    data: SUserRegister,
    request: Request,
    response: Response,
    service: Annotated[UserService, Depends(get_user_service)],
) -> SToken:
    try:
        user = await service.register(data=data)
    except UsernameAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User with this username already exists",
        ) from exc
    except EmailAlreadyExistsError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="User with this email already exists"
        ) from exc

    ua, ip = _client_meta(request)

    access_token, refresh_token, refresh_expires_at = await service.issue_tokens(
        user=user, remember_me=False, user_agent=ua, ip_address=ip
    )
    _set_refresh_cookie(response, refresh_token, refresh_expires_at)

    return SToken(access_token=access_token)


@router.post("/login", response_model=SToken)
async def login(
    data: SUserLogin,
    request: Request,
    response: Response,
    service: Annotated[UserService, Depends(get_user_service)],
) -> SToken:
    user = await service.authenticate(data)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    ua, ip = _client_meta(request)

    access_token, refresh_token, refresh_expires_at = await service.issue_tokens(
        user=user, remember_me=data.remember_me, user_agent=ua, ip_address=ip
    )
    _set_refresh_cookie(response, refresh_token, refresh_expires_at)

    return SToken(access_token=access_token)


@router.post("/refresh", response_model=SToken)
async def refresh(
    request: Request,
    response: Response,
    service: Annotated[UserService, Depends(get_user_service)],
) -> SToken:
    settings = get_settings()

    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if refresh_token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token missing",
        )

    ua, ip = _client_meta(request)

    try:
        access_token, new_refresh, refresh_expires_at = await service.refresh_tokens(
            refresh_token, ua, ip
        )
    except InvalidRefreshTokenError as exc:
        _clear_refresh_cookie(response)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        ) from exc

    _set_refresh_cookie(response, new_refresh, refresh_expires_at)
    return SToken(access_token=access_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request, response: Response, service: Annotated[UserService, Depends(get_user_service)]
) -> None:
    settings = get_settings()

    refresh_token = request.cookies.get(settings.REFRESH_COOKIE_NAME)
    if refresh_token is not None:
        await service.logout(refresh_token)

    _clear_refresh_cookie(response)
