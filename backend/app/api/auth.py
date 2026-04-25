from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import RedirectResponse
import httpx
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.admin_service import get_or_create_ai_settings
from app.models.models import User
from sqlalchemy import select
import os
import json
import base64
import uuid

router = APIRouter()

@router.get("/google/login")
def google_login(request: Request, db: Session = Depends(get_db)):
    settings = get_or_create_ai_settings(db)
    client_id = settings.google_client_id or os.getenv("CLIENT_ID")
    if not client_id:
        raise HTTPException(status_code=500, detail="Google Client ID not configured")
    
    redirect_uri = os.getenv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:8000") + "/api/auth/google/callback"
    
    url = f"https://accounts.google.com/o/oauth2/v2/auth?client_id={client_id}&response_type=code&scope=openid%20email%20profile&redirect_uri={redirect_uri}"
    return RedirectResponse(url)

@router.get("/google/callback")
async def google_callback(code: str, request: Request, db: Session = Depends(get_db)):
    settings = get_or_create_ai_settings(db)
    client_id = settings.google_client_id or os.getenv("CLIENT_ID")
    client_secret = settings.google_client_secret or os.getenv("CLIENT_SECRET")
    redirect_uri = os.getenv("NEXT_PUBLIC_BACKEND_URL", "http://localhost:8000") + "/api/auth/google/callback"
    
    async with httpx.AsyncClient() as client:
        token_res = await client.post("https://oauth2.googleapis.com/token", data={
            "client_id": client_id,
            "client_secret": client_secret,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": redirect_uri
        })
        token_data = token_res.json()
        if "access_token" not in token_data:
            raise HTTPException(status_code=400, detail="Failed to get access token")
            
        user_res = await client.get("https://www.googleapis.com/oauth2/v2/userinfo", headers={
            "Authorization": f"Bearer {token_data['access_token']}"
        })
        user_data = user_res.json()
        
    email = user_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="No email from Google")
        
    user = db.scalar(select(User).where(User.email == email))
    if not user:
        from app.schemas.admin import UserDTO
        from app.services.admin_service import upsert_user
        name = user_data.get("name", email.split('@')[0])
        payload = UserDTO(email=email, full_name=name, role="GUEST", permission="VIEW", username=email)
        user = upsert_user(db, payload)
        
    payload_dict = {
        "email": user.email,
        "name": user.full_name,
        "role": user.role.value,
        "sub": user.id
    }
    payload_b64 = base64.b64encode(json.dumps(payload_dict).encode()).decode()
    fake_jwt = f"header.{payload_b64}.signature"
    
    frontend_url = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")[0]
    return RedirectResponse(f"{frontend_url}/login?token={fake_jwt}")
