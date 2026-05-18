
# Backend AI server
cd backend
uvicorn app.main:app --reload --port 8000

# Frontend web app + database API
cd frontend
npm run dev
