import threading
import time
import random
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models import domain

class LogisticsSimulator:
    def __init__(self):
        self.running = False
        self.thread = None

    def start(self):
        self.running = True
        self.thread = threading.Thread(target=self._run, daemon=True)
        self.thread.start()

    def stop(self):
        self.running = False

    def _run(self):
        print("Starting logistics simulation...")
        while self.running:
            try:
                db = SessionLocal()
                self._simulate_movement(db)
                self._generate_random_alerts(db)
                db.close()
            except Exception as e:
                print(f"Simulation error: {e}")
            time.sleep(10) # Update every 10 seconds

    def _simulate_movement(self, db: Session):
        # Find all active trucks (status = 'In Transit')
        trucks = db.query(domain.Truck).filter(domain.Truck.status == 'In Transit').all()
        
        for truck in trucks:
            # Get latest GPS data
            latest_gps = db.query(domain.GPSData).filter(domain.GPSData.truck_id == truck.id).order_by(domain.GPSData.timestamp.desc()).first()
            
            if latest_gps:
                # Move slightly
                new_lat = latest_gps.latitude + random.uniform(-0.01, 0.01)
                new_lng = latest_gps.longitude + random.uniform(-0.01, 0.01)
                new_speed = max(30.0, min(80.0, latest_gps.speed + random.uniform(-5, 5)))
                
                new_gps = domain.GPSData(
                    truck_id=truck.id,
                    latitude=new_lat,
                    longitude=new_lng,
                    speed=new_speed,
                    timestamp=datetime.now(timezone.utc)
                )
                db.add(new_gps)
        
        db.commit()

    def _generate_random_alerts(self, db: Session):
        if random.random() < 0.1: # 10% chance to generate an alert every 10s
            alert = domain.Alert(
                severity=random.choice(["WARNING", "INFO"]),
                category=random.choice(["Traffic", "Weather", "System"]),
                title="Simulated Event",
                description="This is an AI-generated simulation event for demonstration purposes.",
                action_label="Details",
                timestamp=datetime.now(timezone.utc)
            )
            db.add(alert)
            db.commit()

simulator = LogisticsSimulator()
