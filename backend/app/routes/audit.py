from fastapi import APIRouter, HTTPException
from app.dao.mongo import get_db


router = APIRouter()


@router.get("/{entity}/{entity_id}")
async def get_audit(entity: str, entity_id: str):
    db = await get_db()
    cursor = db["audit_events"].find({"entityType": entity, "entityId": entity_id}).sort("timestamp", 1)
    events = [{k: v for k, v in ev.items() if k != "_id"} async for ev in cursor]
    if not events:
        # still return empty array if none
        return {"events": []}
    return {"events": events}


