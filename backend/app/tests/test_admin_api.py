import os

os.environ.setdefault("DATABASE_URL", "postgresql+psycopg://postgres:postgres@localhost:5432/mel_store")
os.environ.setdefault("GEMINI_API_KEY", "test-key")

from fastapi.testclient import TestClient

from app.main import app


def test_update_product_promo_returns_404_when_product_is_missing(monkeypatch) -> None:
    monkeypatch.setattr("app.api.admin.update_product_promo", lambda db, product_id, payload: None)

    client = TestClient(app, raise_server_exceptions=False)
    res = client.patch("/api/admin/products/missing/promo", json={"discount": 10})

    assert res.status_code == 404
    assert res.json() == {"detail": "Product not found"}
