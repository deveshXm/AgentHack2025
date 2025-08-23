from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional

from app.services.ivr_service import IVRService


router = APIRouter()
ivr = IVRService()


class StartResponse(BaseModel):
    sessionId: str
    state: str
    prompt: str


@router.post("/start", response_model=StartResponse)
async def start():
    state = ivr.start()
    return StartResponse(**state)


class DtmfRequest(BaseModel):
    digit: str = Field(min_length=1, max_length=1)


@router.post("/{session_id}/dtmf")
async def dtmf(session_id: str, body: DtmfRequest):
    return ivr.dtmf(session_id, body.digit)


@router.get("/{session_id}/result")
async def result(session_id: str):
    return ivr.result(session_id)


