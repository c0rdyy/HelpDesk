from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, Response, status

from app.dependencies.auth_dep import get_current_admin_user, get_current_user
from app.dependencies.requests_dep import get_request_service
from app.models.user import User
from app.schemas.request import (
    SRequestCreate,
    SRequestFilter,
    SRequestInfo,
    SRequestList,
    SRequestStatusUpdate,
    SRequestUpdate,
)
from app.services.request.request_exceptions import (
    DoneRequestCannotBeDeletedError,
    DoneRequestCannotBeEditedError,
    OnlyAdminCanDeleteRequestError,
    RequestNotFoundError,
)
from app.services.request.request_service import RequestService

router = APIRouter(prefix="/requests", tags=["Requests"])


@router.get("", response_model=SRequestList)
async def get_requests(
    filters: Annotated[SRequestFilter, Depends()],
    service: Annotated[RequestService, Depends(get_request_service)],
) -> SRequestList:
    """
    Retrieve requests
    """
    return await service.get_list(filters)


@router.post("", response_model=SRequestInfo, status_code=status.HTTP_201_CREATED)
async def create_request(
    data: SRequestCreate,
    service: Annotated[RequestService, Depends(get_request_service)],
    current_user: Annotated[User, Depends(get_current_user)],
) -> Any:
    """
    Create the new request
    """
    return await service.create(data, creator_id=current_user.id)


@router.patch("/{request_id}", response_model=SRequestInfo)
async def update_request(
    request_id: int,
    data: SRequestUpdate,
    service: Annotated[RequestService, Depends(get_request_service)],
    _: Annotated[User, Depends(get_current_admin_user)],
) -> Any:
    """Fully update a request's title/description/priority (admin only)"""

    try:
        return await service.update(request_id, data)
    except RequestNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Request not found"
        ) from exc
    except DoneRequestCannotBeEditedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Done request cannot be edited"
        ) from exc


@router.patch("/{request_id}/status", response_model=SRequestInfo)
async def update_request_status(
    request_id: int,
    data: SRequestStatusUpdate,
    service: Annotated[RequestService, Depends(get_request_service)],
) -> Any:
    """
    Updates the request status
    """
    try:
        return await service.update_status(request_id, data.status)
    except RequestNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Request not found"
        ) from exc
    except DoneRequestCannotBeEditedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Done request cannot be edited"
        ) from exc


@router.delete("/{request_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_request(
    request_id: int,
    service: Annotated[RequestService, Depends(get_request_service)],
    current_user: Annotated[User, Depends(get_current_admin_user)],
) -> Response:
    try:
        await service.delete(request_id, is_admin=current_user.is_admin)
    except OnlyAdminCanDeleteRequestError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admin can delete requests",
        ) from exc
    except RequestNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Request not found",
        ) from exc
    except DoneRequestCannotBeDeletedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Done request cannot be deleted",
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)
