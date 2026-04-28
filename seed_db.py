from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import domain
from app.auth.security import get_password_hash
import os

DATABASE_URL = "sqlite:///./logistics.db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed():
    domain.Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # Create user
    username = "test@test.com"
    db_user = db.query(domain.User).filter(domain.User.username == username).first()
    if not db_user:
        hashed_password = get_password_hash("password123")
        new_user = domain.User(username=username, hashed_password=hashed_password)
        db.add(new_user)
        print(f"User {username} created")
    
    # Seed alerts if empty
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
            )
        ]
        db.add_all(alerts)
        print("Alerts seeded")
    
    # Seed trucks and trips
    if db.query(domain.Truck).count() == 0:
        trucks = [
            domain.Truck(license_plate="TRK-101", driver_name="John Doe", status="In Transit"),
            domain.Truck(license_plate="TRK-102", driver_name="Jane Smith", status="Delayed")
        ]
        db.add_all(trucks)
        db.commit() # Need IDs for trips
        
        trips = [
            domain.Trip(truck_id=1, source="Chicago", destination="New York", predicted_delay=15.0, risk_score=45.0),
            domain.Trip(truck_id=2, source="Los Angeles", destination="Seattle", predicted_delay=60.0, risk_score=85.0)
        ]
        db.add_all(trips)

        gps_data = [
            domain.GPSData(truck_id=1, latitude=41.8781, longitude=-87.6298, speed=65.0),
            domain.GPSData(truck_id=2, latitude=34.0522, longitude=-118.2437, speed=55.0)
        ]
        db.add_all(gps_data)
        print("Trucks, trips, and GPS data seeded")

    db.commit()
    db.close()

if __name__ == "__main__":
    seed()
