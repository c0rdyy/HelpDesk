"""convert status and priority to enum

Revision ID: 6cea35c451ca
Revises: 3338010c9721
Create Date: 2026-06-30 17:36:12.673289

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "6cea35c451ca"
down_revision: str | Sequence[str] | None = "3338010c9721"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.batch_alter_table("requests") as batch_op:
        batch_op.alter_column(
            "status",
            existing_type=sa.TEXT(),
            type_=sa.Enum(
                "new",
                "in_progress",
                "done",
                name="request_status",
                native_enum=False,
                length=20,
            ),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "priority",
            existing_type=sa.TEXT(),
            type_=sa.Enum(
                "low",
                "normal",
                "high",
                name="request_priority",
                native_enum=False,
                length=20,
            ),
            existing_nullable=False,
        )


def downgrade() -> None:
    """Downgrade schema."""
    with op.batch_alter_table("requests") as batch_op:
        batch_op.alter_column(
            "priority",
            existing_type=sa.Enum(
                "low",
                "normal",
                "high",
                name="request_priority",
                native_enum=False,
                length=20,
            ),
            type_=sa.TEXT(),
            existing_nullable=False,
        )
        batch_op.alter_column(
            "status",
            existing_type=sa.Enum(
                "new",
                "in_progress",
                "done",
                name="request_status",
                native_enum=False,
                length=20,
            ),
            type_=sa.TEXT(),
            existing_nullable=False,
        )
