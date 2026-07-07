from typing import cast

from fastapi.testclient import TestClient


def _register_user(
    client: TestClient,
    username: str = "member",
    email: str = "member@example.com",
) -> dict[str, object]:
    response = client.post(
        "/api/auth/register",
        json={
            "username": username,
            "email": email,
            "password": "password123",
            "confirm_password": "password123",
        },
    )
    assert response.status_code == 201

    token = response.json()["access_token"]
    me_response = client.get(
        "/api/users/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200

    return cast("dict[str, object]", me_response.json())


def test_admin_users_list_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/admin/users")

    assert response.status_code == 401


def test_admin_can_list_users(client: TestClient, admin_headers: dict[str, str]) -> None:
    response = client.get(
        "/api/admin/users",
        headers=admin_headers,
        params={"page": 1, "page_size": 1},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert data["page"] == 1
    assert data["page_size"] == 1
    assert data["pages"] == 2
    assert len(data["items"]) == 1
    assert {"id", "username", "email", "role", "is_active", "is_verified"}.issubset(
        data["items"][0]
    )


def test_admin_can_update_user_role(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    user = _register_user(client, username="roleuser", email="roleuser@example.com")

    response = client.patch(
        f"/api/admin/users/{user['id']}/role",
        headers=admin_headers,
        json={"role": "admin"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user["id"]
    assert data["username"] == "roleuser"
    assert data["role"] == "admin"


def test_admin_can_block_and_unblock_user(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    user = _register_user(client, username="blockuser", email="blockuser@example.com")

    response = client.patch(
        f"/api/admin/users/{user['id']}/block",
        headers=admin_headers,
        json={"is_active": False},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is False
    assert data["blocked_at"] is not None

    response = client.patch(
        f"/api/admin/users/{user['id']}/block",
        headers=admin_headers,
        json={"is_active": True},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["is_active"] is True
    assert data["blocked_at"] is None


def test_admin_cannot_modify_own_account(
    client: TestClient,
    admin_headers: dict[str, str],
) -> None:
    me_response = client.get("/api/users/me", headers=admin_headers)
    assert me_response.status_code == 200
    admin_id = me_response.json()["id"]

    response = client.patch(
        f"/api/admin/users/{admin_id}/role",
        headers=admin_headers,
        json={"role": "user"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "You cannot modify your own account"
