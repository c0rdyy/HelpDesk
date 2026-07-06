import asyncio
from typing import Any

from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.enums import RequestPriority
from app.models.request import Request
from app.models.user import User
from tests.conftest import DatabaseContext


async def _create_request_record(
    session_maker: async_sessionmaker[AsyncSession],
    title: str,
    priority: str = "normal",
    description: str | None = None,
) -> dict[str, Any]:
    async with session_maker() as session:
        result = await session.execute(select(User.id).where(User.username == "admin"))
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
) -> dict[str, Any]:
    return asyncio.run(
        _create_request_record(
            test_db.session_maker,
            title=title,
            priority=priority,
            description=description,
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
