"""
routers/applications.py — Application CRUD endpoints (mock data).
"""
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel
from auth import get_current_user
import mock_data

router = APIRouter(prefix="/applications", tags=["applications"])


def _enrich_app(a: dict) -> dict:
    return {**a, "userCount": mock_data.get_app_user_count(a["appId"])}


# ── Pydantic models ──────────────────────────────────────────────────────────

class AppCreate(BaseModel):
    appId: str
    aName: str
    description: Optional[str] = None
    webConsole: Optional[str] = None
    cloudStart: Optional[str] = None
    aServer: Optional[str] = None
    aDirectory: Optional[str] = None
    dbName: Optional[str] = None
    dbServer: Optional[str] = None
    isInternal: bool = True
    intURL: Optional[str] = None
    extURL: Optional[str] = None


class AppUpdate(BaseModel):
    aName: Optional[str] = None
    description: Optional[str] = None
    webConsole: Optional[str] = None
    cloudStart: Optional[str] = None
    aServer: Optional[str] = None
    aDirectory: Optional[str] = None
    dbName: Optional[str] = None
    dbServer: Optional[str] = None
    isInternal: Optional[bool] = None
    intURL: Optional[str] = None
    extURL: Optional[str] = None


# ── Routes ───────────────────────────────────────────────────────────────────

@router.get("")
def list_applications(
    search: Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    apps = list(mock_data.APPLICATIONS)
    if search:
        s = search.lower()
        apps = [
            a for a in apps
            if s in a["aName"].lower()
            or s in a["appId"].lower()
            or s in (a.get("description") or "").lower()
        ]
    return [_enrich_app(a) for a in apps]


@router.post("", status_code=201)
def create_application(payload: AppCreate, current_user: dict = Depends(get_current_user)):
    app_id = payload.appId.upper().strip()
    if any(a["appId"] == app_id for a in mock_data.APPLICATIONS):
        raise HTTPException(status_code=409, detail=f"Application ID '{app_id}' already exists.")

    new_app = {
        "appId":       app_id,
        "aName":       payload.aName,
        "description": payload.description or "",
        "webConsole":  payload.webConsole,
        "cloudStart":  payload.cloudStart,
        "aServer":     payload.aServer,
        "aDirectory":  payload.aDirectory,
        "dbName":      payload.dbName,
        "dbServer":    payload.dbServer,
        "isInternal":  payload.isInternal,
        "intURL":      payload.intURL,
        "extURL":      payload.extURL,
    }
    mock_data.APPLICATIONS.append(new_app)
    # Initialize empty access levels list for new app
    mock_data.ACCESS_LEVELS[app_id] = []
    return _enrich_app(new_app)


@router.get("/{app_id}")
def get_application(app_id: str, current_user: dict = Depends(get_current_user)):
    app = next((a for a in mock_data.APPLICATIONS if a["appId"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application '{app_id}' not found")

    # Members: access records for this app + enriched with user info
    access_records = [a for a in mock_data.USER_ACCESS if a["applicationId"] == app_id]
    members = []
    for rec in access_records:
        user = next((u for u in mock_data.USERS if u["userId"] == rec["userId"]), {})
        members.append({
            **rec,
            "fullName":   user.get("fullName",   rec["userId"]),
            "email":      user.get("email",      ""),
            "department": user.get("department", ""),
            "userStatus": user.get("status",     ""),
        })

    return {**_enrich_app(app), "members": members, "accessLevels": mock_data.ACCESS_LEVELS.get(app_id, [])}


@router.put("/{app_id}")
def update_application(app_id: str, payload: AppUpdate, current_user: dict = Depends(get_current_user)):
    app = next((a for a in mock_data.APPLICATIONS if a["appId"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application '{app_id}' not found")

    updatable = ["aName", "description", "webConsole", "cloudStart", "aServer",
                 "aDirectory", "dbName", "dbServer", "isInternal", "intURL", "extURL"]
    for field in updatable:
        val = getattr(payload, field, None)
        if val is not None:
            app[field] = val

    return _enrich_app(app)
