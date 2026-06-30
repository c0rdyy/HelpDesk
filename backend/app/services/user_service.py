from app.core.config import get_settings
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import SToken, SUserAuth


class UserService:
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    async def ensure_admin_exists(self) -> None:
        settings = get_settings()
        user = await self.repository.get_by_username(settings.ADMIN_LOGIN)

        if user is None:
            await self.repository.create_admin(
                username=settings.ADMIN_LOGIN,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
            )

    async def authenticate(self, data: SUserAuth) -> User | None:
        user = await self.repository.get_by_username(data.username)

        if user is None:
            return None

        if not verify_password(data.password, user.hashed_password):
            return None

        return user

    def create_token_for_user(self, user: User) -> SToken:
        return SToken(access_token=create_access_token(subject=str(user.id)))
