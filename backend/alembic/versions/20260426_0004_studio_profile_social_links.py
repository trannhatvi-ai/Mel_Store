"""ensure studio profile social link columns

Revision ID: 20260426_0004
Revises: 20260426_0003
Create Date: 2026-04-26
"""

import sqlalchemy as sa

from alembic import op

revision = "20260426_0004"
down_revision = "20260426_0003"
branch_labels = None
depends_on = None


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

    if "studio_profile" not in inspector.get_table_names():
        op.create_table(
            "studio_profile",
            sa.Column("id", sa.Integer(), nullable=False),
            sa.Column("name", sa.String(), nullable=False, server_default="Feli Studio"),
            sa.Column(
                "address",
                sa.String(),
                nullable=False,
                server_default="23 Dong Khoi, District 1, Saigon",
            ),
            sa.Column("email", sa.String(), nullable=False, server_default="hello@felistudio.vn"),
            sa.Column("bank_name", sa.String(), nullable=False, server_default="Vietcombank"),
            sa.Column("bank_account", sa.String(), nullable=False, server_default="0123 456 789"),
            sa.Column("bank_beneficiary", sa.String(), nullable=False, server_default="FELI STUDIO"),
            sa.Column("facebook_link", sa.String(), nullable=True),
            sa.Column("instagram_link", sa.String(), nullable=True),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.PrimaryKeyConstraint("id"),
        )
        _seed_default_profile()
        return

    existing_columns = {column["name"] for column in inspector.get_columns("studio_profile")}
    if "facebook_link" not in existing_columns:
        op.add_column("studio_profile", sa.Column("facebook_link", sa.String(), nullable=True))
    if "instagram_link" not in existing_columns:
        op.add_column("studio_profile", sa.Column("instagram_link", sa.String(), nullable=True))

    _seed_default_profile()


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "studio_profile" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("studio_profile")}
    if "instagram_link" in existing_columns:
        op.drop_column("studio_profile", "instagram_link")
    if "facebook_link" in existing_columns:
        op.drop_column("studio_profile", "facebook_link")
