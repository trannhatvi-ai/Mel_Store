"""reconcile studio profile schema

Revision ID: 20260516_0001
Revises: 20260515_0015
Create Date: 2026-05-16
"""

import sqlalchemy as sa

from alembic import op

revision = "20260516_0001"
down_revision = "20260515_0015"
branch_labels = None
depends_on = None


def _create_studio_profile_table() -> None:
    op.create_table(
        "studio_profile",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(), nullable=False, server_default="Feli Studio"),
        sa.Column("address", sa.String(), nullable=False, server_default="23 Dong Khoi, District 1, Saigon"),
        sa.Column("email", sa.String(), nullable=False, server_default="hello@felistudio.vn"),
        sa.Column("bank_name", sa.String(), nullable=False, server_default="Vietcombank"),
        sa.Column("bank_account", sa.String(), nullable=False, server_default="0123 456 789"),
        sa.Column("bank_beneficiary", sa.String(), nullable=False, server_default="FELI STUDIO"),
        sa.Column("facebook_link", sa.String(), nullable=True),
        sa.Column("instagram_link", sa.String(), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def _seed_from_store_profile() -> None:
    op.execute(
        """
        INSERT INTO studio_profile (
            id,
            name,
            address,
            email,
            bank_name,
            bank_account,
            bank_beneficiary,
            facebook_link,
            instagram_link,
            updated_at
        )
        SELECT
            id,
            name,
            address,
            email,
            bank_name,
            bank_account,
            bank_beneficiary,
            facebook_link,
            instagram_link,
            COALESCE(updated_at, now())
        FROM store_profile
        WHERE id = 1
        ON CONFLICT (id) DO NOTHING
        """
    )


def _seed_default_profile() -> None:
    op.execute(
        """
        INSERT INTO studio_profile (
            id,
            name,
            address,
            email,
            bank_name,
            bank_account,
            bank_beneficiary
        )
        VALUES (
            1,
            'Feli Studio',
            '23 Dong Khoi, District 1, Saigon',
            'hello@felistudio.vn',
            'Vietcombank',
            '0123 456 789',
            'FELI STUDIO'
        )
        ON CONFLICT (id) DO NOTHING
        """
    )


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "studio_profile" not in tables:
        _create_studio_profile_table()
    else:
        existing_columns = {column["name"] for column in inspector.get_columns("studio_profile")}
        if "facebook_link" not in existing_columns:
            op.add_column("studio_profile", sa.Column("facebook_link", sa.String(), nullable=True))
        if "instagram_link" not in existing_columns:
            op.add_column("studio_profile", sa.Column("instagram_link", sa.String(), nullable=True))

    if "store_profile" in tables:
        _seed_from_store_profile()
    _seed_default_profile()


def downgrade() -> None:
    """No-op downgrade to avoid deleting recovered profile data."""

