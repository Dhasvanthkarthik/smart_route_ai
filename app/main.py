from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.db.database import engine, Base
import os
from app.routes import auth_routes, gps_routes, external_routes, prediction_routes, route_routes, ws_routes, trip_routes, alert_routes
from app.services.ml_model import predictor
from app.services.simulator import simulator
from app.auth.security import get_password_hash
import contextlib

def seed_data():
    from app.db.database import SessionLocal
    from app.models import domain
    db = SessionLocal()
    try:
        # Seed test user
        if not db.query(domain.User).filter(domain.User.username == "test@test.com").first():
            hashed_pw = get_password_hash("password123")
            user = domain.User(username="test@test.com", hashed_password=hashed_pw)
            db.add(user)
            db.commit()
            print("Seeded test user: test@test.com")

        # Seed initial trucks if none exist
        if db.query(domain.Truck).count() == 0:
            trucks = [
                domain.Truck(license_plate="TRK-7721", driver_name="Alex Rivera", status="In Transit"),
                domain.Truck(license_plate="TRK-9902", driver_name="Sarah Chen", status="In Transit"),
                domain.Truck(license_plate="TRK-4410", driver_name="Marcus Thorne", status="Idle"),
                domain.Truck(license_plate="TRK-1123", driver_name="Priya Sharma", status="In Transit"),
            ]
            db.add_all(trucks)
            db.commit()
            print("Seeded initial trucks")
    except Exception as e:
        print(f"Seeding error: {e}")
    finally:
        db.close()

async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    seed_data()
    predictor.load_or_train_model()
    simulator.start()
    yield
    # Shutdown
    simulator.stop()

app = FastAPI(title="Smart Supply Chain Logistics API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False, # We use Bearer tokens, not cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(gps_routes.router)
app.include_router(external_routes.router)
app.include_router(prediction_routes.router)
app.include_router(route_routes.router)
app.include_router(ws_routes.router)
app.include_router(trip_routes.router)
app.include_router(alert_routes.router)

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": os.getenv("DATABASE_URL", "sqlite")[:6]}

# Serve static files from the React frontend build
frontend_path = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "gdp-prototype--main", "dist"))

print(f"Serving frontend from: {frontend_path}")
print(f"Database URL: {os.getenv('DATABASE_URL', 'sqlite:///./logistics.db')}")

if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="static")
else:
    print("Warning: Frontend dist folder not found. React app will not be served.")

@app.get("/")
def root():
    index_path = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"message": "Smart Supply Chain Logistics API is running. Frontend build missing."}

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # Check if the path exists as a static file
    file_path = os.path.join(frontend_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Fallback to index.html for React Router
    index_path = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {"error": "Path not found"}
