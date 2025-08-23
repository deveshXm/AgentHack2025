from __future__ import annotations

import asyncio
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.config import get_settings


_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None
_lock = asyncio.Lock()


async def get_db() -> AsyncIOMotorDatabase:
    global _client, _db
    if _db is not None:
        return _db
    async with _lock:
        if _db is not None:
            return _db
        settings = get_settings()
        if not settings.mongodb_uri:
            raise RuntimeError("MONGODB_URI is required")
        _client = AsyncIOMotorClient(settings.mongodb_uri)
        _db = _client[settings.mongodb_db]
        return _db


