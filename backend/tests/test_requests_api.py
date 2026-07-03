from typing import Any

from fastapi.testclient import TestClient


def _create_request(
    client: TestClient,
    title: str,
    priority: str = "normal",
    description: str | None = None,
) -> dict[str, Any]:
    response = client.post(
        "/requests",
        json={"title": title, "description": description, "priority": priority},
    )

    assert response.status_code == 201
    data: dict[str, Any] = response.json()
    return data


def _admin_headers(client: TestClient) -> dict[str, str]:
    response = client.post(
        "/auth/login",
        json={"username": "admin", "password": "admin"},
    )

    assert response.status_code == 200
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_create_and_list_requests_with_filters_search_sorting_and_pagination(
    client: TestClient,
) -> None:
    _create_request(
        client,
        title="Printer jam",
        description="Paper is stuck",
        priority="high",
    )
    _create_request(
        client,
        title="VPN problem",
        description="Cannot connect from home",
        priority="low",
    )
    _create_request(
        client,
        title="Printer toner",
        description=None,
        priority="normal",
    )

    response = client.get(
        "/requests",
        params={
            "status": "new",
            "priority": "high",
            "search": "printer",
            "sort_by": "priority",
            "sort_order": "desc",
            "page": 1,
            "page_size": 1,
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["page"] == 1
    assert data["page_size"] == 1
    assert data["pages"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["title"] == "Printer jam"
    assert data["items"][0]["status"] == "new"
    assert data["items"][0]["priority"] == "high"


def test_update_status_and_reject_editing_done_request(client: TestClient) -> None:
    request = _create_request(client, title="Mouse replacement", priority="normal")
    request_id = request["id"]

    response = client.patch(
        f"/requests/{request_id}/status",
        json={"status": "in_progress"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"

    response = client.patch(
        f"/requests/{request_id}/status",
        json={"status": "done"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "done"

    response = client.patch(
        f"/requests/{request_id}/status",
        json={"status": "new"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Done request cannot be edited"


def test_delete_requires_admin_token(client: TestClient) -> None:
    request = _create_request(client, title="Keyboard replacement")

    response = client.delete(f"/requests/{request['id']}")

    assert response.status_code == 401


def test_admin_can_delete_request(client: TestClient) -> None:
    request = _create_request(client, title="Monitor replacement")
    headers = _admin_headers(client)

    response = client.delete(f"/requests/{request['id']}", headers=headers)

    assert response.status_code == 204

    response = client.get("/requests")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_done_request_cannot_be_deleted(client: TestClient) -> None:
    request = _create_request(client, title="Laptop setup")
    headers = _admin_headers(client)

    response = client.patch(
        f"/requests/{request['id']}/status",
        json={"status": "done"},
    )
    assert response.status_code == 200

    response = client.delete(f"/requests/{request['id']}", headers=headers)

    assert response.status_code == 409
    assert response.json()["detail"] == "Done request cannot be deleted"


def test_login_rejects_invalid_password(client: TestClient) -> None:
    response = client.post(
        "/auth/login",
        json={"username": "admin", "password": "wrong"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid username or password"
