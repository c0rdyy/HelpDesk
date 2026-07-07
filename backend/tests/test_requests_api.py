import asyncio
from typing import Any

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.core.security import get_password_hash
from app.enums import RequestPriority, UserRole
from app.models.request import Request
from app.models.user import User
from tests.conftest import DatabaseContext


async def _create_user_record(
    session_maker: async_sessionmaker[AsyncSession],
    username: str,
    email: str,
) -> dict[str, Any]:
    async with session_maker() as session:
        user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash("password"),
            role=UserRole.user,
            is_active=True,
            is_verified=True,
        )
        session.add(user)
        await session.commit()
        await session.refresh(user)

        return {"id": user.id, "username": user.username}


def _create_user(test_db: DatabaseContext, username: str, email: str) -> dict[str, Any]:
    return asyncio.run(_create_user_record(test_db.session_maker, username, email))


async def _create_request_record(
    session_maker: async_sessionmaker[AsyncSession],
    title: str,
    priority: str = "normal",
    description: str | None = None,
    creator_username: str = "admin",
) -> dict[str, Any]:
    async with session_maker() as session:
        result = await session.execute(select(User.id).where(User.username == creator_username))
        creator_id = result.scalar_one()

        request = Request(
            title=title,
            description=description,
            priority=RequestPriority(priority),
            creator_id=creator_id,
        )
        session.add(request)
        await session.commit()
        await session.refresh(request)

        return {"id": request.id, "title": request.title}


def _create_request(
    test_db: DatabaseContext,
    title: str,
    priority: str = "normal",
    description: str | None = None,
    creator_username: str = "admin",
) -> dict[str, Any]:
    return asyncio.run(
        _create_request_record(
            test_db.session_maker,
            title=title,
            priority=priority,
            description=description,
            creator_username=creator_username,
        )
    )


def test_create_and_list_requests_with_filters_search_sorting_and_pagination(
    client: TestClient,
    test_db: DatabaseContext,
) -> None:
    _create_request(
        test_db,
        title="Printer jam",
        description="Paper is stuck",
        priority="high",
    )
    _create_request(
        test_db,
        title="VPN problem",
        description="Cannot connect from home",
        priority="low",
    )
    _create_request(
        test_db,
        title="Printer toner",
        description=None,
        priority="normal",
    )

    response = client.get(
        "/api/requests",
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
    assert data["items"][0]["creator"]["username"] == "admin"


def test_list_requests_can_filter_by_creator_id(
    client: TestClient,
    test_db: DatabaseContext,
) -> None:
    user = _create_user(test_db, username="regular", email="regular@example.com")
    _create_request(test_db, title="Admin request")
    _create_request(
        test_db,
        title="Regular user request",
        creator_username=user["username"],
    )

    response = client.get("/api/requests", params={"creator_id": user["id"]})

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["items"][0]["title"] == "Regular user request"
    assert data["items"][0]["creator"]["id"] == user["id"]


def test_admin_can_fully_update_request(
    client: TestClient,
    test_db: DatabaseContext,
    admin_headers: dict[str, str],
) -> None:
    request = _create_request(
        test_db,
        title="Old title",
        description="Old description",
        priority="low",
    )

    response = client.patch(
        f"/api/requests/{request['id']}",
        headers=admin_headers,
        json={
            "title": "Updated title",
            "description": "Updated description",
            "priority": "high",
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Updated title"
    assert data["description"] == "Updated description"
    assert data["priority"] == "high"
    assert data["creator"]["username"] == "admin"


def test_full_update_requires_admin(
    client: TestClient,
    test_db: DatabaseContext,
) -> None:
    request = _create_request(test_db, title="Protected update")
    register_response = client.post(
        "/api/auth/register",
        json={
            "username": "notadmin",
            "email": "notadmin@example.com",
            "password": "password123",
            "confirm_password": "password123",
        },
    )
    assert register_response.status_code == 201
    token = register_response.json()["access_token"]

    response = client.patch(
        f"/api/requests/{request['id']}",
        headers={"Authorization": f"Bearer {token}"},
        json={"title": "User update"},
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Only admin can perform this action"


def test_done_request_cannot_be_fully_updated(
    client: TestClient,
    test_db: DatabaseContext,
    admin_headers: dict[str, str],
) -> None:
    request = _create_request(test_db, title="Completed request")

    response = client.patch(
        f"/api/requests/{request['id']}/status",
        json={"status": "done"},
    )
    assert response.status_code == 200

    response = client.patch(
        f"/api/requests/{request['id']}",
        headers=admin_headers,
        json={"title": "Cannot update"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Done request cannot be edited"


def test_update_status_and_reject_editing_done_request(
    client: TestClient,
    test_db: DatabaseContext,
) -> None:
    request = _create_request(test_db, title="Mouse replacement", priority="normal")
    request_id = request["id"]

    response = client.patch(
        f"/api/requests/{request_id}/status",
        json={"status": "in_progress"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "in_progress"

    response = client.patch(
        f"/api/requests/{request_id}/status",
        json={"status": "done"},
    )

    assert response.status_code == 200
    assert response.json()["status"] == "done"

    response = client.patch(
        f"/api/requests/{request_id}/status",
        json={"status": "new"},
    )

    assert response.status_code == 409
    assert response.json()["detail"] == "Done request cannot be edited"


def test_delete_requires_admin_token(client: TestClient, test_db: DatabaseContext) -> None:
    request = _create_request(test_db, title="Keyboard replacement")

    response = client.delete(f"/api/requests/{request['id']}")

    assert response.status_code == 401


def test_admin_can_delete_request(
    client: TestClient,
    test_db: DatabaseContext,
    admin_headers: dict[str, str],
) -> None:
    request = _create_request(test_db, title="Monitor replacement")

    response = client.delete(f"/api/requests/{request['id']}", headers=admin_headers)

    assert response.status_code == 204

    response = client.get("/api/requests")
    assert response.status_code == 200
    assert response.json()["total"] == 0


def test_done_request_cannot_be_deleted(
    client: TestClient,
    test_db: DatabaseContext,
    admin_headers: dict[str, str],
) -> None:
    request = _create_request(test_db, title="Laptop setup")

    response = client.patch(
        f"/api/requests/{request['id']}/status",
        json={"status": "done"},
    )
    assert response.status_code == 200

    response = client.delete(f"/api/requests/{request['id']}", headers=admin_headers)

    assert response.status_code == 409
    assert response.json()["detail"] == "Done request cannot be deleted"
