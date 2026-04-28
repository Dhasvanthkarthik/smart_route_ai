import os
import httpx
from typing import Dict, Any

WEATHER_API_KEY = os.getenv("WEATHER_API_KEY")

async def get_weather_data(lat: float, lon: float) -> Dict[str, Any]:
    if not WEATHER_API_KEY:
        return {"error": "API key missing", "main": {"temp": 0}}
        
    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={WEATHER_API_KEY}&units=metric"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
            if response.status_code == 200:
                return response.json()
            else:
                return {
                    "error": f"API error {response.status_code}",
                    "weather": [{"main": "Clear", "description": "simulated clear sky"}],
                    "main": {"temp": 22.0, "humidity": 45}
                }
        except Exception as e:
            return {"error": str(e)}

async def get_traffic_data(lat: float, lon: float) -> Dict[str, str]:
    return {
        "congestion_level": "medium",
        "description": "Moderate traffic on major routes."
    }
