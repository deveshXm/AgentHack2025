from __future__ import annotations

import uuid
from datetime import datetime, timedelta
from typing import Dict, Any


class IVRService:
    """In-memory mock IVR state machine and deterministic PT rules.

    Demo rules:
      - visitLimit = 12
      - visitsUsed = 2
      - authRequired = visitsRequested > 6
      - visitsApproved = min(6, visitLimit - visitsUsed, visitsRequested)
      - validity = 60 days from today
    """

    def __init__(self) -> None:
        self.sessions: Dict[str, Dict[str, Any]] = {}

    def _now(self):
        return datetime.utcnow()

    def start(self) -> Dict[str, Any]:
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "state": "mainMenu",
            "prompt": "Press 1 for Eligibility and benefits, 2 for Prior authorization (PT), 0 to end",
            "dtmf": [],
            "transcript": [],
            "memberId": None,
            "dob": None,
            "benefits": None,
            "authResult": None,
        }
        return {"sessionId": session_id, "state": "mainMenu", "prompt": self.sessions[session_id]["prompt"]}

    def dtmf(self, session_id: str, digit: str) -> Dict[str, Any]:
        s = self.sessions.get(session_id)
        if not s:
            return {"error": "session not found"}
        s["dtmf"].append(digit)

        # simple state machine
        if s["state"] == "mainMenu":
            if digit == "1":
                s["state"] = "collectMemberIdElig"
                s["prompt"] = "Enter member ID followed by #"
            elif digit == "2":
                s["state"] = "collectMemberIdAuth"
                s["prompt"] = "Enter member ID followed by #"
            elif digit == "0":
                s["state"] = "ended"
                s["prompt"] = "Goodbye"
            else:
                s["prompt"] = "Invalid. Press 1 for Eligibility, 2 for Prior auth, 0 to end"

        elif s["state"] in ("collectMemberIdElig", "collectMemberIdAuth"):
            if digit == "#":
                s["prompt"] = "Enter DOB as YYYYMMDD followed by #"
                s["state"] = "collectDobElig" if s["state"] == "collectMemberIdElig" else "collectDobAuth"
            else:
                s["memberId"] = (s.get("memberId") or "") + digit
                s["prompt"] = "Continue entering member ID, then #"

        elif s["state"] in ("collectDobElig", "collectDobAuth"):
            if digit == "#":
                # proceed to benefits summary (elig) or auth check
                s["dob"] = s.get("dob") or ""
                benefit = self._benefits_summary()
                s["benefits"] = benefit
                if s["state"] == "collectDobElig":
                    s["state"] = "benefitsSummary"
                    s["prompt"] = "Benefits provided. Press 9 to repeat, 0 to end"
                else:
                    s["state"] = "checkAuthRequirement"
                    s["prompt"] = "Checking if prior auth is required... Press 9 to repeat, 0 to end"
            else:
                s["dob"] = (s.get("dob") or "") + digit
                s["prompt"] = "Continue entering DOB, then #"

        elif s["state"] == "checkAuthRequirement":
            # No-op on DTMF; the result is provided by /result endpoint
            s["prompt"] = "Auth requirement evaluated. Press 9 to repeat, 0 to end"

        elif s["state"] == "benefitsSummary":
            if digit == "9":
                s["prompt"] = "Benefits repeated. Press 9 to repeat, 0 to end"
            elif digit == "0":
                s["state"] = "ended"
                s["prompt"] = "Goodbye"

        if digit == "0":
            s["state"] = "ended"
            s["prompt"] = "Goodbye"

        return {"sessionId": session_id, "state": s["state"], "prompt": s["prompt"]}

    def result(self, session_id: str) -> Dict[str, Any]:
        s = self.sessions.get(session_id)
        if not s:
            return {"error": "session not found"}
        return {
            "sessionId": session_id,
            "benefits": s.get("benefits"),
            "authResult": s.get("authResult"),
        }

    def calculate_auth(self, visits_requested: int) -> Dict[str, Any]:
        limit = 12
        used = 2
        auth_required = visits_requested > 6
        visits_approved = max(0, min(6, limit - used, visits_requested)) if auth_required else 0
        valid_from = self._now().date()
        valid_to = (self._now() + timedelta(days=60)).date()
        auth = {
            "authRequired": auth_required,
            "visitsApproved": visits_approved,
            "authNumber": f"PT-{uuid.uuid4().hex[:8].upper()}" if auth_required else None,
            "validFrom": str(valid_from),
            "validTo": str(valid_to),
        }
        return auth

    def _benefits_summary(self) -> Dict[str, Any]:
        return {
            "coverageStart": "2025-01-01",
            "coverageEnd": "2025-12-31",
            "copayOrCoins": "20% coinsurance",
            "ptVisitLimit": 12,
            "ptVisitsUsed": 2,
        }


