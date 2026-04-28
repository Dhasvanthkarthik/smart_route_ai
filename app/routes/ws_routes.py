from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict

router = APIRouter(tags=["websocket"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[int, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, truck_id: int):
        await websocket.accept()
        if truck_id not in self.active_connections:
            self.active_connections[truck_id] = []
        self.active_connections[truck_id].append(websocket)

    def disconnect(self, websocket: WebSocket, truck_id: int):
        self.active_connections[truck_id].remove(websocket)
        if not self.active_connections[truck_id]:
            del self.active_connections[truck_id]

    async def broadcast_to_truck(self, truck_id: int, message: str):
        if truck_id in self.active_connections:
            for connection in self.active_connections[truck_id]:
                await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/truck/{truck_id}")
async def websocket_endpoint(websocket: WebSocket, truck_id: int):
    await manager.connect(websocket, truck_id)
    try:
        while True:
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, truck_id)
