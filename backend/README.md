---
title: Melstore
emoji: ⚡
colorFrom: indigo
colorTo: yellow
sdk: docker
pinned: false
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference

# Mel Store Backend

FastAPI + LangGraph backend with PostgreSQL hybrid search (pgvector + full-text + RRF).

## Environment

Create `backend/.env`:

```env
DATABASE_URL=postgresql+psycopg://user:password@host:5432/dbname
GEMINI_API_KEY=your_key
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
KEEPALIVE_TOKEN=random_secret_token
EMBEDDING_DIMENSION=768
HYBRID_RRF_K=60
HYBRID_LIMIT=8
```

Use one shared `DATABASE_URL` for relational and vector workloads.

## Supabase keepalive

The backend exposes a protected Supabase keepalive endpoint:

```text
GET /health/supabase?token=<KEEPALIVE_TOKEN>
```

It validates `KEEPALIVE_TOKEN`, runs `SELECT 1` against `DATABASE_URL`, and returns `200` only when the database is reachable.

For Hugging Face Spaces, use an external scheduler so the Space can be woken from outside. Create a cron job with a 12-hour interval using a service such as cron-job.org or UptimeRobot:

```text
https://<your-space-subdomain>.hf.space/health/supabase?token=<KEEPALIVE_TOKEN>
```

Set `KEEPALIVE_TOKEN` as a Hugging Face Space secret. Generate a strong token with:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Install and run

```bash
pip install -e .
alembic upgrade head
uvicorn app.main:app --reload --port 8000
```

## Key modules

- `app/models/models.py`: SQLAlchemy schema including `embedding` and `search_vector`.
- `alembic/versions/20260426_0001_init_hybrid_search.py`: migration with pgvector, GIN indexes, and triggers.
- `app/services/hybrid_search.py`: semantic + keyword + RRF ranking.
- `app/services/agent_runtime.py`: LangGraph session flow and tool routing.
