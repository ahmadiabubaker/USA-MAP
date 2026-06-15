# 🗺️ USA Data Map

An interactive, multi-layered data visualization map of the United States. Explore and compare real data across states and counties — crime, weather, education, economics, health, environment, natural disasters, and more.

![Status](https://img.shields.io/badge/status-in%20development-yellow)
![License](https://img.shields.io/badge/license-MIT-blue)
![Python](https://img.shields.io/badge/python-3.14-blue)

---

## ✨ Features

- **Interactive Map** — Click any state to drill into counties, hover for quick stats
- **Multiple Data Layers** — Toggle between crime, weather, education, economics, and more
- **Choropleth Heatmaps** — Color-coded regions based on selected metrics
- **Historical Trends** — Animated 5-year trend charts (D3.js)
- **Compare Mode** — Select multiple states for side-by-side comparison
- **Search** — Find any state by name or abbreviation
- **Dark Mode** — Sleek, modern dark-themed interface with glassmorphism
- **Responsive** — Works on desktop, tablet, and mobile

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Backend** | FastAPI (Python) | Async, fast, auto-docs, great for API proxying |
| **Map Engine** | MapLibre GL JS | WebGL-powered, open-source, fast vector rendering |
| **Data Viz** | D3.js | Custom charts, sparklines, trend visualizations |
| **Frontend** | Vanilla HTML/CSS/JS | Zero dependencies, full control, served by FastAPI |
| **Database** | SQLite (→ PostgreSQL later) | Lightweight start, caching API data, storing snapshots |
| **ORM** | SQLAlchemy | Python-standard database access |

---

## 📊 Data Layers

| Layer | What it covers |
|-------|---------------|
| 👥 **Demographics** | Population, density, growth rate |
| 🔫 **Crime** | Violent crime rate, property crime rate |
| 💰 **Economics** | Median income, unemployment, cost of living |
| 🌦️ **Weather** | Average temperature, annual precipitation |
| 🏫 **Education** | Graduation rate, per-pupil spending |
| 🏥 **Healthcare** | Uninsured rate |
| 🌿 **Air Quality** | Average AQI |
| 🌪️ **Disasters** | FEMA disaster declarations (5-year) |
| 🌐 **Infrastructure** | Broadband coverage |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ MapLibre GL  │  │  Vanilla JS  │  │    D3.js     │  │
│  │  (Map View)  │  │  (UI/Panels) │  │  (Charts)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└───────────────────────────┼─────────────────────────────┘
                            │ fetch() API calls
┌───────────────────────────┼─────────────────────────────┐
│                  FastAPI Backend                         │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │  API Proxy     │  │  Data Agg &    │                 │
│  │  (hide keys)   │  │  Caching Layer │                 │
│  └────────────────┘  └────────────────┘                 │
└───────────────────────────┼─────────────────────────────┘
                            │
┌───────────────────────────┼─────────────────────────────┐
│                  SQLite Database                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Cached API   │  │   GeoJSON    │  │ Pre-computed  │  │
│  │ Responses    │  │  Boundaries  │  │   Metrics     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🗓️ Roadmap

### Phase 1 — Foundation (MVP) ✅
- [x] Interactive USA map (state-level) with MapLibre GL
- [x] 9 data layers with multiple metrics each
- [x] Choropleth heatmap coloring
- [x] Click-to-explore side panel with detail view
- [x] D3.js animated trend charts
- [x] Compare mode (up to 4 states)
- [x] State search with keyboard shortcuts
- [x] Dark mode UI with glassmorphism

### Phase 2 — Live Data & Expansion
- [ ] Connect to live APIs (FBI, Census, FRED, NOAA, etc.)
- [ ] Caching with SQLite
- [ ] County-level drill-down
- [ ] Time slider animation

### Phase 3 — Polish & Advanced
- [ ] Natural disaster overlay (real-time)
- [ ] "Best places" scoring engine
- [ ] Data export (CSV, PNG)
- [ ] Sharing via URL parameters
- [ ] Mobile optimization

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/<your-username>/usa-data-map.git
cd usa-data-map

# Create a virtual environment
python -m venv venv
source venv/bin/activate   # macOS/Linux
venv\Scripts\activate      # Windows

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env       # macOS/Linux
copy .env.example .env     # Windows
# Fill in your API keys (see .env.example for details)

# Run the dev server
python -m uvicorn app.main:app --reload --port 8000
```

Then open **http://localhost:8000** in your browser.

> **Note:** The app currently ships with built-in sample data for all 50 states. No API keys are needed to run the frontend demo. API keys are only required once live data integration is enabled in Phase 2.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `/` | Focus search bar |
| `C` | Toggle compare mode |
| `Esc` | Deselect / close panels |

---

## 📄 License

MIT
