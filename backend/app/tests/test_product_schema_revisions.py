from alembic.config import Config
from alembic.script import ScriptDirectory


def test_product_price_per_day_reconcile_revision_is_current_head() -> None:
    config = Config("alembic.ini")
    script = ScriptDirectory.from_config(config)

    revision = script.get_revision("20260516_0002")

    assert script.get_current_head() == "20260516_0002"
    assert revision is not None
    assert revision.down_revision == "20260516_0001"
