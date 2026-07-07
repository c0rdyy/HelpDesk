from datetime import UTC, datetime

from sqlalchemy import desc, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.enums import UserRole
from app.models.user import User
from app.schemas.auth import SUserRegister
from app.schemas.user import SUserFilter


class UserRepository:
    """Repository for managing User entities."""

    def __init__(self, db_session: AsyncSession) -> None:
        self.db_session = db_session

    async def get_by_username(self, username: str) -> User | None:
        result = await self.db_session.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_email(self, email: str) -> User | None:
        result = await self.db_session.execute(select(User).where(User.email == email))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        return await self.db_session.get(User, user_id)

    async def create_user(self, data: SUserRegister, hashed_password: str) -> User:
        user = User(
            username=data.username,
            email=data.email,
            hashed_password=hashed_password,
            role=UserRole.user,
        )

        self.db_session.add(user)
        await self.db_session.commit()
        await self.db_session.refresh(user)

        return user

    async def get_list(self, filters: SUserFilter) -> list[User]:
        offset = (filters.page - 1) * filters.page_size

        statement = (
            select(User).order_by(desc(User.created_at)).offset(offset).limit(filters.page_size)
        )

        result = await self.db_session.execute(statement)
        return list(result.scalars().all())

    async def count(self) -> int:
        result = await self.db_session.execute(select(func.count(User.id)))
        return int(result.scalar_one())

    async def count_other_active_admins(self, exclude_user_id: int) -> int:
        statement = select(func.count(User.id)).where(
            User.role == UserRole.admin, User.is_active.is_(True), User.id != exclude_user_id
        )

        result = await self.db_session.execute(statement)
        return int(result.scalar_one())

    async def update_role(self, user: User, role: UserRole) -> User:
        user.role = role

        await self.db_session.commit()
        await self.db_session.refresh(user)

        return user

    async def update_block(self, user: User, is_active: bool) -> User:
        user.is_active = is_active
        user.blocked_at = None if is_active else datetime.now(UTC)

        await self.db_session.commit()
        await self.db_session.refresh(user)

        return user

    async def update_last_login_at(self, user: User) -> User:
        user.last_login_at = datetime.now(UTC)

        await self.db_session.commit()
        await self.db_session.refresh(user)

        return user
