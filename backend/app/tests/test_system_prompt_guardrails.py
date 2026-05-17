from types import SimpleNamespace

from app.schemas.admin import AISettingsDTO
from app.services.admin_service import update_ai_settings
from app.services.system_prompt import build_system_prompt


class DummySession:
    def __enter__(self):
        return object()

    def __exit__(self, exc_type, exc, traceback):
        return False


class FakeSettingsDb:
    def __init__(self, setting):
        self.setting = setting

    def get(self, model, key):
        return self.setting

    def add(self, setting):
        self.setting = setting

    def commit(self):
        pass

    def refresh(self, setting):
        pass


def test_build_system_prompt_replaces_cross_project_prompt_from_database(monkeypatch):
    import app.db.session as db_session
    import app.services.admin_service as admin_service

    wrong_brand = "H" + "tech"
    contaminated_prompt = (
        f"You are {wrong_brand} Store assistant. Recommend laptops, smartphones, and accessories."
    )

    monkeypatch.setattr(db_session, "SessionLocal", lambda: DummySession())
    monkeypatch.setattr(
        admin_service,
        "get_or_create_ai_settings",
        lambda db: SimpleNamespace(system_prompt=contaminated_prompt),
    )

    prompt = build_system_prompt("vi")

    assert wrong_brand not in prompt
    assert "laptops" not in prompt
    assert "smartphones" not in prompt
    assert "Feli Studio" in prompt
    assert "dress rental" in prompt.lower()


def test_build_system_prompt_always_includes_project_identity(monkeypatch):
    import app.db.session as db_session
    import app.services.admin_service as admin_service

    monkeypatch.setattr(db_session, "SessionLocal", lambda: DummySession())
    monkeypatch.setattr(
        admin_service,
        "get_or_create_ai_settings",
        lambda db: SimpleNamespace(system_prompt="Custom booking assistant prompt."),
    )

    prompt = build_system_prompt("vi")

    assert "Mel Store" in prompt
    assert "Feli Studio" in prompt
    assert "photography" in prompt.lower()
    assert "dress rental" in prompt.lower()


def test_update_ai_settings_sanitizes_cross_project_prompt():
    wrong_brand = "H" + "tech"
    setting = SimpleNamespace(
        id=1,
        google_client_id=None,
        google_client_secret=None,
        database_url=None,
        system_prompt=None,
    )
    db = FakeSettingsDb(setting)
    payload = AISettingsDTO(
        chat_provider="gemini",
        chat_model="gemini-2.0-flash",
        embedding_provider="gemini",
        embedding_model="gemini-embedding-001",
        system_prompt=f"{wrong_brand} Store assistant for laptop and smartphone sales.",
    )

    updated = update_ai_settings(db, payload)

    assert wrong_brand not in updated.system_prompt
    assert "laptop" not in updated.system_prompt
    assert "smartphone" not in updated.system_prompt
    assert "Feli Studio" in updated.system_prompt
