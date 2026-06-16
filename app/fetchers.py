"""
API Fetchers — Async functions to pull real data from government APIs.

Each fetcher returns a dict keyed by FIPS code with the relevant metrics.
The orchestrator `fetch_all_state_data()` merges everything into a single dict.
"""

import os
import asyncio
import logging
from datetime import datetime, timedelta

import httpx

from app.state_ref import STATE_REF, ABBR_TO_FIPS, STATE_LAND_AREA, STATIC_METRICS
from app import cache

logger = logging.getLogger("usa-data-map.fetchers")

# Shared HTTP client settings
TIMEOUT = httpx.Timeout(30.0, connect=10.0)
HEADERS = {"User-Agent": "USA-Data-Map/1.0 (educational project)"}


# ============================================================
# 1. CENSUS BUREAU — Demographics, Income, Education, Healthcare
# ============================================================

async def fetch_census_data(api_key: str | None) -> dict:
    """
    Fetch from US Census ACS 5-Year estimates.
    Returns dict keyed by FIPS with: population, medianIncome, gradRate, uninsured
    """
    cache_key = "census_acs"
    cached = cache.get(cache_key)
    if cached:
        logger.info("Census data loaded from cache")
        return cached

    if not api_key:
        logger.warning("No CENSUS_API_KEY — census data will be empty")
        return {}

    result = {}

    async with httpx.AsyncClient(timeout=TIMEOUT, headers=HEADERS) as client:
        try:
            # Main ACS call: population, median income
            # B01003_001E = Total population
            # B19013_001E = Median household income
            url = (
                f"https://api.census.gov/data/2022/acs/acs5"
                f"?get=NAME,B01003_001E,B19013_001E"
                f"&for=state:*"
                f"&key={api_key}"
            )
            resp = await client.get(url)
            resp.raise_for_status()
            rows = resp.json()

            # First row is header: ["NAME", "B01003_001E", "B19013_001E", "state"]
            for row in rows[1:]:
                name, pop, income, fips = row
                fips = fips.zfill(2)
                if fips not in STATE_REF:
                    continue
                result[fips] = {
                    "population": _int(pop),
                    "medianIncome": _int(income),
                }

            # Education attainment: % with high school diploma or higher
            # S1501_C02_014E = Percent HS graduate or higher (25+)
            edu_url = (
                f"https://api.census.gov/data/2022/acs/acs5/subject"
                f"?get=NAME,S1501_C02_014E"
                f"&for=state:*"
                f"&key={api_key}"
            )
            edu_resp = await client.get(edu_url)
            edu_resp.raise_for_status()
            edu_rows = edu_resp.json()

            for row in edu_rows[1:]:
                name, grad_pct, fips = row
                fips = fips.zfill(2)
                if fips in result:
                    result[fips]["gradRate"] = _float(grad_pct)

            # Health insurance: uninsured rate
            # S2701_C05_001E = Percent uninsured
            health_url = (
                f"https://api.census.gov/data/2022/acs/acs5/subject"
                f"?get=NAME,S2701_C05_001E"
                f"&for=state:*"
                f"&key={api_key}"
            )
            health_resp = await client.get(health_url)
            health_resp.raise_for_status()
            health_rows = health_resp.json()

            for row in health_rows[1:]:
                name, uninsured_pct, fips = row
                fips = fips.zfill(2)
                if fips in result:
                    result[fips]["uninsured"] = _float(uninsured_pct)

            logger.info(f"Census: fetched data for {len(result)} states")

        except httpx.HTTPError as e:
            logger.error(f"Census API error: {e}")
            return {}

    if result:
        cache.set(cache_key, result)
    return result


# ============================================================
# 2. FBI CRIME DATA EXPLORER
# ============================================================

async def fetch_crime_data(api_key: str | None) -> dict:
    """
    Fetch crime estimates from FBI Crime Data Explorer API.
    Returns dict keyed by FIPS with: crimeRate (violent per 100K)
    """
    cache_key = "fbi_crime"
    cached = cache.get(cache_key)
    if cached:
        logger.info("FBI crime data loaded from cache")
        return cached

    if not api_key:
        logger.warning("No FBI_API_KEY — crime data will be empty")
        return {}

    result = {}

    # FBI CDE API — uses /cde/summarized/ path (new as of 2024).
    # Date format MUST be MM-YYYY (e.g. "01-2022"), NOT just a year.
    from_date = "01-2021"
    to_date   = "12-2022"

    async with httpx.AsyncClient(timeout=TIMEOUT, headers=HEADERS) as client:
        for fips, (name, abbr, lat, lng) in STATE_REF.items():
            if fips == "11":  # DC — skip, FBI data unreliable for DC
                continue
            try:
                violent_url = (
                    f"https://api.usa.gov/crime/fbi/cde/summarized/state/{abbr}/violent-crime"
                    f"?from={from_date}&to={to_date}&API_KEY={api_key}"
                )
                prop_url = (
                    f"https://api.usa.gov/crime/fbi/cde/summarized/state/{abbr}/property-crime"
                    f"?from={from_date}&to={to_date}&API_KEY={api_key}"
                )

                violent_resp, prop_resp = await asyncio.gather(
                    client.get(violent_url),
                    client.get(prop_url),
                    return_exceptions=True,
                )

                violent_rate = _avg_monthly_rate(violent_resp)
                prop_rate    = _avg_monthly_rate(prop_resp)

                if violent_rate is not None or prop_rate is not None:
                    result[fips] = {
                        "crimeRate":     round(violent_rate or 0, 1),
                        "violentCrime":  round(violent_rate or 0, 1),
                        "propertyCrime": round(prop_rate or 0, 1),
                    }

                # Be polite to the API
                await asyncio.sleep(0.15)

            except Exception as e:
                logger.warning(f"Crime fetch error for {abbr} ({fips}): {e}")

    logger.info(f"FBI Crime: fetched data for {len(result)} states")

    if result:
        cache.set(cache_key, result)
    return result


def _avg_monthly_rate(resp) -> float | None:
    """
    Parse a CDE summarized response and return the average monthly rate per 100K.
    Response shape:
      {"offenses": {"rates": {"<State> Offenses": {"MM-YYYY": <rate>, ...}}}}
    """
    try:
        if isinstance(resp, Exception):
            return None
        resp.raise_for_status()
        data = resp.json()
        rates_dict = data.get("offenses", {}).get("rates", {})
        # Key is like "Alabama Offenses" — grab the first dict value
        monthly_values = None
        for val in rates_dict.values():
            if isinstance(val, dict):
                monthly_values = val
                break
        if not monthly_values:
            return None
        values = [v for v in monthly_values.values() if isinstance(v, (int, float)) and v >= 0]
        return round(sum(values) / len(values), 1) if values else None
    except Exception:
        return None



# ============================================================
# 3. BLS — Unemployment Rate (no key needed for v1)
# ============================================================

async def fetch_bls_data() -> dict:
    """
    Fetch unemployment rates from BLS LAUS (Local Area Unemployment Statistics).
    Uses API v1 (no key required, 25 requests/day limit).
    Returns dict keyed by FIPS with: unemployment
    """
    cache_key = "bls_unemployment"
    cached = cache.get(cache_key)
    if cached:
        logger.info("BLS data loaded from cache")
        return cached

    result = {}

    # Build series IDs for all states
    # LAUS series format: LASST{FIPS}0000000000003
    # where 03 at the end = unemployment rate
    series_ids = []
    fips_for_series = []
    for fips in STATE_REF:
        series_id = f"LASST{fips}0000000000003"
        series_ids.append(series_id)
        fips_for_series.append(fips)

    # BLS v1 allows 25 series per request, we have 51 states+DC
    # Split into chunks of 25
    async with httpx.AsyncClient(timeout=TIMEOUT, headers=HEADERS) as client:
        try:
            current_year = str(datetime.now().year - 1)  # use previous year for full data

            for i in range(0, len(series_ids), 25):
                chunk_ids = series_ids[i : i + 25]
                chunk_fips = fips_for_series[i : i + 25]

                payload = {
                    "seriesid": chunk_ids,
                    "startyear": current_year,
                    "endyear": current_year,
                }

                resp = await client.post(
                    "https://api.bls.gov/publicAPI/v1/timeseries/data/",
                    json=payload,
                )
                resp.raise_for_status()
                data = resp.json()

                if data.get("status") != "REQUEST_SUCCEEDED":
                    logger.warning(f"BLS API returned status: {data.get('status')}")
                    continue

                for series in data.get("Results", {}).get("series", []):
                    series_id = series.get("seriesID", "")
                    # Extract FIPS from series ID: LASST{FIPS}0000000000003
                    fips = series_id[5:7]

                    # Get annual average (M13) or last available month
                    values = series.get("data", [])
                    if not values:
                        continue

                    # Find annual average (period M13) or fall back to latest month
                    annual = next((v for v in values if v.get("period") == "M13"), None)
                    if annual:
                        rate = _float(annual.get("value"))
                    else:
                        rate = _float(values[0].get("value"))

                    if fips in STATE_REF and rate is not None:
                        result[fips] = {"unemployment": rate}

                # Small delay between chunks to be nice to the API
                await asyncio.sleep(0.5)

            logger.info(f"BLS: fetched unemployment for {len(result)} states")

        except httpx.HTTPError as e:
            logger.error(f"BLS API error: {e}")

    if result:
        cache.set(cache_key, result)
    return result


# ============================================================
# 4. OPEN-METEO — Weather (no key needed)
# ============================================================

async def fetch_weather_data() -> dict:
    """
    Fetch historical weather from Open-Meteo archive API.
    Returns dict keyed by FIPS with: avgTemp (°F), precip (inches/year)
    """
    cache_key = "openmeteo_weather"
    cached = cache.get(cache_key)
    if cached:
        logger.info("Weather data loaded from cache")
        return cached

    result = {}

    # Use previous full year
    year = datetime.now().year - 1
    start_date = f"{year}-01-01"
    end_date = f"{year}-12-31"

    async with httpx.AsyncClient(timeout=TIMEOUT, headers=HEADERS) as client:
        # Batch into groups to avoid overwhelming the API
        fips_list = list(STATE_REF.keys())

        for i in range(0, len(fips_list), 10):
            batch = fips_list[i : i + 10]
            tasks = []

            for fips in batch:
                name, abbr, lat, lng = STATE_REF[fips]
                url = (
                    f"https://archive-api.open-meteo.com/v1/archive"
                    f"?latitude={lat}&longitude={lng}"
                    f"&start_date={start_date}&end_date={end_date}"
                    f"&daily=temperature_2m_mean,precipitation_sum"
                    f"&temperature_unit=fahrenheit"
                    f"&precipitation_unit=inch"
                    f"&timezone=auto"
                )
                tasks.append(client.get(url))

            try:
                responses = await asyncio.gather(*tasks, return_exceptions=True)

                for fips, resp in zip(batch, responses):
                    if isinstance(resp, Exception):
                        logger.warning(f"Weather error for {fips}: {resp}")
                        continue
                    try:
                        resp.raise_for_status()
                        data = resp.json()
                        daily = data.get("daily", {})

                        temps = [t for t in (daily.get("temperature_2m_mean") or []) if t is not None]
                        precips = [p for p in (daily.get("precipitation_sum") or []) if p is not None]

                        if temps and precips:
                            avg_temp = round(sum(temps) / len(temps), 1)
                            total_precip = round(sum(precips), 1)
                            result[fips] = {
                                "avgTemp": avg_temp,
                                "precip": total_precip,
                            }
                    except Exception as e:
                        logger.warning(f"Weather parse error for {fips}: {e}")

            except Exception as e:
                logger.error(f"Weather batch error: {e}")

            # Rate limiting — be nice to the free API
            await asyncio.sleep(1.0)

    logger.info(f"Open-Meteo: fetched weather for {len(result)} states")

    if result:
        cache.set(cache_key, result)
    return result


# ============================================================
# 5. OpenFEMA — Disaster Declarations (no key needed)
# ============================================================

async def fetch_fema_data() -> dict:
    """
    Fetch disaster declaration counts from OpenFEMA API.
    Returns dict keyed by FIPS with: disasters (count over 5 years)
    """
    cache_key = "fema_disasters"
    cached = cache.get(cache_key)
    if cached:
        logger.info("FEMA data loaded from cache")
        return cached

    result = {}
    five_years_ago = (datetime.now() - timedelta(days=5 * 365)).strftime("%Y-%m-%dT00:00:00.000Z")

    async with httpx.AsyncClient(timeout=TIMEOUT, headers=HEADERS) as client:
        try:
            # Fetch all declarations from last 5 years
            # Using $select to minimize payload, $top to get all records
            url = (
                f"https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries"
                f"?$filter=declarationDate ge '{five_years_ago}'"
                f"&$select=state"
                f"&$top=10000"
            )
            resp = await client.get(url)
            resp.raise_for_status()
            data = resp.json()

            declarations = data.get("DisasterDeclarationsSummaries", [])

            # Count declarations per state abbreviation
            counts = {}
            for decl in declarations:
                abbr = decl.get("state", "")
                counts[abbr] = counts.get(abbr, 0) + 1

            # Convert abbreviation → FIPS
            for abbr, count in counts.items():
                fips = ABBR_TO_FIPS.get(abbr)
                if fips:
                    result[fips] = {"disasters": count}

            logger.info(f"FEMA: fetched disaster data for {len(result)} states ({len(declarations)} total declarations)")

        except httpx.HTTPError as e:
            logger.error(f"FEMA API error: {e}")

    if result:
        cache.set(cache_key, result)
    return result


# ============================================================
# ORCHESTRATOR — Merge All Data
# ============================================================

async def fetch_all_state_data() -> dict:
    """
    Fetch data from all APIs concurrently and merge into a single dict
    keyed by FIPS code, with all metrics for every state.
    """
    cache_key = "all_state_data"
    cached = cache.get(cache_key)
    if cached:
        logger.info("All state data loaded from cache")
        return cached

    census_key = os.getenv("CENSUS_API_KEY", "")
    fbi_key = os.getenv("FBI_API_KEY", "")

    # Fetch all data sources concurrently
    logger.info("Fetching data from all APIs...")
    census, crime, bls, weather, fema = await asyncio.gather(
        fetch_census_data(census_key),
        fetch_crime_data(fbi_key),
        fetch_bls_data(),
        fetch_weather_data(),
        fetch_fema_data(),
        return_exceptions=False,
    )

    # Build merged result
    merged = {}
    for fips, (name, abbr, lat, lng) in STATE_REF.items():
        entry = {
            "name": name,
            "abbr": abbr,
        }

        # Census data (demographics, income, education, healthcare)
        if fips in census:
            entry.update(census[fips])

        # Compute density from population + land area
        pop = entry.get("population", 0)
        area = STATE_LAND_AREA.get(fips, 1)
        entry["density"] = round(pop / area, 1) if pop and area else 0

        # Growth rate — not available from a single ACS snapshot
        # Would need multi-year data; use 0.0 as placeholder
        entry.setdefault("growth", 0.0)

        # Crime
        if fips in crime:
            entry.update(crime[fips])
        else:
            entry.setdefault("crimeRate", 0)
            entry.setdefault("violentCrime", 0)
            entry.setdefault("propertyCrime", 0)

        # BLS unemployment
        if fips in bls:
            entry.update(bls[fips])
        else:
            entry.setdefault("unemployment", 0)

        # Weather
        if fips in weather:
            entry.update(weather[fips])
        else:
            entry.setdefault("avgTemp", 0)
            entry.setdefault("precip", 0)

        # FEMA disasters
        if fips in fema:
            entry.update(fema[fips])
        else:
            entry.setdefault("disasters", 0)

        # Static metrics (broadband, cost of living, per-pupil)
        static = STATIC_METRICS.get(fips, {})
        entry.setdefault("broadband", static.get("broadband", 0))
        entry.setdefault("costOfLiving", static.get("costOfLiving", 0))
        entry.setdefault("perPupil", static.get("perPupil", 0))

        # AQI — no good free real-time API without key; approximate from weather
        # Use a basic heuristic: higher temps + lower precip = worse AQI
        # This is a rough proxy until AirNow API key is added
        entry.setdefault("aqi", _estimate_aqi(entry))

        # Fill any remaining defaults
        entry.setdefault("population", 0)
        entry.setdefault("medianIncome", 0)
        entry.setdefault("gradRate", 0)
        entry.setdefault("uninsured", 0)

        merged[fips] = entry

    # Log summary of what we got
    sources = []
    if census:
        sources.append(f"Census({len(census)})")
    if crime:
        sources.append(f"Crime({len(crime)})")
    if bls:
        sources.append(f"BLS({len(bls)})")
    if weather:
        sources.append(f"Weather({len(weather)})")
    if fema:
        sources.append(f"FEMA({len(fema)})")
    logger.info(f"Merged data for {len(merged)} states from: {', '.join(sources) or 'no live sources'}")

    if merged:
        cache.set(cache_key, merged, ttl=3600)  # 1 hour for merged data
    return merged


# ============================================================
# HELPERS
# ============================================================

def _int(val) -> int:
    """Safely parse an int from API response (may be string or None)."""
    try:
        return int(float(val))
    except (TypeError, ValueError):
        return 0


def _float(val) -> float | None:
    """Safely parse a float from API response."""
    try:
        return round(float(val), 1)
    except (TypeError, ValueError):
        return None


def _estimate_aqi(entry: dict) -> int:
    """
    Rough AQI estimate based on temperature and precipitation.
    This is a crude heuristic — replace with AirNow API when key is available.
    Hot + dry states tend to have worse air quality.
    """
    temp = entry.get("avgTemp", 55)
    precip = entry.get("precip", 30)

    # Base AQI from temperature (hotter = worse)
    temp_factor = max(0, (temp - 40) * 0.5)
    # Precipitation helps (more rain = cleaner air)
    precip_factor = max(0, (60 - precip) * 0.3)

    aqi = int(25 + temp_factor + precip_factor)
    return max(15, min(75, aqi))  # clamp to realistic range
