from typing import Annotated

from sqlalchemy import Text
from sqlalchemy.orm import DeclarativeBase, mapped_column

StrUniq = Annotated[str, mapped_column(Text, unique=True, nullable=False)]


class Base(DeclarativeBase):
    pass
