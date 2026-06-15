"""
USA Data Map — FastAPI Application
Interactive multi-layered data visualization map of the United States.
"""

import os
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from app.api import router as api_router

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("usa-data-map")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Pre-fetch data on startup so the first page load is fast."""
    logger.info("=" * 50)
    logger.info("USA Data Map starting up...")

    # Check which API keys are configured
    census_key = os.getenv("CENSUS_API_KEY", "")
    fbi_key = os.getenv("FBI_API_KEY", "")

    if census_key:
        logger.info("✓ CENSUS_API_KEY configured")
    else:
        logger.warning("✗ CENSUS_API_KEY not set — demographics, income, education, healthcare will be empty")

    if fbi_key:
        logger.info("✓ FBI_API_KEY configured")
    else:
        logger.warning("✗ FBI_API_KEY not set — crime data will be empty")

    logger.info("✓ BLS API (no key needed)")
    logger.info("✓ Open-Meteo API (no key needed)")
    logger.info("✓ OpenFEMA API (no key needed)")

    # Pre-fetch all data
    logger.info("Pre-fetching data from APIs (this may take 15-30 seconds)...")
    try:
        from app.fetchers import fetch_all_state_data
        data = await fetch_all_state_data()
        logger.info(f"✓ Data ready — {len(data)} states loaded")
    except Exception as e:
        logger.error(f"✗ Pre-fetch failed: {e}")
        logger.info("The app will retry when data is first requested.")

    logger.info("=" * 50)
    logger.info("Server ready at http://localhost:8000")
    logger.info("=" * 50)

    yield  # App runs here

    logger.info("Shutting down...")


app = FastAPI(
    title="USA Data Map",
    description="Interactive multi-layered data visualization map of the United States",
    version="0.2.0",
    lifespan=lifespan,
)

# Mount static files
static_dir = Path(__file__).parent.parent / "static"
app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

# Include API routes
app.include_router(api_router, prefix="/api")


@app.get("/")
async def serve_index():
    """Serve the main application page."""
    index_path = static_dir / "index.html"
    return FileResponse(str(index_path))
