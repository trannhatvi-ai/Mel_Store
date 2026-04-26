from functools import lru_cache

import httpx
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_openai import OpenAIEmbeddings

from app.core.config import settings


@lru_cache
def get_gemini_embedding_client(model: str) -> GoogleGenerativeAIEmbeddings:
    return GoogleGenerativeAIEmbeddings(model=model, google_api_key=settings.gemini_api_key)


@lru_cache
def get_openai_embedding_client(model: str) -> OpenAIEmbeddings:
    return OpenAIEmbeddings(model=model, api_key=settings.openai_api_key)


def _embed_with_ollama(model: str, text: str) -> list[float]:
    payload = {"model": model, "prompt": text}
    with httpx.Client(timeout=30) as client:
        res = client.post(f"{settings.ollama_base_url}/api/embeddings", json=payload)
        res.raise_for_status()
        return res.json().get("embedding", [])


def embed_query(text: str, provider: str = "gemini", model: str = "models/text-embedding-004") -> list[float]:
    if provider == "openai":
        client = get_openai_embedding_client(model)
        vector = client.embed_query(text)
    elif provider == "ollama":
        vector = _embed_with_ollama(model, text)
    else:
        if model == "gemini-embedding-001":
            model = "models/text-embedding-004"
        client = get_gemini_embedding_client(model)
        vector = client.embed_query(text)
    if len(vector) > settings.embedding_dimension:
        return vector[: settings.embedding_dimension]
    if len(vector) < settings.embedding_dimension:
        return vector + [0.0] * (settings.embedding_dimension - len(vector))
    return vector


def vector_literal(vector: list[float]) -> str:
    return "[" + ",".join(f"{v:.8f}" for v in vector) + "]"
