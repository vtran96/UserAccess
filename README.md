# UserAccess — NYCEM Access Management Portal

A web-based user access management tool for NYC Emergency Management. Manage user access across internal applications — grant, revoke, change, and clone access records from a clean dashboard UI.

## Features

- 📊 **Dashboard** — Live stats with clickable navigation cards
- 👥 **Users** — Browse, search, filter by department/status
- 🖥 **Applications** — Add, edit, and search apps (including by description)
- 🔑 **Access Records** — View, change, and revoke all access assignments
- 👤 **User Detail** — Grant access + Clone access from another user
- 🏢 **App Detail** — Grant users access directly from the app page
- 🛡 **Access Levels** — Define and manage permission levels per application

## Requirements

- Python 3.10+
- pip

## Setup & Run

### 1. Clone the repo

```bash
git clone https://github.com/vtran96/UserAccess.git
cd UserAccess
```

### 2. Set up the backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Configure environment (optional)

```bash
cp .env.example .env
# Edit .env if needed — defaults work out of the box in mock mode
```

### 4. Start the backend

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

API will be available at: `http://127.0.0.1:8000`  
Swagger docs at: `http://127.0.0.1:8000/docs`

### 5. Open the frontend

Open this file directly in your browser (no server needed):

```
frontend/login.html
```

**Dev credentials:** `admin` / `admin`

## Project Structure

```
UserAccess/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── auth.py              # JWT auth (stub login for dev)
│   ├── mock_data.py         # In-memory seed data (NYCEM-style)
│   ├── models.py            # Pydantic shared models
│   └── routers/
│       ├── users.py         # User CRUD
│       ├── applications.py  # Application CRUD
│       ├── access.py        # Grant/revoke/clone access
│       └── access_levels.py # Access level definitions
├── frontend/
│   ├── index.html           # Main SPA shell
│   ├── login.html           # Login page
│   ├── css/styles.css       # All styles
│   └── js/
│       ├── api.js           # Fetch wrappers for all endpoints
│       ├── app.js           # SPA router
│       ├── auth.js          # Token management
│       ├── components/      # Toast, Modal
│       └── views/           # dashboard, users, applications, etc.
└── Docs/                    # Feature specs and implementation plan
```

## Running Mode

The app runs in **mock mode** by default — all data lives in memory (`mock_data.py`). No PostgreSQL setup required. Data resets on server restart.

To switch to a live database, set `DB_MODE=live` in `.env` and configure the `DATABASE_URL`.

## Notes

- The frontend is a vanilla JS SPA (no build step, no Node.js needed)
- The backend is FastAPI with optional PostgreSQL integration
- CSS uses CSS custom properties (dark mode design system)
