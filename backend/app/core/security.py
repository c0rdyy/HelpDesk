import hashlib
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify plain password against hashed password
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Generate password hash from plain password
    """
    return pwd_context.hash(password)


def hash_token(token: str) -> str:
    """
    Generate token hash
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def create_access_token(subject: str) -> str:
    """
    Create JWT refresh token
    """
    settings = get_settings()
    expire = datetime.now(UTC) + timedelta(minutes=settings.JWT_ACCESS_TTL_MINUTES)

    payload: dict[str, Any] = {"sub": subject, "type": "access", "exp": expire}

    encoded_jwt = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> dict[str, Any]:
    """
    Decode JWT token
    """
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])

        if payload.get("type") != "access":
            raise ValueError("Invalid token type!")

        return payload
    except (JWTError, ValueError) as exc:
        raise ValueError("Invalid token") from exc


def create_refresh_token(subject: str, expires_at: datetime) -> str:
    """
    Create JWT refresh token
    """
    settings = get_settings()

    payload: dict[str, Any] = {"sub": subject, "type": "refresh", "exp": expires_at}

    encoded_jwt = jwt.encode(payload, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt


def decode_refresh_token(token: str) -> dict[str, Any]:
    """
    Decode JWT refresh token
    """
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])

        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type!")

        return payload
    except (JWTError, ValueError) as exc:
        raise ValueError("Invalid token") from exc
