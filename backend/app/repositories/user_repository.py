from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    def __init__(self, db_session: AsyncSession) -> None:
        self.db_session = db_session

    async def get_by_username(self, username: str) -> User | None:
        result = await self.db_session.execute(select(User).where(User.username == username))
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: int) -> User | None:
        return await self.db_session.get(User, user_id)

    async def create_admin(self, username: str, hashed_password: str) -> User:
        user = User(username=username, hashed_password=hashed_password, is_admin=True)
        self.db_session.add(user)

        await self.db_session.commit()
        await self.db_session.refresh(user)

        return user
