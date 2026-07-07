from typing import Annotated, Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.auth_dep import get_current_admin_user
from app.dependencies.users_dep import get_user_service
from app.models.user import User
from app.schemas.user import (
    SUserAdminInfo,
    SUserBlockUpdate,
    SUserFilter,
    SUserList,
    SUserRoleUpdate,
)
from app.services.user.user_exceptions import (
    CannotModifyOwnAccountError,
    LastAdminCannotBeModifiedError,
    UserNotFoundError,
)
from app.services.user.user_service import UserService

router = APIRouter(prefix="/admin/users", tags=["Admin - Users"])


@router.get("", response_model=SUserList)
async def get_users(
    filters: Annotated[SUserFilter, Depends()],
    service: Annotated[UserService, Depends(get_user_service)],
    _: Annotated[User, Depends(get_current_admin_user)],
) -> SUserList:
    """Retrieve a paginated list of users (admin only)"""

    return await service.get_list(filters)


@router.patch("/{user_id}/role", response_model=SUserAdminInfo)
async def update_user_role(
    user_id: int,
    data: SUserRoleUpdate,
    service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[User, Depends(get_current_admin_user)],
) -> Any:
    """Update a user`s role (admin only)"""

    try:
        return await service.update_role(user_id, data.role, current_user)
    except CannotModifyOwnAccountError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You cannot modify your own account"
        ) from exc
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc
    except LastAdminCannotBeModifiedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="At least one active admin must remain"
        ) from exc


@router.patch("/{user_id}/block", response_model=SUserAdminInfo)
async def update_user_block(
    user_id: int,
    data: SUserBlockUpdate,
    service: Annotated[UserService, Depends(get_user_service)],
    current_user: Annotated[User, Depends(get_current_admin_user)],
) -> Any:
    """Block or unblock user (admin only)"""

    try:
        return await service.update_block(user_id, data.is_active, current_user)
    except CannotModifyOwnAccountError as exc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="You cannot modify your own account"
        ) from exc
    except UserNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found") from exc
    except LastAdminCannotBeModifiedError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="At least one active admin must remain"
        ) from exc
