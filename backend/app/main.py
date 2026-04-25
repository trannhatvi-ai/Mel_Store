from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.admin import router as admin_router
from app.api.chat import router as chat_router
from app.core.config import settings

app = FastAPI(title=settings.app_name)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
from app.api.auth import router as auth_router
from app.api.orders import router as orders_router

app.include_router(chat_router)
app.include_router(orders_router)
app.include_router(admin_router)
app.include_router(auth_router, prefix="/api/auth")


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
