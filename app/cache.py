"""
Simple file-based cache with TTL.
Stores API responses as JSON files so we don't hammer upstream APIs on every page load.
"""

import json
import time
from pathlib import Path
from typing import Any

CACHE_DIR = Path(__file__).parent.parent / ".cache"
DEFAULT_TTL = 86400  # 24 hours in seconds


def _cache_path(key: str) -> Path:
    """Return the file path for a given cache key."""
    safe_key = key.replace("/", "_").replace(":", "_")
    return CACHE_DIR / f"{safe_key}.json"


def get(key: str) -> Any | None:
    """
    Retrieve a cached value by key.
    Returns None if the cache is missing or expired.
    """
    path = _cache_path(key)
    if not path.exists():
        return None

    try:
        with open(path, "r", encoding="utf-8") as f:
            entry = json.load(f)

        if time.time() - entry.get("timestamp", 0) > entry.get("ttl", DEFAULT_TTL):
            # Expired
            path.unlink(missing_ok=True)
            return None

        return entry.get("data")
    except (json.JSONDecodeError, KeyError, OSError):
        path.unlink(missing_ok=True)
        return None


def set(key: str, data: Any, ttl: int = DEFAULT_TTL) -> None:
    """
    Store a value in the cache with a TTL (in seconds).
    """
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    path = _cache_path(key)

    entry = {
        "timestamp": time.time(),
        "ttl": ttl,
        "data": data,
    }

    with open(path, "w", encoding="utf-8") as f:
        json.dump(entry, f, indent=2)


def clear() -> None:
    """Remove all cached files."""
    if CACHE_DIR.exists():
        for path in CACHE_DIR.glob("*.json"):
            path.unlink(missing_ok=True)
