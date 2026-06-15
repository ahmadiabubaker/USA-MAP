"""
USA Data Map — FastAPI Application
Interactive multi-layered data visualization map of the United States.
"""

import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

from app.api import router as api_router

# Load environment variables
load_dotenv()

app = FastAPI(
    title="USA Data Map",
    description="Interactive multi-layered data visualization map of the United States",
    version="0.1.0",
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
