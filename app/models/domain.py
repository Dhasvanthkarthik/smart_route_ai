from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base
from datetime import datetime, timezone

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class OpaqueToken(Base):
    __tablename__ = "opaque_tokens"
    id = Column(Integer, primary_key=True, index=True)
    token_string = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    expires_at = Column(DateTime)

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(Integer, primary_key=True, index=True)
    severity = Column(String) # CRITICAL, WARNING, INFO
    category = Column(String) # Traffic, Weather, Risk, System
    title = Column(String)
    description = Column(String)
    action_label = Column(String, nullable=True)
    truck_id = Column(Integer, ForeignKey("trucks.id"), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Truck(Base):
    __tablename__ = "trucks"
    id = Column(Integer, primary_key=True, index=True)
    license_plate = Column(String, unique=True, index=True)
    driver_name = Column(String)
    status = Column(String, default="Idle") # In Transit, Delayed, Idle

class GPSData(Base):
    __tablename__ = "gps_data"
    id = Column(Integer, primary_key=True, index=True)
    truck_id = Column(Integer, ForeignKey("trucks.id"))
    latitude = Column(Float)
    longitude = Column(Float)
    speed = Column(Float)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Trip(Base):
    __tablename__ = "trips"
    id = Column(Integer, primary_key=True, index=True)
    truck_id = Column(Integer, ForeignKey("trucks.id"))
    source = Column(String)
    destination = Column(String)
    predicted_delay = Column(Float)
    risk_score = Column(Float)
    status = Column(String, default="In Transit") # In Transit, Delivered, Cancelled
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
