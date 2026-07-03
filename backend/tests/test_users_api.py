from fastapi.testclient import TestClient


def test_get_me_requires_authentication(client: TestClient) -> None:
    response = client.get("/users/me")

    assert response.status_code == 401


def test_get_me_rejects_invalid_token(client: TestClient) -> None:
    response = client.get("/users/me", headers={"Authorization": "Bearer not-a-real-token"})

    assert response.status_code == 401


def test_get_me_returns_current_admin(client: TestClient, admin_headers: dict[str, str]) -> None:
    response = client.get("/users/me", headers=admin_headers)

    assert response.status_code == 200

    data = response.json()
    assert data["username"] == "admin"
    assert data["is_admin"] is True
    assert isinstance(data["id"], int)
