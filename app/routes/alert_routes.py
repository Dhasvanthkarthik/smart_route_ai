from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.models import domain, schemas
from app.auth.security import get_current_user

router = APIRouter(prefix="/alerts", tags=["alerts"])

@router.get("/", response_model=List[schemas.AlertResponse])
def get_alerts(
    db: Session = Depends(get_db),
    current_user: domain.User = Depends(get_current_user)
):
    return db.query(domain.Alert).order_by(domain.Alert.timestamp.desc()).all()

@router.post("/", response_model=schemas.AlertResponse)
def create_alert(
    alert: schemas.AlertCreate,
    db: Session = Depends(get_db),
    current_user: domain.User = Depends(get_current_user)
):
    new_alert = domain.Alert(**alert.model_dump())
    db.add(new_alert)
    db.commit()
    db.refresh(new_alert)
    return new_alert

@router.post("/seed")
def seed_alerts(db: Session = Depends(get_db), current_user: domain.User = Depends(get_current_user)):
    # Seed some initial alerts if none exist
    if db.query(domain.Alert).count() == 0:
        alerts = [
            domain.Alert(
                severity="CRITICAL",
                category="Weather",
                title="Storm Warning I-80 Nebraska Sector",
                description="Extreme snow accumulation expected. Visibility reduced. AI recommends divergence.",
                action_label="View Reroute"
            ),
            domain.Alert(
                severity="WARNING",
                category="Traffic",
                title="Heavy Congestion Chicago Hub",
                description="Major accident on I-94 inbound. Hub shipments delayed by 45 mins.",
                action_label="Inspect"
            ),
            domain.Alert(
                severity="INFO",
                category="System",
                title="API Optimization Complete",
                description="System frequency increased for Q4 surge. Latency sub-50ms.",
                action_label="Details"
            )
        ]
        db.add_all(alerts)
        db.commit()
    return {"message": "Alerts seeded"}
