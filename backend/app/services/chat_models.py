from typing import Mapping, Any

import httpx
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import HumanMessage, SystemMessage

from app.core.config import settings
from app.services.system_prompt import build_system_prompt


def _setting(ai_settings: Mapping[str, Any], key: str, default: str = "") -> str:
    value = ai_settings.get(key, default)
    return str(value or default)


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

    base_url = "https://models.inference.ai.azure.com" if settings.openai_api_key.startswith("github_") else None
    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(model=model, api_key=settings.openai_api_key, base_url=base_url, temperature=0.2)
    res = await llm.ainvoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
    return str(res.content).strip()


async def _chat_with_phi4(model: str, system_prompt: str, prompt: str) -> str:
    if not settings.phi4_api_key:
        return "PHI4_API_KEY is not configured."

    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(
        model="phi-4",
        api_key=settings.phi4_api_key,
        base_url="https://models.inference.ai.azure.com",
        temperature=0.2,
    )
    res = await llm.ainvoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
    return str(res.content).strip()


async def _chat_with_phi4_reasoning(model: str, system_prompt: str, prompt: str) -> str:
    if not settings.phi4_reasoning_api_key:
        return "PHI4_RESONING_API_KEY is not configured."

    from langchain_openai import ChatOpenAI

    llm = ChatOpenAI(
        model=model,
        api_key=settings.phi4_reasoning_api_key,
        base_url="https://models.inference.ai.azure.com",
        temperature=0.2,
    )
    res = await llm.ainvoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
    return str(res.content).strip()


async def _chat_with_gemini(model: str, system_prompt: str, prompt: str) -> str:
    if not settings.gemini_api_key:
        return "GEMINI_API_KEY is not configured."
    from langchain_google_genai import ChatGoogleGenerativeAI

    llm = ChatGoogleGenerativeAI(model=model, google_api_key=settings.gemini_api_key, temperature=0.2)
    res = await llm.ainvoke([SystemMessage(content=system_prompt), HumanMessage(content=prompt)])
    return str(res.content).strip()


async def generate_admin_configured_answer(ai_settings: Mapping[str, Any], prompt: str, locale: str = "vi") -> str:
    provider = _setting(ai_settings, "chat_provider", "gemini")
    model = _setting(ai_settings, "chat_model", "gemini-2.0-flash")
    system_prompt = build_system_prompt(locale, ai_settings.get("system_prompt"))
    try:
        if provider == "ollama":
            return await _chat_with_ollama(model, system_prompt, prompt)
        if provider == "openai":
            return await _chat_with_openai(model, system_prompt, prompt)
        if provider == "phi4":
            return await _chat_with_phi4(model, system_prompt, prompt)
        if provider == "phi4_reasoning":
            return await _chat_with_phi4_reasoning(model, system_prompt, prompt)
        return await _chat_with_gemini(model, system_prompt, prompt)
    except Exception:
        return "I couldn't generate a response from the configured model."


def get_chat_model(ai_settings: Mapping[str, Any]) -> BaseChatModel:
    provider = _setting(ai_settings, "chat_provider", "gemini")
    model = _setting(ai_settings, "chat_model", "gemini-2.0-flash")

    if provider == "openai":
        base_url = "https://models.inference.ai.azure.com" if settings.openai_api_key.startswith("github_") else None
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(model=model, api_key=settings.openai_api_key, base_url=base_url, temperature=0.2)

    if provider == "phi4":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model="phi-4",
            api_key=settings.phi4_api_key,
            base_url="https://models.inference.ai.azure.com",
            temperature=0.2,
        )

    if provider == "phi4_reasoning":
        from langchain_openai import ChatOpenAI

        return ChatOpenAI(
            model=model,
            api_key=settings.phi4_reasoning_api_key,
            base_url="https://models.inference.ai.azure.com",
            temperature=0.2,
        )

    from langchain_google_genai import ChatGoogleGenerativeAI

    return ChatGoogleGenerativeAI(model=model, google_api_key=settings.gemini_api_key, temperature=0.2)


async def test_admin_configured_model(ai_settings: Mapping[str, Any], prompt: str) -> dict[str, str]:
    answer = await generate_admin_configured_answer(ai_settings, prompt)
    return {
        "provider": _setting(ai_settings, "chat_provider", "gemini"),
        "model": _setting(ai_settings, "chat_model", "gemini-2.0-flash"),
        "prompt": prompt,
        "answer": answer,
    }
