from __future__ import annotations

import os
from typing import Any, Dict
import asyncio

from app.dao.mongo import get_db
from app.services.ocr_service import extract_fields_with_azure, apply_defaults
from app.services.ivr_service import IVRService
from app.services.erp_service import persist_results
from app.services.audit_service import emit_audit


ivr = IVRService()


async def run_intake_pipeline(intake_id: str) -> None:
    db = await get_db()
    await emit_audit(entity_type="pt_intake", entity_id=intake_id, action="runStarted")

    intake = await db["pt_intakes"].find_one({"_id": intake_id})
    if not intake:
        return
    file_path = intake.get("sourceFilePath")
    image_url = f"file://{os.path.abspath(file_path)}"

    # Step 1: OCR
    extracted = await extract_fields_with_azure(image_url)
    extracted = apply_defaults(extracted)
    await emit_audit(entity_type="pt_intake", entity_id=intake_id, action="ocrExtracted", after=extracted)

    # Simulate verification delay for demo (no Twilio call)
    await asyncio.sleep(6)

    # Step 2: Eligibility + Auth via IVR rules (deterministic)
    visits_requested = int(extracted.get("clinical", {}).get("visitsRequested", 0) or 0)
    benefits = ivr._benefits_summary()
    auth = ivr.calculate_auth(visits_requested)
    await emit_audit(entity_type="pt_intake", entity_id=intake_id, action="eligibilityChecked", after=benefits)
    if auth.get("authRequired"):
        await emit_audit(entity_type="pt_intake", entity_id=intake_id, action="authObtained", after=auth)
    else:
        await emit_audit(entity_type="pt_intake", entity_id=intake_id, action="authWaived", after=auth)

    # Step 3: Persist
    transcript = {"stepsJson": [], "dtmfJson": [], "outcomeSummary": "simulated"}
    await persist_results(
        intake_id=intake_id,
        extracted=extracted,
        benefits=benefits,
        auth_result=auth,
        transcript=transcript,
    )
    await emit_audit(entity_type="pt_intake", entity_id=intake_id, action="saved")


