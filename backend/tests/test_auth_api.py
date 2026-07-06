import re

import pytest
from fastapi.testclient import TestClient


def _register_payload(
    username: str = "newuser",
    email: str = "newuser@example.com",
    password: str = "password123",
) -> dict[str, str]:
    return {
        "username": username,
        "email": email,
        "password": password,
        "confirm_password": password,
    }


def test_register_returns_access_token_and_refresh_cookie(client: TestClient) -> None:
    response = client.post("/api/auth/register", json=_register_payload())

    assert response.status_code == 201
    data = response.json()
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert response.cookies.get("refresh_token") is not None

    me_response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {data['access_token']}"},
    )

    assert me_response.status_code == 200
    assert me_response.json()["username"] == "newuser"


def test_register_rejects_duplicate_username(client: TestClient) -> None:
    response = client.post("/api/auth/register", json=_register_payload())
    assert response.status_code == 201

    response = client.post(
        "/api/auth/register",
        json=_register_payload(email="other@example.com"),
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "User with this username already exists"


def test_register_rejects_duplicate_email(client: TestClient) -> None:
    response = client.post("/api/auth/register", json=_register_payload())
    assert response.status_code == 201

    response = client.post(
        "/api/auth/register",
        json=_register_payload(username="otheruser"),
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "User with this email already exists"


def test_login_rejects_invalid_password(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"


def test_login_rejects_inactive_user(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "blocked", "password": "blocked"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"


def test_login_with_remember_me_sets_long_refresh_cookie(client: TestClient) -> None:
    response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin", "remember_me": True},
    )

    assert response.status_code == 200
    max_age_match = re.search(r"Max-Age=(\d+)", response.headers["set-cookie"])
    assert max_age_match is not None
    assert 2_591_990 <= int(max_age_match.group(1)) <= 2_592_000


@pytest.mark.xfail(
    reason="Refresh tokens currently lack a unique claim, so same-second rotation can duplicate "
    "refresh_token_hash.",
    strict=True,
)
def test_refresh_uses_cookie_and_returns_new_access_token(client: TestClient) -> None:
    login_response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin"},
    )
    assert login_response.status_code == 200

    response = client.post("/api/auth/refresh")

    assert response.status_code == 200
    data = response.json()
    assert data["token_type"] == "bearer"
    assert isinstance(data["access_token"], str)
    assert response.cookies.get("refresh_token") is not None


def test_refresh_requires_cookie(client: TestClient) -> None:
    response = client.post("/api/auth/refresh")

    assert response.status_code == 401
    assert response.json()["detail"] == "Refresh token missing"


def test_logout_revokes_refresh_cookie(client: TestClient) -> None:
    login_response = client.post(
        "/api/auth/login",
        json={"username": "admin", "password": "admin"},
    )
    assert login_response.status_code == 200

    logout_response = client.post("/api/auth/logout")
    assert logout_response.status_code == 204

    response = client.post("/api/auth/refresh")
    assert response.status_code == 401
