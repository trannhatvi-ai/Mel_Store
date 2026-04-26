import json
from datetime import datetime
from typing import Any, TypedDict, Annotated

from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_core.tools import tool
from langgraph.checkpoint.memory import MemorySaver
from langgraph.prebuilt import create_react_agent
from sqlalchemy.orm import Session

from app.schemas.dto import BookingItemDTO, CustomerInfoDTO
from app.services.chat_models import get_chat_model
from app.services.booking import manage_booking
from app.services.hybrid_search import hybrid_search_policies, hybrid_search_products
from app.services.telegram import notify_human_support
from app.services.vouchers import verify_voucher
from app.services.system_prompt import build_system_prompt


def get_tools(db: Session):
    @tool
    def query_policy_rag(query: str):
        """Retrieve snippets from the knowledge base regarding refunds, damages, and rental terms. 
        Use this when the customer asks about rules, deposits, or 'how' things work."""
        rows = hybrid_search_policies(db, query)
        return "\n".join(f"- {row['content']}" for row in rows[:5])

    @tool
    def search_catalog(query: str):
        """Look up dresses, photography packages, or inventory items. 
        Returns names, prices, availability, and detailed descriptions (sizes, colors)."""
        rows = hybrid_search_products(db, query)
        return "\n".join(
            f"- ID: {row['id']}, Name: {row['name'].get('vi')}, Price: {row['price']}, "
            f"Description: {row.get('description', '')}, Details: {row.get('details', '')}"
            for row in rows[:5]
        )

    @tool
    def check_availability(product_id: str, date: str):
        """Check if a specific product or package is available on a given date (YYYY-MM-DD)."""
        # Mock logic: Assume everything is available except for some specific dates
        if "2026-05-02" in date: # Example: Saturday mentioned in plan
            return f"Product {product_id} is already booked on {date}. Please choose another date."
        return f"Product {product_id} is available for booking on {date}."

    @tool
    def request_human_callback(phone_number: str, note: str = ""):
        """Use this when the customer wants a human consultant to call them back. 
        Saves their phone number and sends a notification to the staff."""
        try:
            notify_human_support(f"Callback Request: {phone_number}. Note: {note}")
            return "Your request has been received. A consultant will call you back shortly at " + phone_number
        except Exception as e:
            return f"Error requesting callback: {str(e)}"

    @tool
    def apply_voucher(code: str, total_price: float):
        """Validate a discount code and return the updated balance."""
        res = verify_voucher(db, code)
        if not res["valid"]:
            return f"Voucher {code} is invalid or expired."
        discount = (total_price * res["discount_percent"]) / 100
        return {
            "valid": True,
            "discount_percent": res["discount_percent"],
            "discount_amount": discount,
            "new_total": total_price - discount
        }

    @tool
    def create_booking(customer_name: str, customer_phone: str, customer_email: str, items: list[dict], event_date: str):
        """Generate a pending order. 
        Items should be a list of {'product_id': str, 'qty': int, 'price': int, 'days': int}.
        Event date must be in YYYY-MM-DD format.
        This tool returns the booking summary including the 20% deposit amount."""
        try:
            customer = CustomerInfoDTO(
                name=customer_name,
                email=customer_email,
                phone=customer_phone,
                eventDate=datetime.strptime(event_date, "%Y-%m-%d").date(),
            )
            booking_items = [BookingItemDTO(**it) for it in items]
            summary = manage_booking(db, customer, booking_items)
            
            # Prepare a structured response for the UI to render the QR
            payment_data = {
                "order_id": summary.orderId,
                "amount": summary.deposit,
                "description": f"Deposit for order {summary.orderId}"
            }
            
            return f"Booking Created! Order: {summary.orderId}. Total: {summary.subtotal}. 20% Deposit required: {summary.deposit}. [PAYMENT_JSON]: {json.dumps(payment_data)}"
        except Exception as e:
            return f"Error creating booking: {str(e)}"

    return [query_policy_rag, search_catalog, apply_voucher, create_booking, check_availability, request_human_callback]


async def invoke_agent(db: Session, session_id: str, message: str, locale: str) -> dict[str, Any]:
    # 1. Setup the Agent
    llm = get_chat_model(db)
    tools = get_tools(db)
    system_prompt = build_system_prompt(locale)
    
    agent = create_react_agent(
        llm, 
        tools=tools, 
        prompt=system_prompt,
        checkpointer=MemorySaver()
    )
    
    # 2. Run the Agent
    config = {"configurable": {"thread_id": session_id}}
    result = await agent.ainvoke({"messages": [HumanMessage(content=message)]}, config=config)
    
    # 3. Parse the last AI message
    last_msg = result["messages"][-1]
    answer = str(last_msg.content)
    
    # Extract tool/payload if available in the last response (simple heuristic)
    tool_name = None
    payload = None
    
    if "[PAYMENT_JSON]" in answer:
        parts = answer.split("[PAYMENT_JSON]:")
        answer = parts[0].strip()
        try:
            payload = json.loads(parts[1].strip())
            tool_name = "create_booking"
        except:
            pass

    return {
        "answer": answer,
        "tool": tool_name,
        "payload": payload,
        "debug": None,
    }
