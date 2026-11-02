# PRAMAAN-X Deployment & Operations Guide

This guide details deployment configurations, environment variables, multi-service topology, cold-start mitigation, and operational verification procedures for the **PRAMAAN-X** Regulatory Decision-Support Framework.

---

## 1. Multi-Service Topology

PRAMAAN-X consists of three decoupled operational tiers:

```
┌─────────────────────────────────┐
│     1. React 19 Frontend        │ ◄── Vercel / Render Static / Nginx
│  (Vite + Tailwind CSS + Lucide) │
└────────────────┬────────────────┘
                 │ HTTP REST (VITE_API_BASE_URL or relative /api/v1)
                 ▼
┌─────────────────────────────────┐
│     2. FastAPI Core Backend     │ ◄── Render / Docker / Railway (Port 8000)
│  (PyMuPDF, NetworkX, Ed25519)   │
└────────┬────────────────────────┘
         │
         ├───► Database: SQLite (Local/Ephemeral) or PostgreSQL (Production)
         │
         └───► 3. Statutory Verification Gateway (Port 8001 or Mounted Internal Router)
               ├── Mode A (Standalone): Independent Microservice container
               └── Mode B (Unified): Mounted internally under `/mock_issuer` inside Backend
```

| Service | Technology | Runtime Port | Default Internal URL | Responsibility |
| :--- | :--- | :---: | :--- | :--- |
| **Frontend** | React 19 + Vite 8 | `5173` / `80` | `http://localhost:5173` | Officer Scrutiny Console, Evidence Lens, Radar, Architecture Inspector |
| **Backend** | FastAPI + SQLAlchemy | `8000` | `http://localhost:8000` | RBAC Gateway, Ingestion, APH YAML Rules, Impossibility Graph, Audit Ledger |
| **Mock Issuer** | FastAPI + Static JSON | `8001` | `http://localhost:8001` | Simulates Fire Services, Bhoomi Land Records, University Affiliation, and NBA |

---

## 2. Environment Variables Specification

### 2.1 Backend Service Environment Variables

| Variable | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Optional | `sqlite:///./pramaan_x.db` | SQLAlchemy DB URI (`sqlite:///...` or `postgresql+psycopg2://...`). |
| `SECRET_KEY` | **Required (Prod)** | `pramaan-x-hackathon-super-secret-key-2025-aicte` | Cryptographic secret for signing Ed25519 audit receipts and HMAC JWTs. |
| `ALGORITHM` | Optional | `HS256` | JWT signature algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Optional | `1440` (24h) | Session validity lifetime in minutes. |
| `CORS_ORIGINS` | Optional | `*` | Comma-separated allowed CORS domains (e.g. `https://pramaan-frontend.vercel.app,https://pramaan.onrender.com`). Accepts `*` with credential regex matching. |
| `MOCK_ISSUER_URL` | Optional | `http://127.0.0.1:8001` | Target endpoint of statutory authority gateway. |
| `MOCK_ISSUER_INTERNAL_ROUTER` | Optional | `true` | Automatically mounts statutory gateway internally at `/mock_issuer` as a resilient zero-config fallback. |
| `ISSUER_API_KEY` | Optional | `pramaanx-mock-key-2025` | Mutual pre-shared authentication key for statutory issuer APIs. |
| `BACKEND_PORT` | Optional | `8000` | Local or container listener port. |

### 2.2 Frontend Environment Variables (Build-Time & Runtime)

| Variable | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `VITE_API_BASE_URL` | **Recommended** | `""` (Relative `/api/v1`) | Full base URL to backend (e.g. `https://pramaan-backend.onrender.com/api/v1`). If omitted, frontend defaults to `/api/v1` relative path. |
| `VITE_API_URL` | Optional | `""` | Backward-compatible alias for `VITE_API_BASE_URL`. |

### 2.3 Mock Statutory Issuer Environment Variables

| Variable | Required | Default Value | Description |
| :--- | :---: | :--- | :--- |
| `MOCK_ISSUER_PORT` | Optional | `8001` | Standalone mock issuer port. |
| `ISSUER_API_KEY` | Optional | `pramaanx-mock-key-2025` | Expected `X-API-Key` HTTP header. |
| `CORS_ORIGINS` | Optional | `*` | Allowed CORS origins for external registry checks. |

---

## 3. Demo Regulatory Accounts

Pre-seeded deterministic credentials across all 5 operational regulatory personas:

| Regulatory Persona | Role Identifier | Email Address | Password | Scoped Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Scrutiny Committee Officer** | `scrutiny_officer` | `scrutiny.officer@aicte-india.org` | `AicteOfficer@2025` | Scrutiny Dashboard, Evidence Lens, Manual Review Queue, Pre-Flight, Forensics, Radar |
| **Senior Regulatory Officer** | `senior_officer` | `senior.officer@aicte-india.org` | `AicteSenior@2025` | All scrutiny views + Regulation-as-Code YAML editor + Cohort What-If dry-runs |
| **Regional Bureau Officer** | `senior_officer` | `regional.officer@aicte-india.org` | `AicteRegional@2025` | Regional dossier triage, inspection itinerary planning, hearing reviews |
| **Central AICTE Admin** | `admin` | `admin@aicte-india.org` | `AicteAdmin@2025` | Complete administrative access, system maintenance, role simulation |
| **Statutory Auditor** | `auditor` | `auditor@aicte-india.org` | `AicteAuditor@2025` | Read-only tamper-evident audit ledger, Ed25519 signature verification |
| **Institution Registrar (Apex)** | `institution_user` | `registrar@apextech.edu.in` | `ApexPass@2025` | Tenant-isolated institutional portal for Apex Institute of Technology |
| **Institution Principal (Royal)** | `institution_user` | `principal@royal.edu.in` | `RoyalPass@2025` | Tenant-isolated institutional portal for Royal College of Engineering |

---

## 4. Build & Deployment Options

### Option A: Local Development (Windows / Linux / macOS)

1. **Install Dependencies**:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\Scripts\activate
   pip install -r requirements-ml.txt
   cd frontend && npm install && cd ..
   ```

2. **Restore Pristine Baseline Seed Data**:
   ```bash
   python -m backend.app.data.seed_data --reset
   python mock_issuer/seed_registry.py
   ```

3. **Start All Services**:
   ```bash
   # Windows:
   run_all.bat

   # Or manually in separate shells:
   # Shell 1: Mock Issuer
   python -m uvicorn mock_issuer.app.main:app --host 127.0.0.1 --port 8001
   # Shell 2: Backend
   python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
   # Shell 3: Frontend
   cd frontend && npm run dev -- --host 127.0.0.1 --port 5173
   ```

### Option B: Docker Compose Deployment

Single-command multi-tier deployment running PostgreSQL, Mock Issuer, FastAPI Core, and Nginx Frontend:

```bash
docker compose up --build -d
```

- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/api/v1/docs`
- Health Probe: `http://localhost:8000/health`
- Standalone Mock Issuer: `http://localhost:8001/docs`

### Option C: Render Blueprint (`render.yaml`)

PRAMAAN-X includes a production `render.yaml` blueprint defining all 3 tiers:

1. Push your repository to GitHub / GitLab.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New +** ➔ **Blueprint**.
3. Select your repository. Render automatically reads `render.yaml` and launches:
   - `pramaan-backend` (Web Service)
   - `pramaan-mock-issuer` (Web Service)
   - `pramaan-frontend` (Static Site with SPA Rewrites)
4. Environment variables link dynamically via `fromService` references.

### Option D: Hybrid Vercel Frontend + Render Backend

1. **Backend & Mock Issuer**:
   - Deploy backend to Render or Railway with `DATABASE_URL=sqlite:///./pramaan_x.db` and `CORS_ORIGINS=*`.
2. **Frontend on Vercel**:
   - Set Root Directory to `frontend`.
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variable: `VITE_API_BASE_URL=https://<your-render-backend>.onrender.com/api/v1`
   - The included `frontend/vercel.json` and `frontend/public/_redirects` automatically configure SPA routing (`/* -> /index.html`) and reverse proxies for `/api/v1/` and `/health`.

---

## 5. Resiliency Safeguards

### 5.1 Deep Health Check (`/health`)
Unlike shallow probes, `/health` verifies active system health:
1. Executes `SELECT 1` on the primary database (returns 503 `UNHEALTHY` if DB unreachable).
2. Probes `MOCK_ISSUER_URL/health` (or internal mounted router `/mock_issuer`).
3. If database is operational but statutory gateway is down, returns HTTP 200 with `status: "DEGRADED"` and a specific reason. The frontend Navbar reflects this with an amber **Degraded** status pill, preventing misleading green "API Live" states.

### 5.2 Manual Review Queue Non-Failing Fallback
- `GET /api/v1/verification/connector/manual-review-queue` never throws HTTP 5xx when external statutory gateways are slow or offline.
- Returns status HTTP 200 with all queued tickets, alongside an `issuer_unavailable: true` attribute and `X-Issuer-Unavailable` header.
- The UI displays an amber advisory banner informing scrutiny officers that authority portals are operating in fallback buffer mode, without rendering a blank error screen.

### 5.3 Cold Start Auto-Retry (60s Window)
- Cloud free tiers (e.g., Render) enter deep sleep after 15 minutes of inactivity.
- The frontend features cold-start interceptors that intercept initial 502/503/Network failures, display a user-friendly *"Waking up the server... Please wait while cloud container starts"* banner, and retry with exponential backoff for up to 60 seconds before reporting failure.
