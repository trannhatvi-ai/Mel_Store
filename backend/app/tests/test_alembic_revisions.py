from alembic.config import Config
from alembic.script import ScriptDirectory


def test_deployed_supabase_revision_is_known_to_alembic() -> None:
    config = Config("alembic.ini")
    script = ScriptDirectory.from_config(config)

    revision = script.get_revision("20260515_0015")

    assert revision is not None
    assert revision.revision == "20260515_0015"


def test_schema_reconcile_revision_runs_after_deployed_revision() -> None:
    config = Config("alembic.ini")
    script = ScriptDirectory.from_config(config)

    revision = script.get_revision("20260516_0001")

    assert script.get_current_head() == "20260516_0001"
    assert revision is not None
    assert revision.down_revision == "20260515_0015"
