from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Auth ---
class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# --- Alerts ---
class AlertCreate(BaseModel):
    severity: str
    category: str
    title: str
    description: str
    action_label: Optional[str] = None
    truck_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class AlertResponse(BaseModel):
    id: int
    severity: str
    category: str
    title: str
    description: str
    action_label: Optional[str]
    truck_id: Optional[int]
    latitude: Optional[float]
    longitude: Optional[float]
    timestamp: datetime
    class Config:
        from_attributes = True

# --- Trucks ---
class TruckUpdate(BaseModel):
    license_plate: Optional[str] = None
    driver_name: Optional[str] = None
    status: Optional[str] = None

class TruckResponse(BaseModel):
    id: int
    license_plate: str
    driver_name: str
    status: str
    class Config:
        from_attributes = True

# --- GPS Data ---
class GPSUpdate(BaseModel):
    truck_id: int
    latitude: float
    longitude: float
    speed: float
    timestamp: Optional[datetime] = None

class GPSResponse(BaseModel):
    id: int
    truck_id: int
    latitude: float
    longitude: float
    speed: float
    timestamp: datetime
    class Config:
        from_attributes = True

# --- Prediction ---
class DelayRequest(BaseModel):
    distance: float
    speed: float
    traffic_level: int # 1: Low, 2: Medium, 3: High
    weather_condition: int # 1: Clear, 2: Rain, 3: Storm/Snow
    time_of_day: float # hour (0-23)

class RiskRequest(BaseModel):
    traffic_score: float # 0-100
    weather_score: float # 0-100
    delay_minutes: float

class RiskResponse(BaseModel):
    score: float
    level: str

# --- Routing ---
class RouteRequest(BaseModel):
    source: str
    destination: str

class RouteResponse(BaseModel):
    best_route: str
    alternate_routes: List[str]
    estimated_time: float

# --- Trips / Shipments ---
class TripCreate(BaseModel):
    truck_id: int
    source: str
    destination: str
    cargo_type: str
    cargo_value: float
    weight: float

class TripResponse(BaseModel):
    id: int
    truck_id: int
    source: str
    destination: str
    predicted_delay: Optional[float]
    risk_score: Optional[float]
    status: str
    timestamp: datetime
    class Config:
        from_attributes = True

class TripStatusUpdate(BaseModel):
    status: str

# --- Analytics ---
class AnalyticsSummary(BaseModel):
    total_shipments: int
    active_trucks: int
    avg_delay: float
    success_rate: float
    risk_distribution: List[dict] # [{name: 'Low', value: 65}, ...]
