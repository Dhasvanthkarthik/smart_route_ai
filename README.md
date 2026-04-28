# Smart Supply Chain: Resilient Logistics System

A full-stack logistics platform featuring real-time tracking, AI-driven delay prediction, and route optimization.

## Features
- **Real-time Tracking**: Live GPS updates for fleet vehicles.
- **AI Predictor**: Machine learning model to predict transit delays based on traffic and weather.
- **Risk Assessment**: Dynamic risk scoring for shipments.
- **Unified Dashboard**: Premium React interface for managing logistics operations.
- **Dark Mode Support**: Real-time theme switching with persistent storage.
- **Global Localization**: Multi-language support (English, Hindi, Spanish, etc.) with real-time translation.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite, Scikit-learn
- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, Recharts, Motion
- **Auth**: Opaque Token Authentication with Bcrypt hashing

## Local Setup

### 1. Backend
```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
python -m uvicorn app.main:app --reload
```

### 2. Frontend
```bash
cd gdp-prototype--main
npm install
npm run dev
```

## Deployment Instructions (Render.com)

This project is configured to be deployed as a unified application.

1. Create a new **Web Service** on Render.
2. Connect this GitHub repository.
3. Use the following settings:
   - **Runtime**: `Python`
   - **Build Command**: `pip install -r requirements.txt && cd gdp-prototype--main && npm install && npm run build`
   - **Start Command**: `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add Environment Variables:
   - `DATABASE_URL`: `sqlite:///./logistics.db`
   - `JWT_SECRET`: (Your secret key)
   - `WEATHER_API_KEY`: (Your API key)
