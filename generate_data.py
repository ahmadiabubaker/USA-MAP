"""
generate_data.py — Standalone data fetcher for GitHub Actions CI.

Fetches all state data from live APIs and writes static/data/states.json.
Run with:
    python generate_data.py

Required env vars (set as GitHub Secrets):
    CENSUS_API_KEY
    FBI_API_KEY
"""

import asyncio
import json
import os
import sys
import logging
from pathlib import Path

# Add project root to path so we can import app modules
sys.path.insert(0, str(Path(__file__).parent))

from app.fetchers import fetch_all_state_data

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("generate_data")


async def main():
    logger.info("=" * 55)
    logger.info("USA Data Map — Static Data Generator")
    logger.info("=" * 55)

    census_key = os.getenv("CENSUS_API_KEY", "")
    fbi_key    = os.getenv("FBI_API_KEY", "")

    if census_key:
        logger.info("✓ CENSUS_API_KEY present")
    else:
        logger.warning("✗ CENSUS_API_KEY missing — demographics will be empty")

    if fbi_key:
        logger.info("✓ FBI_API_KEY present")
    else:
        logger.warning("✗ FBI_API_KEY missing — crime data will be empty")

    logger.info("Fetching from all APIs (may take 30–60 seconds)...")
    data = await fetch_all_state_data()

    if not data:
        logger.error("No data returned — aborting")
        sys.exit(1)

    # Write output
    out_dir  = Path(__file__).parent / "static" / "data"
    out_dir.mkdir(parents=True, exist_ok=True)
    out_file = out_dir / "states.json"

    payload = {
        "generated": __import__("datetime").datetime.utcnow().isoformat() + "Z",
        "count": len(data),
        "data": data,
    }

    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(payload, f, separators=(",", ":"))

    size_kb = out_file.stat().st_size / 1024
    logger.info(f"✓ Wrote {out_file} ({size_kb:.1f} KB, {len(data)} states)")
    logger.info("Done.")


if __name__ == "__main__":
    asyncio.run(main())
