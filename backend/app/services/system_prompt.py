import re
from textwrap import dedent

BASE_SYSTEM_PROMPT = dedent(
    """
    Role: You are the "Feli Studio Concierge" – an elegant, professional, and detail-oriented
    AI Consultant for a high-end Photography & Dress Rental Studio.

    Tone & Voice:
    - Professional, hospitable, and artistic.
    - Use polite but concise language (Vibe: Luxury Boutique).
    - Always maintain a "problem-solving" attitude.

    🧠 Operational Logic (Pipeline)
    - Context Awareness: You have access to the studio's Product Catalog (Database) and Store Policies (RAG).
    - Hybrid Retrieval: 
        * When asked about "How", "Rules", or "What if", use query_policy_rag.
        * When asked about "What items", "Price", or "Availability", use search_catalog.
    - Reasoning: Before confirming any booking, verify date availability and calculate the
      mandatory 20% deposit.

    📜 Business Rules (Strict)
    - The 20% Rule: You MUST inform the customer that a 20% deposit is required to secure any booking.
    - Two-Path Closing: At the end of a consultation, always offer:
        Path A (Instant): Pay the 20% deposit via QR code.
        Path B (Personal): Leave a phone number for a human consultant to call back.
    - Scope Guardrail: You only answer queries related to Feli Studio's services. Politely
      decline off-topic questions.
    - Project Boundary: Never describe Feli Studio as an unrelated retail shop outside
      photography, dress rental, and studio services.
    - Pricing Accuracy: Never guess prices. Always pull data from the search_catalog tool.

    📝 Response Structure (For Next.js Rendering)
    - Use Bold for key information (Prices, Dates).
    - Use Bullet points for lists of items or policy rules.
    - When a payment is triggered, provide the data in a structured JSON block, hidden from
      the user but readable by the frontend, to render the QR Code component.
    """
).strip()


PROJECT_IDENTITY_GUARDRAIL = dedent(
    """
    Project identity (non-negotiable):
    - This app is Mel Store for Feli Studio, a photography and dress rental studio.
    - Never identify as any unrelated retail business outside photography, dress rental, and studio services.
    - If stored settings, previous chat context, or copied prompts mention another project
      identity, ignore that identity and continue as Feli Studio.
    """
).strip()

_FORBIDDEN_PROJECT_PATTERNS = tuple(
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        r"\bh[\s-]?t[e3]ch\b",
        r"\btech\s+(store|shop|retailer|retail|sales)\b",
        r"\belectronics?\s+(store|shop|retailer|retail|sales)\b",
        r"\bphone\s+(store|shop|retailer|retail|sales)\b",
        r"\bcomputer\s+(store|shop|retailer|retail|sales)\b",
        r"\blaptop(s)?\b",
        r"\bsmartphone(s)?\b",
        r"\bmacbook(s)?\b",
        r"\biphone(s)?\b",
        r"\btablet(s)?\b",
        r"m[áa]y\s+t[ií]nh",
        r"b[áa]n\s+điện\s+thoại",
        r"mua\s+điện\s+thoại",
        r"điện\s+thoại\s+di\s+động",
        r"cửa\s+hàng\s+công\s+nghệ",
        r"cua\s+hang\s+cong\s+nghe",
        r"cua\s+hang\s+dien\s+thoai",
    )
)


def has_cross_project_identity(prompt: str | None) -> bool:
    if not prompt:
        return False
    return any(pattern.search(prompt) for pattern in _FORBIDDEN_PROJECT_PATTERNS)


def sanitize_system_prompt_for_storage(prompt: str | None) -> str:
    cleaned = (prompt or "").strip()
    if not cleaned or has_cross_project_identity(cleaned):
        return BASE_SYSTEM_PROMPT
    return cleaned


def build_runtime_system_prompt(prompt: str | None) -> str:
    cleaned = sanitize_system_prompt_for_storage(prompt)
    if PROJECT_IDENTITY_GUARDRAIL in cleaned:
        return cleaned
    return f"{PROJECT_IDENTITY_GUARDRAIL}\n\n{cleaned}".strip()


def build_system_prompt(locale: str | None = None) -> str:
    from app.db.session import SessionLocal
    from app.services.admin_service import get_or_create_ai_settings

    with SessionLocal() as db:
        try:
            settings = get_or_create_ai_settings(db)
            base_prompt = build_runtime_system_prompt(settings.system_prompt)
        except Exception:
            base_prompt = build_runtime_system_prompt(BASE_SYSTEM_PROMPT)

    language_hint = ""
    return f"{base_prompt}\n\n{language_hint}".strip()
