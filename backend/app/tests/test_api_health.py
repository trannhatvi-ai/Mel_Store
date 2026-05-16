import os

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/mel_store")
os.environ.setdefault("GEMINI_API_KEY", "test-key")

from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint() -> None:
    client = TestClient(app)
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


class FakeSession:
    def __init__(self, calls: list[str], should_fail: bool = False) -> None:
        self.calls = calls
        self.should_fail = should_fail

    def __enter__(self) -> "FakeSession":
        return self

    def __exit__(self, exc_type, exc, traceback) -> None:
        return None

    def execute(self, statement) -> None:
        self.calls.append(str(statement))
        if self.should_fail:
            raise RuntimeError("database unavailable")


def test_supabase_keepalive_runs_database_ping(monkeypatch) -> None:
    calls: list[str] = []

    monkeypatch.setenv("KEEPALIVE_TOKEN", "secret-token")
    monkeypatch.setattr("app.main.settings.keepalive_token", None, raising=False)
    monkeypatch.setattr("app.main.SessionLocal", lambda: FakeSession(calls), raising=False)

    client = TestClient(app)
    res = client.get("/health/supabase?token=secret-token")

    assert res.status_code == 200
    assert res.json() == {"status": "ok", "database": "reachable"}
    assert calls == ["SELECT 1"]


def test_supabase_keepalive_uses_settings_token(monkeypatch) -> None:
    calls: list[str] = []

    monkeypatch.delenv("KEEPALIVE_TOKEN", raising=False)
    monkeypatch.setattr("app.main.settings.keepalive_token", "settings-token", raising=False)
    monkeypatch.setattr("app.main.SessionLocal", lambda: FakeSession(calls), raising=False)

    client = TestClient(app)
    res = client.get("/health/supabase?token=settings-token")

    assert res.status_code == 200
    assert res.json() == {"status": "ok", "database": "reachable"}
    assert calls == ["SELECT 1"]


def test_supabase_keepalive_rejects_invalid_token(monkeypatch) -> None:
    calls: list[str] = []

    monkeypatch.setenv("KEEPALIVE_TOKEN", "secret-token")
    monkeypatch.setattr("app.main.settings.keepalive_token", None, raising=False)
    monkeypatch.setattr("app.main.SessionLocal", lambda: FakeSession(calls), raising=False)

    client = TestClient(app)
    res = client.get("/health/supabase?token=wrong-token")

    assert res.status_code == 401
    assert calls == []


def test_supabase_keepalive_requires_token_configuration(monkeypatch) -> None:
    calls: list[str] = []

    monkeypatch.delenv("KEEPALIVE_TOKEN", raising=False)
    monkeypatch.setattr("app.main.settings.keepalive_token", None, raising=False)
    monkeypatch.setattr("app.main.SessionLocal", lambda: FakeSession(calls), raising=False)

    client = TestClient(app)
    res = client.get("/health/supabase?token=secret-token")

    assert res.status_code == 503
    assert calls == []


def test_supabase_keepalive_reports_database_failure(monkeypatch) -> None:
    calls: list[str] = []

    monkeypatch.setenv("KEEPALIVE_TOKEN", "secret-token")
    monkeypatch.setattr("app.main.settings.keepalive_token", None, raising=False)
    monkeypatch.setattr("app.main.SessionLocal", lambda: FakeSession(calls, should_fail=True), raising=False)

    client = TestClient(app, raise_server_exceptions=False)
    res = client.get("/health/supabase?token=secret-token")

    assert res.status_code == 503
    assert calls == ["SELECT 1"]
