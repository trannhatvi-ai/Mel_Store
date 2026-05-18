---
title: Feli Studio AI Server
emoji: ⚡
colorFrom: indigo
colorTo: yellow
sdk: docker
pinned: false
---

# Feli Studio AI Server

This FastAPI service only runs AI and notification workloads. Database reads and writes live in the Next.js frontend API routes.

## Environment

Create `backend/.env`:

```env
GEMINI_API_KEY=your_key
OPENAI_API_KEY=
PHI4_API_KEY=
PHI4_RESONING_API_KEY=
OLLAMA_BASE_URL=http://localhost:11434
CORS_ORIGINS=http://localhost:3000
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
```

Do not configure `DATABASE_URL` here. The frontend owns database access.

## Run

```bash
pip install -e .
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /health`
- `GET /api/model-catalog`
- `POST /api/test-model`
- `POST /api/chat`
- `POST /api/notify`

`POST /api/chat` expects the frontend to send `settings` and `context` payloads with product, policy, voucher, and studio profile data.
