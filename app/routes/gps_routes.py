from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.database import get_db
from app.models import domain, schemas
from typing import List
from app.services.alerts import trigger_alerts
from app.services.ml_model import predictor
import random

router = APIRouter(prefix="/gps", tags=["gps"])

@router.post("/update", response_model=schemas.GPSResponse)
def update_gps(gps: schemas.GPSUpdate, db: Session = Depends(get_db)):
    # check truck exists, if not create dummy for now
    truck = db.query(domain.Truck).filter(domain.Truck.id == gps.truck_id).first()
    if not truck:
        truck = domain.Truck(id=gps.truck_id, license_plate=f"TRK-{gps.truck_id}", driver_name="Unknown")
        db.add(truck)
        db.commit()
    
    new_gps = domain.GPSData(
        truck_id=gps.truck_id,
        latitude=gps.latitude,
        longitude=gps.longitude,
        speed=gps.speed,
        timestamp=gps.timestamp
    )
    db.add(new_gps)
    db.commit()
    db.refresh(new_gps)

    # Real-time alert check
    # Simulate traffic/weather for the current location/time
    traffic_level = random.randint(1, 3)
    weather_condition = random.randint(1, 3)
    
    # Get a quick prediction for this truck
    delay_req = schemas.DelayRequest(
        distance=10.0, # distance to next point
        speed=gps.speed,
        traffic_level=traffic_level,
        weather_condition=weather_condition,
        time_of_day=datetime.now().hour
    )
    predicted_delay = predictor.predict_delay(delay_req)
    risk_score, _ = predictor.calculate_risk(random.uniform(0, 100), random.uniform(0, 100), predicted_delay)

    trigger_alerts(
        db, 
        truck_id=gps.truck_id, 
        lat=gps.latitude, 
        lon=gps.longitude, 
        speed=gps.speed,
        traffic_level=traffic_level,
        weather_condition=weather_condition,
        predicted_delay=predicted_delay,
        risk_score=risk_score
    )

    return new_gps

# NOTE: Static routes (/trucks, /all, /history/{id}) MUST come before the
# dynamic /{id} route, otherwise FastAPI will greedily match them as integers.

@router.get("/trucks", response_model=List[schemas.TruckResponse])
def list_trucks(db: Session = Depends(get_db)):
    return db.query(domain.Truck).all()

@router.patch("/trucks/{truck_id}", response_model=schemas.TruckResponse)
def update_truck(truck_id: int, truck: schemas.TruckUpdate, db: Session = Depends(get_db)):
    db_truck = db.query(domain.Truck).filter(domain.Truck.id == truck_id).first()
    if not db_truck:
        raise HTTPException(status_code=404, detail="Truck not found")
    
    update_data = truck.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_truck, key, value)
    
    db.commit()
    db.refresh(db_truck)
    return db_truck

@router.get("/all", response_model=List[schemas.GPSResponse])
def get_all_trucks(db: Session = Depends(get_db)):
    subquery = db.query(
        domain.GPSData.truck_id, 
        func.max(domain.GPSData.timestamp).label('max_timestamp')
    ).group_by(domain.GPSData.truck_id).subquery()

    results = db.query(domain.GPSData).join(
        subquery,
        (domain.GPSData.truck_id == subquery.c.truck_id) & 
        (domain.GPSData.timestamp == subquery.c.max_timestamp)
    ).all()
    return results

@router.get("/history/{truck_id}")
def get_history(truck_id: int, db: Session = Depends(get_db)):
    history = db.query(domain.GPSData).filter(domain.GPSData.truck_id == truck_id).order_by(domain.GPSData.timestamp.desc()).all()
    return history

@router.get("/{id}", response_model=schemas.GPSResponse)
def get_truck(id: int, db: Session = Depends(get_db)):
    latest = db.query(domain.GPSData).filter(domain.GPSData.truck_id == id).order_by(domain.GPSData.timestamp.desc()).first()
    if not latest:
        raise HTTPException(status_code=404, detail="Truck not found or no data")
    return latest
