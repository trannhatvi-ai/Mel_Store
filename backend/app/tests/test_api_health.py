from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_does_not_require_database_configuration(monkeypatch) -> None:
    monkeypatch.delenv("DATABASE_URL", raising=False)

    client = TestClient(app)
    res = client.get("/health")

    assert res.status_code == 200
    assert res.json() == {"status": "ok", "service": "ai"}


def test_model_catalog_endpoint_returns_ai_options() -> None:
    client = TestClient(app)
    res = client.get("/api/model-catalog")

    assert res.status_code == 200
    body = res.json()
    assert "chat_providers" in body
    assert "embedding_providers" in body


def test_chat_endpoint_uses_frontend_supplied_context(monkeypatch) -> None:
    async def fake_invoke_agent(**kwargs):
        assert kwargs["settings"]["chat_provider"] == "gemini"
        assert kwargs["context"]["products"][0]["name"]["vi"] == "Vay cuoi"
        return {"answer": "Xin chao", "tool": None, "payload": None, "debug": None}

    monkeypatch.setattr("app.api.chat.invoke_agent", fake_invoke_agent)

    client = TestClient(app)
    res = client.post(
        "/api/chat",
        json={
            "session_id": "test-session",
            "message": "Tu van vay cuoi",
            "locale": "vi",
            "settings": {
                "chat_provider": "gemini",
                "chat_model": "gemini-2.0-flash",
            },
            "context": {
                "products": [{"id": "p1", "name": {"vi": "Vay cuoi"}, "price": 1200000}],
                "policies": [],
                "vouchers": [],
            },
        },
    )

    assert res.status_code == 200
    assert res.json()["answer"] == "Xin chao"
