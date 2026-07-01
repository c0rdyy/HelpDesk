from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies.users_dep import get_user_service
from app.schemas.auth import SToken, SUserAuth
from app.services.user_service import UserService

router = APIRouter(prefix="/auth", tags=["Auth"])


# @router.post("/login", response_model=SToken)
# async def login(
#     form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
#     service: Annotated[UserService, Depends(get_user_service)],
# ) -> SToken:
#     user = await service.authenticate(
#         SUserAuth(username=form_data.username, password=form_data.password)
#     )

#     if user is None:
#         raise HTTPException(
#             status_code=status.HTTP_401_UNAUTHORIZED,
#             detail="Invalid username or password",
#             headers={"WWW-Authenticate": "Bearer"},
#         )

#     return service.create_token_for_user(user)


@router.post("/login", response_model=SToken)
async def login(
    data: SUserAuth, service: Annotated[UserService, Depends(get_user_service)]
) -> SToken:
    user = await service.authenticate(data)

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return service.create_token_for_user(user)
