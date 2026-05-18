import json
from datetime import datetime
from typing import Any, Mapping

from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent

from app.services.chat_models import get_chat_model
from app.services.system_prompt import build_system_prompt
from app.services.telegram import notify_human_support


def _localized(value: Any, locale: str = "vi") -> str:
    if isinstance(value, dict):
        return str(value.get(locale) or value.get("vi") or value.get("en") or "")
    return str(value or "")


def _score(query: str, text: str) -> int:
    terms = [part for part in query.lower().split() if len(part) > 1]
    haystack = text.lower()
    return sum(1 for term in terms if term in haystack)


def _top_matches(query: str, rows: list[dict[str, Any]], text_factory, limit: int = 5) -> list[dict[str, Any]]:
    ranked = sorted(rows, key=lambda row: _score(query, text_factory(row)), reverse=True)
    return ranked[:limit]


def _catalog_context(products: list[dict[str, Any]]) -> str:
    lines = []
    for product in products[:20]:
        name = _localized(product.get("name"))
        description = _localized(product.get("description"))
        lines.append(
            f"- {name} (ID: {product.get('id')}): {product.get('price')} VND, "
            f"{'available' if product.get('available', True) else 'unavailable'}. {description}"
        )
    return "\n".join(lines)


def _policy_context(policies: list[dict[str, Any]]) -> str:
    return "\n\n".join(str(policy.get("content", "")) for policy in policies[:3])


def get_tools(context: Mapping[str, Any], locale: str = "vi"):
    products = list(context.get("products") or [])
    policies = list(context.get("policies") or [])
    vouchers = list(context.get("vouchers") or [])

    @tool
    def query_policy_rag(query: str):
        """Retrieve snippets about refunds, damages, deposits, and rental terms."""
        matches = _top_matches(query, policies, lambda row: str(row.get("content", "")))
        return "\n".join(f"- {row.get('content', '')}" for row in matches) or "No matching policy was provided."

    @tool
    def search_catalog(query: str):
        """Look up dresses, photography packages, prices, availability, and descriptions."""
        matches = _top_matches(
            query,
            products,
            lambda row: " ".join(
                [
                    _localized(row.get("name"), locale),
                    _localized(row.get("description"), locale),
                    str(row.get("category", "")),
                ]
            ),
        )
        return "\n".join(
            f"- ID: {row.get('id')}, Name: {_localized(row.get('name'), locale)}, "
            f"Price: {row.get('price')}, Available: {row.get('available', True)}, "
            f"Description: {_localized(row.get('description'), locale)}"
            for row in matches
        ) or "No matching catalog item was provided."

    @tool
    def check_availability(product_id: str, date: str):
        """Check if a product or package appears available on a given YYYY-MM-DD date."""
        product = next((row for row in products if str(row.get("id")) == product_id), None)
        if not product:
            return f"Product {product_id} was not found in the provided catalog."
        if not product.get("available", True):
            return f"Product {product_id} is currently marked unavailable."
        return f"Product {product_id} appears available for booking on {date}."

    @tool
    async def request_human_callback(phone_number: str, note: str = ""):
        """Use this when the customer wants a human consultant to call them back."""
        await notify_human_support(f"Callback Request: {phone_number}. Note: {note}")
        return "Your request has been received. A consultant will call you back shortly at " + phone_number

    @tool
    def apply_voucher(code: str, total_price: float):
        """Validate a discount code from the frontend-provided voucher list."""
        voucher = next((row for row in vouchers if str(row.get("code", "")).lower() == code.lower()), None)
        if not voucher:
            return f"Voucher {code} is invalid or expired."
        discount_percent = float(voucher.get("discount_percent", 0))
        discount = (total_price * discount_percent) / 100
        return {
            "valid": True,
            "discount_percent": discount_percent,
            "discount_amount": discount,
            "new_total": total_price - discount,
        }

    @tool
    def create_booking(customer_name: str, customer_phone: str, customer_email: str, items: list[dict], event_date: str):
        """Prepare a pending order payload. The frontend owns saving it to the database."""
        subtotal = sum(
            int(item.get("price", 0)) * int(item.get("qty", 1)) * int(item.get("days") or 1)
            for item in items
        )
        deposit = round(subtotal * 0.2)
        payment_data = {
            "customer": customer_name,
            "phone": customer_phone,
            "email": customer_email,
            "event_date": event_date,
            "items": items,
            "subtotal": subtotal,
            "deposit": deposit,
            "description": "20% booking deposit",
        }
        return (
            f"Booking details prepared. Total: {subtotal}. "
            f"20% deposit required: {deposit}. [PAYMENT_JSON]: {json.dumps(payment_data)}"
        )

    return [query_policy_rag, search_catalog, apply_voucher, create_booking, check_availability, request_human_callback]


async def invoke_agent(
    session_id: str,
    message: str,
    locale: str,
    settings: Mapping[str, Any],
    context: Mapping[str, Any],
) -> dict[str, Any]:
    products = list(context.get("products") or [])
    policies = list(context.get("policies") or [])
    context_prompt = (
        "\n\nFrontend-provided catalog context:\n"
        f"{_catalog_context(products)}\n\n"
        "Frontend-provided policy context:\n"
        f"{_policy_context(policies)}"
    )
    llm = get_chat_model(settings)
    tools = get_tools(context, locale)
    system_prompt = build_system_prompt(locale, settings.get("system_prompt")) + context_prompt

    agent = create_react_agent(
        llm,
        tools=tools,
        prompt=system_prompt,
        checkpointer=MemorySaver(),
    )

    config = {"configurable": {"thread_id": session_id}}
    result = await agent.ainvoke({"messages": [("user", message)]}, config=config)
    last_msg = result["messages"][-1]
    answer = str(last_msg.content)

    tool_name = None
    payload = None
    if "[PAYMENT_JSON]" in answer:
        parts = answer.split("[PAYMENT_JSON]:")
        answer = parts[0].strip()
        try:
            payload = json.loads(parts[1].strip())
            tool_name = "create_booking"
        except Exception:
            payload = None

    return {
        "answer": answer,
        "tool": tool_name,
        "payload": payload,
        "debug": {"catalog_items": len(products), "policies": len(policies), "created_at": datetime.utcnow().isoformat()},
    }
