from datetime import UTC, datetime

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import UserSession
from app.schemas.auth import SUserSessionCreate


class SessionRepository:
    def __init__(self, db_session: AsyncSession) -> None:
        self.db_session = db_session

    async def create(self, data: SUserSessionCreate) -> UserSession:
        session = UserSession(
            user_id=data.user_id,
            refresh_token_hash=data.refresh_token_hash,
            expires_at=data.expires_at,
            remember_me=data.remember_me,
            user_agent=data.user_agent,
            ip_address=data.ip_address,
        )

        self.db_session.add(session)
        await self.db_session.commit()
        await self.db_session.refresh(session)

        return session

    async def get_active_by_token_hash(self, refresh_token_hash: str) -> UserSession | None:
        result = await self.db_session.execute(
            select(UserSession).where(
                UserSession.refresh_token_hash == refresh_token_hash,
                UserSession.revoked_at.is_(None),
                UserSession.expires_at > datetime.now(UTC),
            )
        )

        return result.scalar_one_or_none()

    async def revoke(self, session: UserSession) -> None:
        session.revoked_at = datetime.now(UTC)
        await self.db_session.commit()

    async def revoke_all_for_user(self, user_id: int) -> None:
        await self.db_session.execute(
            update(UserSession)
            .where(UserSession.user_id == user_id, UserSession.revoked_at.is_(None))
            .values(revoked_at=datetime.now(UTC))
        )

        await self.db_session.commit()
