from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.db.database import engine, Base
import os
from app.routes import auth_routes, gps_routes, external_routes, prediction_routes, route_routes, ws_routes, trip_routes, alert_routes
from app.services.ml_model import predictor
from app.services.simulator import simulator
import contextlib

@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
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

# Serve static files from the React frontend build
frontend_path = os.path.join(os.path.dirname(__file__), "..", "gdp-prototype--main", "dist")

if os.path.exists(frontend_path):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_path, "assets")), name="static")

@app.get("/")
def root():
    return FileResponse(os.path.join(frontend_path, "index.html"))

@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # Check if the path exists as a static file (e.g. index.html)
    # If not, serve index.html for React Router
    file_path = os.path.join(frontend_path, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    return FileResponse(os.path.join(frontend_path, "index.html"))
