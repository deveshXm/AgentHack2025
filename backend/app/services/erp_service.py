from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from app.dao.mongo import get_db


async def persist_results(
    *,
    intake_id: str,
    extracted: Dict[str, Any],
    benefits: Dict[str, Any],
    auth_result: Dict[str, Any],
    transcript: Dict[str, Any],
) -> None:
    db = await get_db()

    await db["eligibility_results"].update_one(
        {"intakeId": intake_id},
        {
            "$set": {
                "intakeId": intake_id,
                **benefits,
            }
        },
        upsert=True,
    )

    await db["authorization_records"].update_one(
        {"intakeId": intake_id},
        {
            "$set": {
                "intakeId": intake_id,
                **auth_result,
            }
        },
        upsert=True,
    )

    await db["call_transcripts"].update_one(
        {"intakeId": intake_id},
        {
            "$set": {
                "intakeId": intake_id,
                **transcript,
            }
        },
        upsert=True,
    )

    await db["pt_intakes"].update_one(
        {"_id": intake_id},
        {"$set": {"updatedAt": datetime.utcnow(), "status": "saved", **_flatten_extracted(extracted)}},
    )


def _flatten_extracted(extracted: Dict[str, Any]) -> Dict[str, Any]:
    patient = extracted.get("patient", {})
    insurance = extracted.get("insurance", {})
    clinical = extracted.get("clinical", {})
    provider = extracted.get("provider", {})
    return {
        "patientFirst": patient.get("firstName", ""),
        "patientLast": patient.get("lastName", ""),
        "dob": patient.get("dob", ""),
        "payerName": insurance.get("payerName", ""),
        "planName": insurance.get("planName", ""),
        "groupNumber": insurance.get("groupNumber"),
        "memberId": insurance.get("memberId", ""),
        "subscriberName": insurance.get("subscriberName", ""),
        "referringProviderName": provider.get("referringProviderName", ""),
        "referringProviderNpi": provider.get("referringProviderNpi", ""),
        "siteOfCare": provider.get("siteOfCare", ""),
        "cptCodes": clinical.get("cptCodes", []),
        "icd10Code": clinical.get("icd10Code", ""),
        "visitsRequested": clinical.get("visitsRequested", 0),
    }


