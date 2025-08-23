from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from app.dao.mongo import get_db


async def emit_audit(
    *,
    entity_type: str,
    entity_id: str,
    action: str,
    actor_role: str = "system",
    before: Optional[dict[str, Any]] = None,
    after: Optional[dict[str, Any]] = None,
    run_id: Optional[str] = None,
) -> None:
    db = await get_db()
    await db["audit_events"].insert_one(
        {
            "entityType": entity_type,
            "entityId": entity_id,
            "action": action,
            "actorRole": actor_role,
            "timestamp": datetime.utcnow(),
            "beforeJson": before,
            "afterJson": after,
            "runId": run_id,
        }
    )


