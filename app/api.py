"""
API Routes — Proxy layer for external data APIs.
Hides API keys from the frontend and provides caching.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "version": "0.1.0"}


@router.get("/states")
async def get_states():
    """Return summary data for all US states."""
    # Placeholder — will be populated from cached API data
    return {"message": "States endpoint — coming soon"}


@router.get("/states/{state_fips}")
async def get_state_detail(state_fips: str):
    """Return detailed data for a specific state by FIPS code."""
    return {"state_fips": state_fips, "message": "State detail — coming soon"}


@router.get("/states/{state_fips}/counties")
async def get_counties(state_fips: str):
    """Return county-level data for a specific state."""
    return {"state_fips": state_fips, "message": "Counties endpoint — coming soon"}
