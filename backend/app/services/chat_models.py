import httpx
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy.orm import Session

from app.core.config import settings
from app.services.admin_service import get_or_create_ai_settings
from app.services.system_prompt import build_system_prompt


async def _chat_with_ollama(model: str, system_prompt: str, prompt: str) -> str:
    payload = {
        "model": model,
        "stream": False,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
    }
    async with httpx.AsyncClient(timeout=45) as client:
        res = await client.post(f"{settings.ollama_base_url}/api/chat", json=payload)
        res.raise_for_status()
        body = res.json()
        return body.get("message", {}).get("content", "").strip()


async def _chat_with_openai(model: str, system_prompt: str, prompt: str) -> str:
    if not settings.openai_api_key:
        return "OPENAI_API_KEY is not configured."
    headers = {"Authorization": f"Bearer {settings.openai_api_key}"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt},
        ],
    }
    async with httpx.AsyncClient(timeout=45) as client:
        res = await client.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
        res.raise_for_status()
        body = res.json()
        return body["choices"][0]["message"]["content"].strip()


async def _chat_with_gemini(model: str, system_prompt: str, prompt: str) -> str:
    llm = ChatGoogleGenerativeAI(model=model, google_api_key=settings.gemini_api_key, temperature=0.2)
    res = await llm.ainvoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
    return str(res.content).strip()


async def generate_admin_configured_answer(db: Session, prompt: str, locale: str = "vi") -> str:
    cfg = get_or_create_ai_settings(db)
    provider = cfg.chat_provider
    model = cfg.chat_model
    system_prompt = build_system_prompt(locale)
    try:
        if provider == "ollama":
            return await _chat_with_ollama(model, system_prompt, prompt)
        if provider == "openai":
            return await _chat_with_openai(model, system_prompt, prompt)
        return await _chat_with_gemini(model, system_prompt, prompt)
    except Exception:
        return "I couldn't generate a response from the configured model."


async def test_admin_configured_model(db: Session, prompt: str) -> dict[str, str]:
    cfg = get_or_create_ai_settings(db)
    answer = await generate_admin_configured_answer(db, prompt)
    return {
        "provider": cfg.chat_provider,
        "model": cfg.chat_model,
        "prompt": prompt,
        "answer": answer,
    }
