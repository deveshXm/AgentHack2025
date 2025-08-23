import os
import uuid
from datetime import datetime
from typing import Any

from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi import BackgroundTasks

from app.config import get_settings
from app.dao.mongo import get_db
from app.services import portia_plan


router = APIRouter()


@router.post("/intake")
async def upload_intake(file: UploadFile = File(...)) -> dict[str, Any]:
    settings = get_settings()
    db = await get_db()

    os.makedirs("uploads", exist_ok=True)
    intake_id = str(uuid.uuid4())
    dst_path = os.path.join("uploads", f"{intake_id}_{file.filename}")
    with open(dst_path, "wb") as f:
        f.write(await file.read())

    doc = {
        "_id": intake_id,
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "sourceFilePath": dst_path,
        "status": "created",
    }
    await db["pt_intakes"].insert_one(doc)
    return {"intakeId": intake_id}


@router.post("/intake/{intake_id}/run")
async def run_intake(intake_id: str, background_tasks: BackgroundTasks) -> dict[str, str]:
    db = await get_db()
    exists = await db["pt_intakes"].find_one({"_id": intake_id})
    if not exists:
        raise HTTPException(status_code=404, detail="intake not found")

    # run orchestrator in background
    background_tasks.add_task(portia_plan.run_intake_pipeline, intake_id)
    return {"runId": intake_id}


@router.get("/intake/{intake_id}")
async def get_intake(intake_id: str) -> dict[str, Any]:
    db = await get_db()

    intake = await db["pt_intakes"].find_one({"_id": intake_id}, {"_id": 0})
    if not intake:
        raise HTTPException(status_code=404, detail="intake not found")

    eligibility = await db["eligibility_results"].find_one({"intakeId": intake_id}, {"_id": 0})
    authorization = await db["authorization_records"].find_one({"intakeId": intake_id}, {"_id": 0})
    transcript = await db["call_transcripts"].find_one({"intakeId": intake_id}, {"_id": 0})
    audit_cursor = db["audit_events"].find({"entityId": intake_id}).sort("timestamp", 1)
    audit = [
        {k: v for k, v in ev.items() if k != "_id"}
        async for ev in audit_cursor
    ]

    return {
        "intake": intake,
        "eligibility": eligibility,
        "authorization": authorization,
        "transcript": transcript,
        "audit": audit,
    }


