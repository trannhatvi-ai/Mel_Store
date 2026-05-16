"""reconcile product price_per_day column

Revision ID: 20260516_0002
Revises: 20260516_0001
Create Date: 2026-05-16
"""

import sqlalchemy as sa

from alembic import op

revision = "20260516_0002"
down_revision = "20260516_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "products" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("products")}
    if "price_per_day" not in existing_columns:
        op.add_column(
            "products",
            sa.Column("price_per_day", sa.Boolean(), nullable=False, server_default=sa.false()),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    if "products" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("products")}
    if "price_per_day" in existing_columns:
        op.drop_column("products", "price_per_day")

