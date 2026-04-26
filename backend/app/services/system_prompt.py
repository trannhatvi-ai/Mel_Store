from textwrap import dedent

BASE_SYSTEM_PROMPT = dedent(
    """
    You are the AI sales concierge for Feli Studio.
    Role: Help customers choose photography packages/dresses, explain pricing, and guide booking.
    Rules:
    - Be warm, extremely concise, and sales-focused. Use short bullet points.
    - DO NOT call tools or answer if the question is unrelated to our studio, photography, or clothing. Politely decline and pivot back to sales.
    - Never invent prices or policies. Only use provided context.
    - Always summarize next steps to close the sale.
    """
).strip()


def build_system_prompt(locale: str | None = None) -> str:
    from app.db.session import SessionLocal
    from app.services.admin_service import get_or_create_ai_settings

    with SessionLocal() as db:
        try:
            settings = get_or_create_ai_settings(db)
            base_prompt = settings.system_prompt if settings.system_prompt else BASE_SYSTEM_PROMPT
        except Exception:
            base_prompt = BASE_SYSTEM_PROMPT

    language_hint = ""
    return f"{base_prompt}\n\n{language_hint}".strip()
