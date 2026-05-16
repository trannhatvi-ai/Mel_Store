"""reconcile orders and users schema

Revision ID: 20260516_0003
Revises: 20260516_0002
Create Date: 2026-05-16
"""

import sqlalchemy as sa

from alembic import op

revision = "20260516_0003"
down_revision = "20260516_0002"
branch_labels = None
depends_on = None


def _enum_labels(enum_name: str) -> set[str]:
    bind = op.get_bind()
    rows = bind.execute(
        sa.text(
            """
            SELECT enumlabel
            FROM pg_enum
            JOIN pg_type ON pg_enum.enumtypid = pg_type.oid
            WHERE typname = :enum_name
            """
        ),
        {"enum_name": enum_name},
    )
    return {row[0] for row in rows}


def _recreate_user_role_enum() -> None:
    bind = op.get_bind()
    labels = _enum_labels("user_role")
    if labels == {"GUEST", "STUDIO", "ADMIN"}:
        return

    op.execute("ALTER TABLE users ALTER COLUMN role DROP DEFAULT")
    op.execute("ALTER TYPE user_role RENAME TO user_role_old")
    op.execute("CREATE TYPE user_role AS ENUM ('GUEST', 'STUDIO', 'ADMIN')")
    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN role TYPE user_role
        USING (
            CASE role::text
                WHEN 'USER' THEN 'GUEST'
                WHEN 'STAFF' THEN 'STUDIO'
                WHEN 'GUEST' THEN 'GUEST'
                WHEN 'STUDIO' THEN 'STUDIO'
                WHEN 'ADMIN' THEN 'ADMIN'
                ELSE 'GUEST'
            END
        )::user_role
        """
    )
    op.execute("ALTER TABLE users ALTER COLUMN role SET DEFAULT 'GUEST'")
    bind.execute(sa.text("DROP TYPE user_role_old"))


def _recreate_user_permission_enum() -> None:
    bind = op.get_bind()
    labels = _enum_labels("user_permission")
    if labels == {"VIEW", "EDIT"}:
        return

    op.execute("ALTER TABLE users ALTER COLUMN permission DROP DEFAULT")
    op.execute("ALTER TYPE user_permission RENAME TO user_permission_old")
    op.execute("CREATE TYPE user_permission AS ENUM ('VIEW', 'EDIT')")
    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN permission TYPE user_permission
        USING (
            CASE permission::text
                WHEN 'NONE' THEN 'VIEW'
                WHEN 'READ_ONLY' THEN 'VIEW'
                WHEN 'FULL' THEN 'EDIT'
                WHEN 'VIEW' THEN 'VIEW'
                WHEN 'EDIT' THEN 'EDIT'
                ELSE 'VIEW'
            END
        )::user_permission
        """
    )
    op.execute("ALTER TABLE users ALTER COLUMN permission SET DEFAULT 'VIEW'")
    bind.execute(sa.text("DROP TYPE user_permission_old"))


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "orders" in tables:
        existing_order_columns = {column["name"] for column in inspector.get_columns("orders")}
        if "event_date" not in existing_order_columns:
            op.add_column("orders", sa.Column("event_date", sa.Date(), nullable=True))
            if "expected_delivery" in existing_order_columns:
                op.execute("UPDATE orders SET event_date = expected_delivery WHERE event_date IS NULL")
            op.execute("UPDATE orders SET event_date = CURRENT_DATE WHERE event_date IS NULL")
            op.alter_column("orders", "event_date", nullable=False)

    if "order_items" in tables:
        existing_item_columns = {column["name"] for column in inspector.get_columns("order_items")}
        if "days" not in existing_item_columns:
            op.add_column("order_items", sa.Column("days", sa.Integer(), nullable=True))

    if "users" in tables:
        _recreate_user_role_enum()
        _recreate_user_permission_enum()


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if "order_items" in tables:
        existing_item_columns = {column["name"] for column in inspector.get_columns("order_items")}
        if "days" in existing_item_columns:
            op.drop_column("order_items", "days")

    if "orders" in tables:
        existing_order_columns = {column["name"] for column in inspector.get_columns("orders")}
        if "event_date" in existing_order_columns:
            op.drop_column("orders", "event_date")

