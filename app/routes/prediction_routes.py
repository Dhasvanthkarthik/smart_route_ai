from fastapi import APIRouter
from app.models import schemas
from app.services.ml_model import predictor
from app.services.alerts import check_for_alerts

router = APIRouter(tags=["prediction"])

@router.post("/predict/delay")
def predict_delay(req: schemas.DelayRequest):
    delay = predictor.predict_delay(req)
    return {"predicted_delay_minutes": delay}

@router.post("/predict/risk")
def predict_risk(req: schemas.RiskRequest):
    score, level = predictor.calculate_risk(req.traffic_score, req.weather_score, req.delay_minutes)
    return {"score": score, "level": level}

@router.get("/alerts")
def get_alerts(delay_minutes: float = 0.0, risk_score: float = 0.0):
    return check_for_alerts(delay_minutes, risk_score)
