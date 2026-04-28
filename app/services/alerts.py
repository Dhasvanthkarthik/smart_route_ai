from sqlalchemy.orm import Session
from app.models import domain, schemas
from datetime import datetime, timezone
import random

def trigger_alerts(db: Session, truck_id: int, lat: float, lon: float, speed: float, traffic_level: int = 1, weather_condition: int = 1, predicted_delay: float = 0, risk_score: float = 0):
    alerts_to_add = []
    
    # 1. Traffic Alert
    if traffic_level >= 3: # 3 is High
        alerts_to_add.append(domain.Alert(
            severity="WARNING",
            category="Traffic",
            title="Heavy Congestion Detected",
            description=f"Heavy traffic detected on current route for Truck TRK-{truck_id}. Expected delay increase.",
            action_label="Inspect",
            truck_id=truck_id,
            latitude=lat,
            longitude=lon
        ))
        
    # 2. Weather Alert
    if weather_condition >= 2: # 2: Rain, 3: Storm
        severity = "CRITICAL" if weather_condition == 3 else "WARNING"
        alerts_to_add.append(domain.Alert(
            severity=severity,
            category="Weather",
            title="Severe Weather Warning",
            description=f"Severe weather conditions detected near Truck TRK-{truck_id}. Route may be impacted.",
            action_label="View Details",
            truck_id=truck_id,
            latitude=lat,
            longitude=lon
        ))
        
    # 3. Delay Alert
    if predicted_delay > 15:
        alerts_to_add.append(domain.Alert(
            severity="WARNING",
            category="Risk",
            title="Significant Delay Predicted",
            description=f"Truck TRK-{truck_id}: Significant delay predicted ({predicted_delay:.1f} mins). Consider alternate routing.",
            action_label="Reroute",
            truck_id=truck_id,
            latitude=lat,
            longitude=lon
        ))
        
    # 4. High Risk Alert
    if risk_score > 70:
        alerts_to_add.append(domain.Alert(
            severity="CRITICAL",
            category="Risk",
            title="High Risk Route Detected",
            description=f"High risk route detected for Truck TRK-{truck_id} due to combined traffic and weather factors.",
            action_label="Mitigate",
            truck_id=truck_id,
            latitude=lat,
            longitude=lon
        ))
        
    # 5. Route Deviation Alert (Simple logic: if speed is high but location is weird, or just random chance for demo)
    # In a real app, we'd check against a planned path.
    if random.random() < 0.05: # 5% chance of deviation for demo
        alerts_to_add.append(domain.Alert(
            severity="CRITICAL",
            category="System",
            title="Route Deviation Alert",
            description=f"Vehicle TRK-{truck_id} deviated from assigned route.",
            action_label="Contact Driver",
            truck_id=truck_id,
            latitude=lat,
            longitude=lon
        ))

    if alerts_to_add:
        db.add_all(alerts_to_add)
        db.commit()

def check_for_alerts(predicted_delay: float = 0, risk_score: float = 0):
    """
    Returns potential alerts based on delay and risk score without saving to DB.
    Used for predictive UI feedback.
    """
    alerts = []
    
    if predicted_delay > 15:
        alerts.append({
            "severity": "WARNING",
            "category": "Risk",
            "title": "Significant Delay Predicted",
            "description": f"Significant delay predicted ({predicted_delay:.1f} mins). Consider alternate routing."
        })
        
    if risk_score > 70:
        alerts.append({
            "severity": "CRITICAL",
            "category": "Risk",
            "title": "High Risk Route Detected",
            "description": "High risk route detected due to combined traffic and weather factors."
        })
        
    return alerts
