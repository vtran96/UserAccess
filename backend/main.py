"""
main.py — FastAPI application entry point for UserAccess.
Currently uses mock_data; swap database.py calls for live PostgreSQL later.
"""
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from auth import router as auth_router
from routers import users, applications, access, access_levels

load_dotenv()

app = FastAPI(
    title="UserAccess API",
    description="Manages user access to applications and databases for NYCEM.",
    version="1.0.0",
)

# ── CORS ──────────────────────────────────────────────────────────────────
allowed_origins = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5500,http://localhost:5500,null"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────
app.include_router(auth_router)
app.include_router(users.router)
app.include_router(applications.router)
app.include_router(access.router)
app.include_router(access_levels.router)


@app.get("/")
def root():
    return {
        "app": "UserAccess API",
        "version": "1.0.0",
        "status": "running",
        "mode": "mock",
        "docs": "/docs",
    }


@app.get("/health")
def health():
    return {"status": "healthy"}
