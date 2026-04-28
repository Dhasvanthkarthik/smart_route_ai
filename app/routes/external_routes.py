from fastapi import APIRouter, Query
from app.services.logistics import get_weather_data, get_traffic_data

router = APIRouter(tags=["external"])

@router.get("/traffic")
async def get_traffic(lat: float = Query(0.0), lon: float = Query(0.0)):
    return await get_traffic_data(lat, lon)

@router.get("/weather")
async def get_weather(lat: float = Query(0.0), lon: float = Query(0.0)):
    return await get_weather_data(lat, lon)
