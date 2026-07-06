from datetime import UTC, datetime, timedelta

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    get_password_hash,
    hash_token,
    verify_password,
)
from app.models.user import User
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import SUserLogin, SUserRegister, SUserSessionCreate
from app.services.user_exceptions import (
    EmailAlreadyExistsError,
    InvalidRefreshTokenError,
    UsernameAlreadyExistsError,
)


class UserService:
    def __init__(self, repository: UserRepository, session_repository: SessionRepository) -> None:
        self.repository = repository
        self.session_repository = session_repository

    async def register(self, data: SUserRegister) -> User:
        if await self.repository.get_by_username(data.username) is not None:
            raise UsernameAlreadyExistsError(data.username)

        if await self.repository.get_by_email(data.email) is not None:
            raise EmailAlreadyExistsError(data.email)

        user = await self.repository.create_user(
            data=data, hashed_password=get_password_hash(data.password)
        )

        return user

    async def authenticate(self, data: SUserLogin) -> User | None:
        user = await self.repository.get_by_username(data.username)

        if user is None or not user.is_active:
            return None

        if not verify_password(data.password, user.hashed_password):
            return None

        return user

    async def issue_tokens(
        self, user: User, remember_me: bool, user_agent: str | None, ip_address: str | None
    ) -> tuple[str, str, datetime]:
        settings = get_settings()

        refresh_ttl_days = (
            settings.JWT_REFRESH_REMEMBER_TTL_DAYS if remember_me else settings.JWT_REFRESH_TTL_DAYS
        )

        refresh_expires_at = datetime.now(UTC) + timedelta(days=refresh_ttl_days)

        access_token = create_access_token(subject=str(user.id))
        refresh_token = create_refresh_token(subject=str(user.id), expires_at=refresh_expires_at)

        await self.session_repository.create(
            SUserSessionCreate(
                user_id=user.id,
                refresh_token_hash=hash_token(refresh_token),
                expires_at=refresh_expires_at,
                remember_me=remember_me,
                user_agent=user_agent,
                ip_address=ip_address,
            )
        )
        return access_token, refresh_token, refresh_expires_at

    async def refresh_tokens(
        self, refresh_token: str, user_agent: str | None, ip_address: str | None
    ) -> tuple[str, str, datetime]:
        try:
            payload = decode_refresh_token(refresh_token)
            user_id = int(payload["sub"])
        except (ValueError, KeyError) as exc:
            raise InvalidRefreshTokenError from exc

        session = await self.session_repository.get_active_by_token_hash(hash_token(refresh_token))

        if session is None:
            await self.session_repository.revoke_all_for_user(user_id)
            raise InvalidRefreshTokenError

        remember_me = session.remember_me

        user = await self.repository.get_by_id(user_id)
        if user is None or not user.is_active:
            raise InvalidRefreshTokenError

        await self.session_repository.revoke(session)
        return await self.issue_tokens(
            user=user, remember_me=remember_me, user_agent=user_agent, ip_address=ip_address
        )

    async def logout(self, refresh_token: str) -> None:
        try:
            decode_refresh_token(refresh_token)
        except ValueError:
            return

        session = await self.session_repository.get_active_by_token_hash(hash_token(refresh_token))

        if session is not None:
            await self.session_repository.revoke(session)
