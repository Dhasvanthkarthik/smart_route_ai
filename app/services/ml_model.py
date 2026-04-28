import os
import joblib
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from app.models.schemas import DelayRequest

MODEL_PATH = "delay_model.joblib"

class DelayPredictor:
    def __init__(self):
        self.model = None

    def load_or_train_model(self):
        if os.path.exists(MODEL_PATH):
            self.model = joblib.load(MODEL_PATH)
        else:
            self._train_synthetic_model()
            
    def _train_synthetic_model(self):
        print("Training synthetic delay prediction model...")
        np.random.seed(42)
        distance = np.random.uniform(10, 500, 1000)
        speed = np.random.uniform(30, 80, 1000)
        traffic_level = np.random.choice([1, 2, 3], 1000)
        weather_condition = np.random.choice([1, 2, 3], 1000)
        time_of_day = np.random.uniform(0, 24, 1000)
        
        delay = (distance / speed) * 60 * (traffic_level * 0.2) + (weather_condition * 15)
        
        X = pd.DataFrame({
            "distance": distance,
            "speed": speed,
            "traffic_level": traffic_level,
            "weather_condition": weather_condition,
            "time_of_day": time_of_day
        })
        y = delay
        
        self.model = LinearRegression()
        self.model.fit(X, y)
        joblib.dump(self.model, MODEL_PATH)
        print("Model saved to", MODEL_PATH)

    def predict_delay(self, req: DelayRequest) -> float:
        if not self.model:
            self.load_or_train_model()
        X_new = pd.DataFrame([{
            "distance": req.distance,
            "speed": req.speed,
            "traffic_level": req.traffic_level,
            "weather_condition": req.weather_condition,
            "time_of_day": req.time_of_day
        }])
        return max(0.0, float(self.model.predict(X_new)[0]))

    def calculate_risk(self, traffic_score: float, weather_score: float, delay_minutes: float):
        normalized_delay = min(delay_minutes, 100.0)
        risk = (traffic_score * 0.4) + (weather_score * 0.3) + (normalized_delay * 0.3)
        
        if risk < 30:
            level = "Low"
        elif risk < 70:
            level = "Medium"
        else:
            level = "High"
            
        return risk, level

predictor = DelayPredictor()
