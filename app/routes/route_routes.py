from fastapi import APIRouter
from app.models import schemas
import random

router = APIRouter(prefix="/route", tags=["route"])

@router.post("/optimize", response_model=schemas.RouteResponse)
def optimize_route(req: schemas.RouteRequest):
    return schemas.RouteResponse(
        best_route=f"{req.source} -> Highway A -> {req.destination}",
        alternate_routes=[
            f"{req.source} -> Highway B -> {req.destination}",
            f"{req.source} -> Local Roads -> {req.destination}"
        ],
        estimated_time=random.uniform(30.0, 180.0)
    )

@router.post("/compare")
def compare_routes(req: schemas.RouteRequest):
    base_time = random.uniform(30.0, 180.0)
    return {
        "best_route": {"name": f"{req.source} -> Highway A -> {req.destination}", "time": base_time},
        "alternate_1": {"name": f"{req.source} -> Highway B -> {req.destination}", "time": base_time * 1.2},
        "alternate_2": {"name": f"{req.source} -> Local Roads -> {req.destination}", "time": base_time * 1.5}
    }
