"""
API Routes — Proxy layer for external data APIs.
Serves real data fetched from Census, FBI, BLS, Open-Meteo, and FEMA.
"""

import logging
from fastapi import APIRouter

from app.fetchers import fetch_all_state_data
from app.state_ref import STATE_REF

logger = logging.getLogger("usa-data-map.api")

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "0.2.0"}


@router.get("/data/all")
async def get_all_data():
    """
    Return combined data for all US states.
    This is the primary endpoint consumed by the frontend.
    The first call may take 10-30 seconds while data is fetched from upstream APIs.
    Subsequent calls are served from cache.
    """
    try:
        data = await fetch_all_state_data()

        # Report which sources contributed
        sample = next(iter(data.values()), {}) if data else {}
        has_real_pop = sample.get("population", 0) > 0
        has_real_crime = sample.get("crimeRate", 0) > 0

        return {
            "status": "ok",
            "count": len(data),
            "sources": {
                "census": has_real_pop,
                "crime": has_real_crime,
            },
            "data": data,
        }
    except Exception as e:
        logger.error(f"Error fetching state data: {e}", exc_info=True)
        return {
            "status": "error",
            "message": str(e),
            "data": {},
        }


@router.get("/data/refresh")
async def refresh_data():
    """
    Force refresh all cached data.
    Clears the cache and re-fetches from all APIs.
    """
    from app import cache
    cache.clear()
    data = await fetch_all_state_data()
    return {
        "status": "ok",
        "message": "Data refreshed",
        "count": len(data),
    }


@router.get("/states")
async def get_states():
    """Return summary data for all US states."""
    data = await fetch_all_state_data()
    return {"status": "ok", "count": len(data), "data": data}


@router.get("/states/{state_fips}")
async def get_state_detail(state_fips: str):
    """Return detailed data for a specific state by FIPS code."""
    data = await fetch_all_state_data()
    fips = state_fips.zfill(2)

    if fips not in data:
        return {"status": "error", "message": f"State FIPS {fips} not found"}

    return {"status": "ok", "data": data[fips]}
