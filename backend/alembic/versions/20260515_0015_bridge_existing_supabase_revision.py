"""bridge existing Supabase revision

Revision ID: 20260515_0015
Revises: 20260426_0004
Create Date: 2026-05-15
"""

revision = "20260515_0015"
down_revision = "20260426_0004"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """No-op bridge for databases already stamped with this revision."""


def downgrade() -> None:
    """No-op bridge; schema changes are represented by earlier migrations."""

