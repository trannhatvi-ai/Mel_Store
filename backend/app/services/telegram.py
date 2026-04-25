import httpx

from app.core.config import settings


async def notify_human_support(message: str) -> None:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    payload = {"chat_id": settings.telegram_chat_id, "text": message}
    async with httpx.AsyncClient(timeout=10) as client:
        await client.post(url, json=payload)
