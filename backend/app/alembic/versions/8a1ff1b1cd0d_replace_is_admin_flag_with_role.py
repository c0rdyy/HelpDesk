"""replace is_admin flag with role

Revision ID: 8a1ff1b1cd0d
Revises: 6cea35c451ca
Create Date: 2026-07-05 23:51:23.616013

"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "8a1ff1b1cd0d"
down_revision: str | Sequence[str] | None = "6cea35c451ca"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
