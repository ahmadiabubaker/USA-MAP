/**
 * USA Data Map — Main Application
 * Interactive multi-layered data visualization map of the United States.
 *
 * Stack: MapLibre GL JS + D3.js + Vanilla JS
 */

// ============================================================
// STATE DATA — Realistic sample data for all 50 states + DC
// ============================================================

let STATE_DATA = null; // Will be populated by the backend API


// ============================================================
// LAYER / METRIC DEFINITIONS
// ============================================================

const LAYERS = {
    demographics: {
        label: "Demographics",
        icon: "👥",
        metrics: {
            population: { label: "Population", format: "number", colorScale: ["#1a1a4e", "#1e3a5f", "#1e5f8a", "#2589b5", "#60a5fa", "#93c5fd"] },
            density: { label: "Population Density", suffix: "/mi²", format: "decimal", colorScale: ["#1a1a4e", "#1e3a5f", "#2563eb", "#60a5fa", "#93c5fd", "#dbeafe"] },
            growth: { label: "Growth Rate", suffix: "%", format: "percent", colorScale: ["#7f1d1d", "#991b1b", "#6b7280", "#166534", "#22c55e", "#86efac"] },
        }
    },
    crime: {
        label: "Crime",
        icon: "🔫",
        metrics: {
            crimeRate: { label: "Violent Crime Rate", suffix: "/100K", format: "decimal", colorScale: ["#fef3c7", "#fde68a", "#fbbf24", "#f59e0b", "#d97706", "#92400e"] },
            propertyCrime: { label: "Property Crime Rate", suffix: "/100K", format: "decimal", colorScale: ["#fff7ed", "#fed7aa", "#fdba74", "#fb923c", "#ea580c", "#9a3412"] },
        }
    },
    economics: {
        label: "Economics",
        icon: "💰",
        metrics: {
            medianIncome: { label: "Median Income", prefix: "$", format: "number", colorScale: ["#14532d", "#166534", "#15803d", "#22c55e", "#4ade80", "#86efac"] },
            unemployment: { label: "Unemployment Rate", suffix: "%", format: "percent", colorScale: ["#86efac", "#4ade80", "#f59e0b", "#ef4444", "#991b1b", "#7f1d1d"] },
            costOfLiving: { label: "Cost of Living Index", format: "decimal", colorScale: ["#dbeafe", "#93c5fd", "#60a5fa", "#f59e0b", "#ef4444", "#991b1b"] },
        }
    },
    weather: {
        label: "Weather",
        icon: "🌦️",
        metrics: {
            avgTemp: { label: "Avg Temperature", suffix: "°F", format: "decimal", colorScale: ["#1e3a8a", "#2563eb", "#60a5fa", "#fbbf24", "#f97316", "#dc2626"] },
            precip: { label: "Annual Precipitation", suffix: '"', format: "decimal", colorScale: ["#fef3c7", "#bae6fd", "#7dd3fc", "#38bdf8", "#0284c7", "#075985"] },
        }
    },
    education: {
        label: "Education",
        icon: "🏫",
        metrics: {
            gradRate: { label: "Graduation Rate", suffix: "%", format: "percent", colorScale: ["#581c87", "#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#e9d5ff"] },
            perPupil: { label: "Per-Pupil Spending", prefix: "$", format: "number", colorScale: ["#4a1d6e", "#5b21b6", "#7c3aed", "#a78bfa", "#c4b5fd", "#ede9fe"] },
        }
    },
    healthcare: {
        label: "Healthcare",
        icon: "🏥",
        metrics: {
            uninsured: { label: "Uninsured Rate", suffix: "%", format: "percent", colorScale: ["#d1fae5", "#6ee7b7", "#f59e0b", "#ef4444", "#991b1b", "#7f1d1d"] },
        }
    },
    environment: {
        label: "Air Quality",
        icon: "🌿",
        metrics: {
            aqi: { label: "Avg AQI", format: "decimal", colorScale: ["#22c55e", "#84cc16", "#eab308", "#f97316", "#ef4444", "#991b1b"] },
        }
    },
    disasters: {
        label: "Disasters",
        icon: "🌪️",
        metrics: {
            disasters: { label: "Disaster Declarations", suffix: " (5yr)", format: "number", colorScale: ["#fefce8", "#fde68a", "#fbbf24", "#f59e0b", "#d97706", "#92400e"] },
        }
    },
    infrastructure: {
        label: "Infrastructure",
        icon: "🌐",
        metrics: {
            broadband: { label: "Broadband Coverage", suffix: "%", format: "percent", colorScale: ["#0c4a6e", "#0369a1", "#0284c7", "#0ea5e9", "#38bdf8", "#7dd3fc"] },
        }
    },
    overall: {
        label: "Overall Score",
        icon: "⭐",
        metrics: {
            qolScore: { label: "Quality of Life Score", suffix: "/100", format: "decimal", colorScale: ["#4c1d95", "#6d28d9", "#7c3aed", "#2563eb", "#059669", "#10b981"] },
        }
    },
};


// ============================================================
// APP STATE
// ============================================================

const appState = {
    map: null,
    geojson: null,
    activeLayer: "demographics",
    activeMetric: "population",
    selectedState: null,
    hoveredState: null,
    isLayerPanelCollapsed: false,
    tooltip: null,
    compareMode: false,
    compareStates: [],       // array of FIPS codes for compare mode
    trendCache: {},          // cache trend data so it's stable per state/metric
};


// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
    await fetchStateData();
    computeQoLScores();   // ← inject overall score into STATE_DATA
    initMap();
    initEventListeners();
});

async function fetchStateData() {
    // ── Environment detection ──────────────────────────────────────
    // On GitHub Pages (or any static host) there is no backend.
    // We load the pre-generated states.json instead.
    // In local dev (localhost / 127.0.0.1) we hit the FastAPI server.
    const isLocalDev = ["localhost", "127.0.0.1"].includes(location.hostname);
    const DATA_URL   = isLocalDev
        ? "http://127.0.0.1:8000/api/data/all"
        : "./data/states.json";

    try {
        const response = await fetch(DATA_URL);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();

        // Both the API response and states.json use the same shape:
        // { status?: "ok", data: { [fips]: {...} } }
        if (json.data) {
            STATE_DATA = json.data;
        } else {
            throw new Error("Unexpected response shape");
        }
    } catch (err) {
        console.error("Failed to fetch state data:", err);
        const subtitle = document.querySelector(".loading-subtitle");
        if (subtitle) {
            subtitle.textContent = isLocalDev
                ? "Failed to load data. Is the backend running? (python -m uvicorn app.main:app)"
                : "Failed to load data. The data file may not have been generated yet.";
            subtitle.style.color = "#f43f5e";
        }
        STATE_DATA = {};
    }
}

// ============================================================
// QUALITY OF LIFE SCORE — Weighted composite formula
// ============================================================

/**
 * Weights and direction for each metric.
 * direction: 'asc'  → higher raw value = better score
 *            'desc' → lower raw value  = better score
 */
const QOL_COMPONENTS = [
    { key: "medianIncome",  label: "Median Income",       icon: "💰", weight: 0.18, direction: "asc"  },
    { key: "crimeRate",    label: "Violent Crime",        icon: "🔫", weight: 0.18, direction: "desc" },
    { key: "gradRate",     label: "Graduation Rate",      icon: "🏫", weight: 0.14, direction: "asc"  },
    { key: "uninsured",    label: "Uninsured Rate",       icon: "🏥", weight: 0.12, direction: "desc" },
    { key: "unemployment", label: "Unemployment",         icon: "📉", weight: 0.12, direction: "desc" },
    { key: "costOfLiving", label: "Cost of Living",       icon: "🏠", weight: 0.10, direction: "desc" },
    { key: "aqi",          label: "Air Quality (AQI)",    icon: "🌿", weight: 0.07, direction: "desc" },
    { key: "disasters",    label: "Disaster Risk",        icon: "🌪️", weight: 0.05, direction: "desc" },
    { key: "broadband",    label: "Broadband Coverage",   icon: "🌐", weight: 0.04, direction: "asc"  },
];

function computeQoLScores() {
    if (!STATE_DATA || Object.keys(STATE_DATA).length === 0) return;

    const fipsList = Object.keys(STATE_DATA);

    // Pre-compute min/max for each component
    const ranges = {};
    QOL_COMPONENTS.forEach(({ key }) => {
        const values = fipsList.map(f => STATE_DATA[f][key] ?? 0).filter(v => v > 0);
        ranges[key] = {
            min: Math.min(...values),
            max: Math.max(...values),
        };
    });

    // Compute score for each state
    fipsList.forEach(fips => {
        const d = STATE_DATA[fips];
        let totalScore = 0;
        const componentScores = {};

        QOL_COMPONENTS.forEach(({ key, weight, direction }) => {
            const val = d[key] ?? 0;
            const { min, max } = ranges[key];
            const span = max - min || 1;

            // Normalize 0 → 1
            let normalized = (val - min) / span;

            // Flip if lower = better
            if (direction === "desc") normalized = 1 - normalized;

            // Clamp to [0, 1]
            normalized = Math.max(0, Math.min(1, normalized));

            componentScores[key] = Math.round(normalized * 100);
            totalScore += normalized * weight;
        });

        d.qolScore = Math.round(totalScore * 100);
        d._qolComponents = componentScores;
    });

    // Rank all states by score
    const ranked = [...fipsList].sort((a, b) => STATE_DATA[b].qolScore - STATE_DATA[a].qolScore);
    ranked.forEach((fips, i) => {
        STATE_DATA[fips]._qolRank = i + 1;
    });

    console.log("QoL scores computed. Top 5:",
        ranked.slice(0, 5).map(f => `${STATE_DATA[f].abbr}: ${STATE_DATA[f].qolScore}`).join(", ")
    );
}


// ============================================================
// MAP INITIALIZATION
// ============================================================

function initMap() {
    appState.map = new maplibregl.Map({
        container: "map",
        style: {
            version: 8,
            name: "Dark Basemap",
            sources: {
                "carto-dark": {
                    type: "raster",
                    tiles: [
                        "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
                        "https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
                        "https://c.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
                    ],
                    tileSize: 256,
                    attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
                },
            },
            layers: [
                {
                    id: "carto-dark-layer",
                    type: "raster",
                    source: "carto-dark",
                    minzoom: 0,
                    maxzoom: 19,
                    paint: {
                        "raster-opacity": 0.6,
                        "raster-saturation": -0.3,
                    },
                },
            ],
        },
        center: [-98.5, 39.5],
        zoom: 3.8,
        minZoom: 2,
        maxZoom: 12,
        maxBounds: [[-180, 10], [-50, 75]],
        attributionControl: true,
    });

    // Add zoom controls
    appState.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    // Create tooltip element
    appState.tooltip = document.createElement("div");
    appState.tooltip.className = "map-tooltip";
    appState.tooltip.innerHTML = `
        <div class="map-tooltip-name"></div>
        <div class="map-tooltip-value"></div>
    `;
    document.querySelector(".map-wrapper").appendChild(appState.tooltip);

    // On map load
    appState.map.on("load", async () => {
        await loadGeoJSON();
        addMapLayers();
        updateChoropleth();
        setupMapInteractions();
        hideLoadingScreen();
    });

    // Update zoom display
    appState.map.on("zoom", () => {
        const zoom = appState.map.getZoom().toFixed(1);
        document.getElementById("zoom-display").textContent = `${zoom}x`;
    });
}


// ============================================================
// GEOJSON LOADING
// ============================================================

async function loadGeoJSON() {
    try {
        const response = await fetch("https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json");
        const topology = await response.json();
        appState.geojson = topojson.feature(topology, topology.objects.states);

        // Merge our data into the GeoJSON features
        appState.geojson.features.forEach((feature) => {
            const fips = feature.id;
            const data = STATE_DATA[fips];
            if (data) {
                feature.properties = { ...feature.properties, ...data, fips };
            }
        });

        // Filter out territories (keep only states + DC we have data for)
        appState.geojson.features = appState.geojson.features.filter(
            (f) => STATE_DATA[f.id]
        );
    } catch (err) {
        console.error("Failed to load GeoJSON:", err);
        // Show error on loading screen
        const subtitle = document.querySelector(".loading-subtitle");
        if (subtitle) {
            subtitle.textContent = "Failed to load map data. Please refresh.";
            subtitle.style.color = "#f43f5e";
        }
    }
}


// ============================================================
// MAP LAYERS
// ============================================================

function addMapLayers() {
    appState.map.addSource("states", {
        type: "geojson",
        data: appState.geojson,
        generateId: true,
    });

    // Choropleth fill layer
    appState.map.addLayer({
        id: "states-fill",
        type: "fill",
        source: "states",
        paint: {
            "fill-color": "#1e3a5f",
            "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.9,
                0.75,
            ],
        },
    });

    // State borders
    appState.map.addLayer({
        id: "states-border",
        type: "line",
        source: "states",
        paint: {
            "line-color": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                "#6366f1",
                ["boolean", ["feature-state", "hover"], false],
                "rgba(255, 255, 255, 0.5)",
                "rgba(255, 255, 255, 0.12)",
            ],
            "line-width": [
                "case",
                ["boolean", ["feature-state", "selected"], false],
                2.5,
                ["boolean", ["feature-state", "hover"], false],
                1.5,
                0.5,
            ],
        },
    });

    // Labels layer (using CartoDB labels)
    appState.map.addSource("carto-labels", {
        type: "raster",
        tiles: [
            "https://a.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png",
            "https://b.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}@2x.png",
        ],
        tileSize: 256,
    });

    appState.map.addLayer({
        id: "carto-labels-layer",
        type: "raster",
        source: "carto-labels",
        paint: {
            "raster-opacity": 0.7,
        },
    });
}


// ============================================================
// CHOROPLETH COLORING
// ============================================================

function updateChoropleth() {
    if (!appState.map.getSource("states")) return;

    const layerDef = LAYERS[appState.activeLayer];
    const metricDef = layerDef.metrics[appState.activeMetric];
    const colors = metricDef.colorScale;

    // Get min/max values for the active metric
    const values = Object.values(STATE_DATA).map((d) => d[appState.activeMetric]);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);

    // Build a match expression to color each state
    const matchExpr = ["match", ["get", "fips"]];

    Object.entries(STATE_DATA).forEach(([fips, data]) => {
        const value = data[appState.activeMetric];
        const normalized = (value - minVal) / (maxVal - minVal || 1);
        const colorIndex = Math.min(
            Math.floor(normalized * colors.length),
            colors.length - 1
        );
        matchExpr.push(fips, colors[colorIndex]);
    });

    matchExpr.push("#1e293b"); // default/fallback color

    appState.map.setPaintProperty("states-fill", "fill-color", matchExpr);

    // Update legend
    updateLegend(metricDef, minVal, maxVal);

    // Update metric selector options
    updateMetricSelector();
}

function updateLegend(metricDef, minVal, maxVal) {
    const gradient = document.getElementById("legend-gradient");
    const minLabel = document.getElementById("legend-min");
    const maxLabel = document.getElementById("legend-max");

    const colors = metricDef.colorScale;
    gradient.style.background = `linear-gradient(90deg, ${colors.join(", ")})`;

    minLabel.textContent = formatValue(minVal, metricDef);
    maxLabel.textContent = formatValue(maxVal, metricDef);
}

function updateMetricSelector() {
    const select = document.getElementById("metric-select");
    const layerDef = LAYERS[appState.activeLayer];

    select.innerHTML = "";
    Object.entries(layerDef.metrics).forEach(([key, def]) => {
        const option = document.createElement("option");
        option.value = key;
        option.textContent = def.label;
        if (key === appState.activeMetric) option.selected = true;
        select.appendChild(option);
    });
}


// ============================================================
// MAP INTERACTIONS
// ============================================================

function setupMapInteractions() {
    const map = appState.map;
    let hoveredId = null;

    // Hover — highlight + tooltip
    map.on("mousemove", "states-fill", (e) => {
        if (e.features.length === 0) return;

        map.getCanvas().style.cursor = "pointer";

        const feature = e.features[0];
        const featureId = feature.id;

        // Update hover state
        if (hoveredId !== null && hoveredId !== featureId) {
            map.setFeatureState({ source: "states", id: hoveredId }, { hover: false });
        }
        hoveredId = featureId;
        map.setFeatureState({ source: "states", id: hoveredId }, { hover: true });

        // Update tooltip
        const data = STATE_DATA[feature.properties.fips];
        if (data) {
            const metricDef = LAYERS[appState.activeLayer].metrics[appState.activeMetric];
            const value = data[appState.activeMetric];

            appState.tooltip.querySelector(".map-tooltip-name").textContent = data.name;
            appState.tooltip.querySelector(".map-tooltip-value").textContent =
                `${metricDef.label}: ${formatValue(value, metricDef)}`;

            appState.tooltip.style.left = `${e.point.x}px`;
            appState.tooltip.style.top = `${e.point.y}px`;
            appState.tooltip.classList.add("visible");

            // Update bottom bar hover info
            document.getElementById("hover-info").textContent =
                `${data.name} (${data.abbr})`;
        }
    });

    // Mouse leave — remove hover
    map.on("mouseleave", "states-fill", () => {
        map.getCanvas().style.cursor = "";
        if (hoveredId !== null) {
            map.setFeatureState({ source: "states", id: hoveredId }, { hover: false });
            hoveredId = null;
        }
        appState.tooltip.classList.remove("visible");
        document.getElementById("hover-info").textContent = "";
    });

    // Click — select state + show detail panel
    map.on("click", "states-fill", (e) => {
        if (e.features.length === 0) return;

        const feature = e.features[0];
        const fips = feature.properties.fips;

        if (appState.compareMode) {
            toggleCompareState(fips, feature);
        } else {
            selectState(fips, feature);
        }
    });

    // Click outside states — deselect
    map.on("click", (e) => {
        const features = map.queryRenderedFeatures(e.point, {
            layers: ["states-fill"],
        });
        if (features.length === 0 && !appState.compareMode) {
            deselectState();
        }
    });
}

function selectState(fips, feature) {
    const map = appState.map;
    const data = STATE_DATA[fips];
    if (!data) return;

    // Clear previous selection
    if (appState.selectedState !== null) {
        const features = appState.geojson.features;
        features.forEach((f, i) => {
            map.setFeatureState({ source: "states", id: i }, { selected: false });
        });
    }

    // Set new selection
    if (feature) {
        map.setFeatureState(
            { source: "states", id: feature.id },
            { selected: true }
        );
    }

    appState.selectedState = fips;

    // Fly to state
    if (feature) {
        const bounds = getBoundsForFeature(feature);
        map.fitBounds(bounds, {
            padding: {
                top: 60,
                bottom: 60,
                left: appState.isLayerPanelCollapsed ? 60 : 260,
                right: 400,
            },
            maxZoom: 7,
            duration: 1200,
        });
    }

    // Update breadcrumb
    document.getElementById("breadcrumb-content").textContent =
        `United States › ${data.name}`;

    // Show detail panel
    showDetailPanel(data);
}

function deselectState() {
    const map = appState.map;

    if (appState.selectedState !== null) {
        appState.geojson.features.forEach((f, i) => {
            map.setFeatureState({ source: "states", id: i }, { selected: false });
        });
    }

    appState.selectedState = null;

    // Reset view
    map.flyTo({
        center: [-98.5, 39.5],
        zoom: 3.8,
        duration: 1000,
    });

    document.getElementById("breadcrumb-content").textContent = "United States";

    // Hide detail panel
    document.getElementById("detail-panel").classList.add("hidden");
}

function getBoundsForFeature(feature) {
    const coordinates = [];

    function extractCoords(geometry) {
        if (geometry.type === "Polygon") {
            geometry.coordinates.forEach((ring) =>
                ring.forEach((coord) => coordinates.push(coord))
            );
        } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates.forEach((polygon) =>
                polygon.forEach((ring) =>
                    ring.forEach((coord) => coordinates.push(coord))
                )
            );
        }
    }

    extractCoords(feature.geometry);

    const lngs = coordinates.map((c) => c[0]);
    const lats = coordinates.map((c) => c[1]);

    return [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
    ];
}


// ============================================================
// DETAIL PANEL
// ============================================================

function showDetailPanel(data) {
    const panel = document.getElementById("detail-panel");
    panel.classList.remove("hidden");

    // Title
    document.getElementById("detail-title").textContent = data.name;
    const fipsCode = Object.keys(STATE_DATA).find((k) => STATE_DATA[k] === data);
    document.getElementById("detail-subtitle").textContent =
        `${data.abbr} · FIPS: ${fipsCode}`;

    // Stats grid
    const statsContainer = document.getElementById("detail-stats");
    const layerDef = LAYERS[appState.activeLayer];

    // Reset stagger animation
    statsContainer.classList.remove("stagger-in");

    let statsHTML = "";

    // Always show population first
    statsHTML += buildStatCard("Population", formatNumber(data.population), `${data.growth > 0 ? "+" : ""}${data.growth}%`, data.growth >= 0);

    // Show metrics for the active layer
    Object.entries(layerDef.metrics).forEach(([key, def]) => {
        const value = data[key];
        statsHTML += buildStatCard(def.label, formatValue(value, def));
    });

    // Add a few cross-layer highlights
    if (appState.activeLayer !== "economics") {
        statsHTML += buildStatCard("Median Income", `$${formatNumber(data.medianIncome)}`);
    }
    if (appState.activeLayer !== "demographics") {
        statsHTML += buildStatCard("Density", `${data.density.toLocaleString()}/mi²`);
    }

    statsContainer.innerHTML = statsHTML;

    // Re-trigger stagger animation
    requestAnimationFrame(() => {
        statsContainer.classList.add("stagger-in");
    });

    // Chart
    renderDetailChart(data);

    // Breakdown
    renderDetailBreakdown(data);
}

function buildStatCard(label, value, change, isPositive) {
    let changeHTML = "";
    if (change !== undefined) {
        const cls = isPositive ? "positive" : "negative";
        const arrow = isPositive ? "↑" : "↓";
        changeHTML = `<div class="stat-change ${cls}">${arrow} ${change}</div>`;
    }
    return `
        <div class="stat-card">
            <div class="stat-label">${label}</div>
            <div class="stat-value">${value}</div>
            ${changeHTML}
        </div>
    `;
}


// ============================================================
// D3 CHARTS
// ============================================================

function renderDetailChart(data) {
    const container = document.getElementById("detail-chart");
    container.innerHTML = `
        <div class="chart-title">5-Year Trend — ${LAYERS[appState.activeLayer].metrics[appState.activeMetric].label}</div>
        <div class="chart-container" id="trend-chart"></div>
    `;

    const chartEl = document.getElementById("trend-chart");
    const width = chartEl.clientWidth || 300;
    const height = 160;
    const margin = { top: 10, right: 16, bottom: 28, left: 48 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    // Generate synthetic trend data (cached per state+metric)
    const currentValue = data[appState.activeMetric];
    const cacheKey = `${data.abbr}_${appState.activeMetric}`;
    if (!appState.trendCache[cacheKey]) {
        appState.trendCache[cacheKey] = generateTrendData(currentValue, 5);
    }
    const trendData = appState.trendCache[cacheKey];

    const svg = d3
        .select("#trend-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleLinear().domain([0, trendData.length - 1]).range([0, innerW]);
    const yExtent = d3.extent(trendData, (d) => d.value);
    const yPad = (yExtent[1] - yExtent[0]) * 0.15 || 1;
    const y = d3
        .scaleLinear()
        .domain([yExtent[0] - yPad, yExtent[1] + yPad])
        .range([innerH, 0]);

    // Grid lines
    g.append("g")
        .attr("class", "grid")
        .selectAll("line")
        .data(y.ticks(4))
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("x2", innerW)
        .attr("y1", (d) => y(d))
        .attr("y2", (d) => y(d))
        .attr("stroke", "rgba(255,255,255,0.05)")
        .attr("stroke-dasharray", "3,3");

    // Gradient for area
    const gradientId = "chart-gradient-" + Date.now();
    const defs = svg.append("defs");
    const gradient = defs
        .append("linearGradient")
        .attr("id", gradientId)
        .attr("x1", "0")
        .attr("y1", "0")
        .attr("x2", "0")
        .attr("y2", "1");
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.3);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#6366f1").attr("stop-opacity", 0.02);

    // Area
    const area = d3
        .area()
        .x((d, i) => x(i))
        .y0(innerH)
        .y1((d) => y(d.value))
        .curve(d3.curveMonotoneX);

    g.append("path")
        .datum(trendData)
        .attr("d", area)
        .attr("fill", `url(#${gradientId})`)
        .attr("opacity", 0)
        .transition()
        .duration(800)
        .attr("opacity", 1);

    // Line
    const line = d3
        .line()
        .x((d, i) => x(i))
        .y((d) => y(d.value))
        .curve(d3.curveMonotoneX);

    const path = g
        .append("path")
        .datum(trendData)
        .attr("d", line)
        .attr("fill", "none")
        .attr("stroke", "#6366f1")
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round");

    // Animate line drawing
    const totalLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", `${totalLength} ${totalLength}`)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(1200)
        .ease(d3.easeCubicOut)
        .attr("stroke-dashoffset", 0);

    // Dots
    g.selectAll(".dot")
        .data(trendData)
        .enter()
        .append("circle")
        .attr("cx", (d, i) => x(i))
        .attr("cy", (d) => y(d.value))
        .attr("r", 0)
        .attr("fill", "#6366f1")
        .attr("stroke", "#0a0e1a")
        .attr("stroke-width", 2)
        .transition()
        .delay((d, i) => 300 + i * 120)
        .duration(400)
        .attr("r", 4);

    // X-axis labels (years)
    const currentYear = new Date().getFullYear();
    g.selectAll(".x-label")
        .data(trendData)
        .enter()
        .append("text")
        .attr("x", (d, i) => x(i))
        .attr("y", innerH + 20)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(148, 163, 184, 0.6)")
        .attr("font-size", "10px")
        .attr("font-family", "Inter, sans-serif")
        .text((d, i) => currentYear - (trendData.length - 1 - i));

    // Y-axis labels
    g.selectAll(".y-label")
        .data(y.ticks(4))
        .enter()
        .append("text")
        .attr("x", -8)
        .attr("y", (d) => y(d))
        .attr("text-anchor", "end")
        .attr("dominant-baseline", "middle")
        .attr("fill", "rgba(148, 163, 184, 0.5)")
        .attr("font-size", "9px")
        .attr("font-family", "'JetBrains Mono', monospace")
        .text((d) => abbreviateNumber(d));
}

function generateTrendData(currentValue, years) {
    const data = [];
    // Generate realistic-looking trend working backwards from current value
    let val = currentValue;
    const points = [val];
    for (let i = 1; i < years; i++) {
        const change = (Math.random() - 0.45) * currentValue * 0.06;
        val = val - change;
        points.unshift(val);
    }
    points.forEach((v, i) => {
        data.push({ year: new Date().getFullYear() - (years - 1 - i), value: v });
    });
    return data;
}


// ============================================================
// DETAIL BREAKDOWN
// ============================================================

function renderDetailBreakdown(data) {
    const container = document.getElementById("detail-breakdown");

    // ── Special case: Overall Score layer ──────────────────────
    if (appState.activeLayer === "overall" && data._qolComponents) {
        const rank = data._qolRank;
        const total = Object.keys(STATE_DATA).length;
        const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`;

        let html = `
            <div class="breakdown-title">Score Breakdown <span style="float:right;font-size:0.75rem;color:var(--text-tertiary)">${medal} of ${total} states</span></div>
            <div class="qol-score-hero">
                <div class="qol-score-ring" style="--score: ${data.qolScore}">
                    <svg viewBox="0 0 80 80" width="80" height="80">
                        <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="7"/>
                        <circle cx="40" cy="40" r="34" fill="none"
                            stroke="url(#qolGrad)" stroke-width="7"
                            stroke-linecap="round"
                            stroke-dasharray="${Math.round(2 * Math.PI * 34)}"
                            stroke-dashoffset="${Math.round(2 * Math.PI * 34 * (1 - data.qolScore / 100))}"
                            transform="rotate(-90 40 40)"/>
                        <defs>
                            <linearGradient id="qolGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stop-color="#6366f1"/>
                                <stop offset="100%" stop-color="#10b981"/>
                            </linearGradient>
                        </defs>
                        <text x="40" y="44" text-anchor="middle" font-size="18" font-weight="700" fill="#f1f5f9" font-family="Inter,sans-serif">${data.qolScore}</text>
                    </svg>
                </div>
                <div class="qol-score-label">Quality of Life Score</div>
            </div>
        `;

        QOL_COMPONENTS.forEach(({ key, label, icon, weight }) => {
            const compScore = data._qolComponents[key] ?? 0;
            const color = compScore >= 70 ? "#10b981" : compScore >= 45 ? "#f59e0b" : "#ef4444";
            html += `
                <div class="breakdown-row">
                    <span class="breakdown-label">${icon} ${label}</span>
                    <div class="breakdown-bar-track">
                        <div class="breakdown-bar-fill" style="width: ${compScore}%; background: ${color};"></div>
                    </div>
                    <span class="breakdown-value" style="color:${color}">${compScore}</span>
                </div>
                <div style="font-size:0.65rem;color:var(--text-tertiary);text-align:right;margin:-4px 0 6px;padding-right:2px">weight: ${Math.round(weight * 100)}%</div>
            `;
        });

        container.innerHTML = html;
        requestAnimationFrame(() => {
            container.querySelectorAll(".breakdown-bar-fill").forEach((bar) => {
                const w = bar.style.width;
                bar.style.width = "0%";
                requestAnimationFrame(() => { bar.style.width = w; });
            });
        });
        return;
    }

    // ── Default: Quick Overview bars ───────────────────────────
    const breakdownItems = [
        { label: "Broadband Coverage", value: data.broadband, max: 100, color: "#06b6d4" },
        { label: "Graduation Rate", value: data.gradRate, max: 100, color: "#a855f7" },
        { label: "Cost of Living", value: data.costOfLiving, max: 200, color: "#f59e0b" },
        { label: "Air Quality (AQI)", value: data.aqi, max: 100, color: data.aqi < 40 ? "#22c55e" : data.aqi < 55 ? "#eab308" : "#ef4444" },
    ];

    let html = `<div class="breakdown-title">Quick Overview</div>`;
    breakdownItems.forEach((item) => {
        const pct = Math.min((item.value / item.max) * 100, 100);
        html += `
            <div class="breakdown-row">
                <span class="breakdown-label">${item.label}</span>
                <div class="breakdown-bar-track">
                    <div class="breakdown-bar-fill" style="width: ${pct}%; background: ${item.color};"></div>
                </div>
                <span class="breakdown-value">${item.value}${item.label.includes("Rate") || item.label.includes("Coverage") ? "%" : ""}</span>
            </div>
        `;
    });

    container.innerHTML = html;

    // Trigger bar animations
    requestAnimationFrame(() => {
        container.querySelectorAll(".breakdown-bar-fill").forEach((bar) => {
            const w = bar.style.width;
            bar.style.width = "0%";
            requestAnimationFrame(() => {
                bar.style.width = w;
            });
        });
    });
}


// ============================================================
// COMPARE MODE
// ============================================================

function toggleCompareMode() {
    appState.compareMode = !appState.compareMode;
    const btn = document.getElementById("btn-compare");

    if (appState.compareMode) {
        btn.classList.add("active");
        btn.title = "Compare Mode (ON) — Click states to compare";
        appState.compareStates = [];

        // If a state is already selected, add it to compare
        if (appState.selectedState) {
            appState.compareStates.push(appState.selectedState);
        }

        // Update breadcrumb
        document.getElementById("breadcrumb-content").textContent =
            "Compare Mode — Click states to add";

        // Show compare panel hint
        showComparePanel();
    } else {
        btn.classList.remove("active");
        btn.title = "Compare Mode";
        appState.compareStates = [];

        // Clear all selections
        if (appState.geojson) {
            appState.geojson.features.forEach((f, i) => {
                appState.map.setFeatureState({ source: "states", id: i }, { selected: false });
            });
        }

        document.getElementById("breadcrumb-content").textContent = "United States";
        document.getElementById("detail-panel").classList.add("hidden");
    }
}

function toggleCompareState(fips, feature) {
    const idx = appState.compareStates.indexOf(fips);

    if (idx > -1) {
        // Remove from compare
        appState.compareStates.splice(idx, 1);
        if (feature) {
            appState.map.setFeatureState({ source: "states", id: feature.id }, { selected: false });
        }
    } else {
        // Add to compare (max 4)
        if (appState.compareStates.length >= 4) {
            // Remove the oldest
            const oldFips = appState.compareStates.shift();
            const oldFeature = appState.geojson.features.find(f => f.properties.fips === oldFips);
            if (oldFeature) {
                const oldIdx = appState.geojson.features.indexOf(oldFeature);
                appState.map.setFeatureState({ source: "states", id: oldIdx }, { selected: false });
            }
        }
        appState.compareStates.push(fips);
        if (feature) {
            appState.map.setFeatureState({ source: "states", id: feature.id }, { selected: true });
        }
    }

    // Update breadcrumb
    const names = appState.compareStates.map(f => STATE_DATA[f]?.abbr || f).join(" vs ");
    document.getElementById("breadcrumb-content").textContent =
        appState.compareStates.length > 0
            ? `Comparing: ${names}`
            : "Compare Mode — Click states to add";

    showComparePanel();
}

function showComparePanel() {
    const panel = document.getElementById("detail-panel");

    if (appState.compareStates.length === 0) {
        panel.classList.remove("hidden");
        document.getElementById("detail-title").textContent = "Compare Mode";
        document.getElementById("detail-subtitle").textContent = "Click up to 4 states to compare";
        document.getElementById("detail-stats").innerHTML = `
            <div class="compare-hint">
                <div style="text-align:center; padding: 2rem 1rem; color: var(--text-tertiary);">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 0.75rem; opacity: 0.5;">
                        <rect x="2" y="3" width="8" height="18" rx="2"/><rect x="14" y="3" width="8" height="18" rx="2"/>
                    </svg>
                    <p style="font-size: 0.8125rem;">Click on states to add them<br>to the comparison</p>
                </div>
            </div>
        `;
        document.getElementById("detail-chart").innerHTML = "";
        document.getElementById("detail-breakdown").innerHTML = "";
        return;
    }

    panel.classList.remove("hidden");

    const stateNames = appState.compareStates.map(f => STATE_DATA[f]?.name).filter(Boolean);
    document.getElementById("detail-title").textContent = "State Comparison";
    document.getElementById("detail-subtitle").textContent = stateNames.join(" · ");

    // Build comparison table
    const layerDef = LAYERS[appState.activeLayer];
    const allMetrics = [
        { key: "population", label: "Population", format: "number" },
        ...Object.entries(layerDef.metrics).map(([key, def]) => ({ key, label: def.label, ...def })),
    ];

    // Add cross-layer metrics
    if (appState.activeLayer !== "economics") {
        allMetrics.push({ key: "medianIncome", label: "Median Income", prefix: "$", format: "number" });
    }
    if (appState.activeLayer !== "demographics") {
        allMetrics.push({ key: "density", label: "Density", suffix: "/mi²", format: "decimal" });
    }

    let tableHTML = `<div class="compare-table">`;
    tableHTML += `<div class="compare-header-row">`;
    tableHTML += `<div class="compare-metric-cell">Metric</div>`;
    appState.compareStates.forEach(fips => {
        const d = STATE_DATA[fips];
        tableHTML += `<div class="compare-state-cell">${d?.abbr || fips}</div>`;
    });
    tableHTML += `</div>`;

    allMetrics.forEach(metric => {
        // Find best value (highest for most, lowest for crime/unemployment/aqi/uninsured/costOfLiving)
        const invertMetrics = ["crimeRate", "propertyCrime", "violentCrime", "unemployment", "aqi", "uninsured", "costOfLiving", "disasters"];
        const shouldInvert = invertMetrics.includes(metric.key);
        const values = appState.compareStates.map(f => STATE_DATA[f]?.[metric.key] ?? 0);
        const bestVal = shouldInvert ? Math.min(...values) : Math.max(...values);

        tableHTML += `<div class="compare-data-row">`;
        tableHTML += `<div class="compare-metric-cell">${metric.label}</div>`;
        appState.compareStates.forEach(fips => {
            const d = STATE_DATA[fips];
            const val = d?.[metric.key] ?? 0;
            const isBest = val === bestVal && appState.compareStates.length > 1;
            const formattedVal = formatValue(val, metric);
            tableHTML += `<div class="compare-state-cell ${isBest ? 'best' : ''}">${formattedVal}</div>`;
        });
        tableHTML += `</div>`;
    });

    tableHTML += `</div>`;

    document.getElementById("detail-stats").innerHTML = tableHTML;
    document.getElementById("detail-chart").innerHTML = "";
    document.getElementById("detail-breakdown").innerHTML = "";

    // Render comparison bar chart
    renderCompareChart();
}

function renderCompareChart() {
    if (appState.compareStates.length < 2) return;

    const container = document.getElementById("detail-chart");
    const metricDef = LAYERS[appState.activeLayer].metrics[appState.activeMetric];

    container.innerHTML = `
        <div class="chart-title">Comparison — ${metricDef.label}</div>
        <div class="chart-container" id="compare-chart"></div>
    `;

    const chartEl = document.getElementById("compare-chart");
    const width = chartEl.clientWidth || 300;
    const height = 160;
    const margin = { top: 10, right: 16, bottom: 28, left: 8 };
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const barData = appState.compareStates.map(fips => ({
        abbr: STATE_DATA[fips]?.abbr || fips,
        value: STATE_DATA[fips]?.[appState.activeMetric] ?? 0,
    }));

    const svg = d3
        .select("#compare-chart")
        .append("svg")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
        .domain(barData.map(d => d.abbr))
        .range([0, innerW])
        .padding(0.3);

    const y = d3.scaleLinear()
        .domain([0, d3.max(barData, d => d.value) * 1.1])
        .range([innerH, 0]);

    // Bars
    const barColors = ["#6366f1", "#06b6d4", "#f59e0b", "#a855f7"];
    g.selectAll(".bar")
        .data(barData)
        .enter()
        .append("rect")
        .attr("x", d => x(d.abbr))
        .attr("y", innerH)
        .attr("width", x.bandwidth())
        .attr("height", 0)
        .attr("rx", 4)
        .attr("fill", (d, i) => barColors[i % barColors.length])
        .attr("opacity", 0.85)
        .transition()
        .duration(800)
        .delay((d, i) => i * 100)
        .ease(d3.easeCubicOut)
        .attr("y", d => y(d.value))
        .attr("height", d => innerH - y(d.value));

    // Value labels on bars
    g.selectAll(".bar-label")
        .data(barData)
        .enter()
        .append("text")
        .attr("x", d => x(d.abbr) + x.bandwidth() / 2)
        .attr("y", d => y(d.value) - 6)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(241, 245, 249, 0.8)")
        .attr("font-size", "9px")
        .attr("font-family", "'JetBrains Mono', monospace")
        .attr("opacity", 0)
        .text(d => abbreviateNumber(d.value))
        .transition()
        .delay((d, i) => 400 + i * 100)
        .duration(400)
        .attr("opacity", 1);

    // X-axis labels
    g.selectAll(".x-label")
        .data(barData)
        .enter()
        .append("text")
        .attr("x", d => x(d.abbr) + x.bandwidth() / 2)
        .attr("y", innerH + 18)
        .attr("text-anchor", "middle")
        .attr("fill", "rgba(148, 163, 184, 0.7)")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .attr("font-family", "Inter, sans-serif")
        .text(d => d.abbr);
}


// ============================================================
// EVENT LISTENERS
// ============================================================

function initEventListeners() {
    // Layer buttons
    document.querySelectorAll(".layer-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
            const layer = btn.dataset.layer;
            switchLayer(layer);
        });
    });

    // Metric selector
    document.getElementById("metric-select").addEventListener("change", (e) => {
        appState.activeMetric = e.target.value;
        updateChoropleth();
        if (appState.compareMode && appState.compareStates.length > 0) {
            showComparePanel();
        } else if (appState.selectedState) {
            showDetailPanel(STATE_DATA[appState.selectedState]);
        }
    });

    // Collapse/expand layer panel
    document.getElementById("btn-collapse-layers").addEventListener("click", () => {
        toggleLayerPanel(true);
    });

    document.getElementById("btn-expand-layers").addEventListener("click", () => {
        toggleLayerPanel(false);
    });

    // Close detail panel
    document.getElementById("btn-close-detail").addEventListener("click", () => {
        if (appState.compareMode) {
            toggleCompareMode(); // exit compare mode
        } else {
            deselectState();
        }
    });

    // Reset view
    document.getElementById("btn-reset").addEventListener("click", () => {
        if (appState.compareMode) {
            toggleCompareMode();
        }
        deselectState();
    });

    // Compare mode button
    document.getElementById("btn-compare").addEventListener("click", () => {
        toggleCompareMode();
    });

    // Search
    const searchInput = document.getElementById("search-input");
    const searchResults = document.getElementById("search-results");

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.classList.add("hidden");
            return;
        }

        const matches = Object.entries(STATE_DATA)
            .filter(
                ([, data]) =>
                    data.name.toLowerCase().includes(query) ||
                    data.abbr.toLowerCase().includes(query)
            )
            .slice(0, 8);

        if (matches.length === 0) {
            searchResults.innerHTML = `
                <div class="search-result-item" style="cursor: default; opacity: 0.5;">
                    <div>
                        <div class="search-result-name">No results found</div>
                        <div class="search-result-type">Try a different search</div>
                    </div>
                </div>
            `;
            searchResults.classList.remove("hidden");
            return;
        }

        searchResults.innerHTML = matches
            .map(
                ([fips, data]) => `
                <div class="search-result-item" data-fips="${fips}">
                    <div>
                        <div class="search-result-name">${highlightMatch(data.name, query)}</div>
                        <div class="search-result-type">${data.abbr} · State · Pop: ${abbreviateNumber(data.population)}</div>
                    </div>
                </div>
            `
            )
            .join("");

        searchResults.classList.remove("hidden");

        // Click on search result
        searchResults.querySelectorAll(".search-result-item[data-fips]").forEach((item) => {
            item.addEventListener("click", () => {
                const fips = item.dataset.fips;
                const feature = appState.geojson.features.find((f) => f.properties.fips === fips);
                if (appState.compareMode) {
                    toggleCompareState(fips, feature);
                } else {
                    selectState(fips, feature);
                }
                searchInput.value = "";
                searchResults.classList.add("hidden");
            });
        });
    });

    // Close search on blur
    searchInput.addEventListener("blur", () => {
        setTimeout(() => searchResults.classList.add("hidden"), 200);
    });

    // Focus search on click into container
    document.querySelector(".search-container").addEventListener("click", () => {
        searchInput.focus();
    });

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
        // Escape to deselect / close
        if (e.key === "Escape") {
            if (appState.compareMode) {
                toggleCompareMode();
            }
            deselectState();
            searchInput.blur();
            searchResults.classList.add("hidden");
        }

        // / to focus search
        if (e.key === "/" && document.activeElement !== searchInput) {
            e.preventDefault();
            searchInput.focus();
        }

        // C to toggle compare mode
        if (e.key === "c" && document.activeElement !== searchInput) {
            toggleCompareMode();
        }
    });
}

/**
 * Highlight matching substring in search results.
 */
function highlightMatch(text, query) {
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    const before = text.slice(0, idx);
    const match = text.slice(idx, idx + query.length);
    const after = text.slice(idx + query.length);
    return `${before}<span class="search-highlight">${match}</span>${after}`;
}


// ============================================================
// LAYER SWITCHING
// ============================================================

function switchLayer(layerKey) {
    if (!LAYERS[layerKey]) return;

    appState.activeLayer = layerKey;

    // Set the first metric of this layer as active
    const metrics = Object.keys(LAYERS[layerKey].metrics);
    appState.activeMetric = metrics[0];

    // Update active button
    document.querySelectorAll(".layer-btn").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.layer === layerKey);
    });

    // Update choropleth
    updateChoropleth();

    // Update detail panel if a state is selected or in compare mode
    if (appState.compareMode && appState.compareStates.length > 0) {
        showComparePanel();
    } else if (appState.selectedState) {
        showDetailPanel(STATE_DATA[appState.selectedState]);
    }
}


// ============================================================
// PANEL TOGGLING
// ============================================================

function toggleLayerPanel(collapse) {
    appState.isLayerPanelCollapsed = collapse;
    const panel = document.getElementById("layer-panel");
    const expandBtn = document.getElementById("btn-expand-layers");

    if (collapse) {
        panel.classList.add("collapsed");
        expandBtn.classList.remove("hidden");
    } else {
        panel.classList.remove("collapsed");
        expandBtn.classList.add("hidden");
    }
}


// ============================================================
// LOADING SCREEN
// ============================================================

function hideLoadingScreen() {
    const loading = document.getElementById("loading-screen");
    const app = document.getElementById("app");

    setTimeout(() => {
        loading.classList.add("hidden");
        app.classList.add("visible");
    }, 800);
}


// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function formatValue(value, metricDef) {
    if (value == null) return "N/A";

    if (metricDef.format === "number") {
        let str = formatNumber(Math.round(value));
        if (metricDef.prefix) str = metricDef.prefix + str;
        if (metricDef.suffix) str += metricDef.suffix;
        return str;
    }
    if (metricDef.format === "percent") {
        let str = value.toFixed(1);
        if (metricDef.prefix) str = metricDef.prefix + str;
        if (metricDef.suffix) str += metricDef.suffix;
        return str;
    }
    // decimal
    let str = value.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (metricDef.prefix) str = metricDef.prefix + str;
    if (metricDef.suffix) str += metricDef.suffix;
    return str;
}

function formatNumber(num) {
    return num.toLocaleString();
}

function abbreviateNumber(num) {
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(0) + "K";
    if (num >= 100) return Math.round(num).toString();
    return num.toFixed(1);
}
