"""
routers/access_levels.py — Access level definitions per application (read + write).
"""
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from auth import get_current_user
import mock_data

router = APIRouter(prefix="/access-levels", tags=["access-levels"])


class AccessLevelCreate(BaseModel):
    applicationId: str
    accessLevel: str
    comments: Optional[str] = None


class AccessLevelUpdate(BaseModel):
    comments: Optional[str] = None
    accessLevel: Optional[str] = None  # allow renaming


@router.get("")
def list_all_access_levels(current_user: dict = Depends(get_current_user)):
    """Return all levels for all apps, enriched with app name."""
    result = []
    for app_id, levels in mock_data.ACCESS_LEVELS.items():
        app = next((a for a in mock_data.APPLICATIONS if a["appId"] == app_id), {})
        for lvl in levels:
            result.append({
                "applicationId": app_id,
                "appName":       app.get("aName", app_id),
                **lvl
            })
    return result


@router.get("/{app_id}")
def get_access_levels(app_id: str, current_user: dict = Depends(get_current_user)):
    app = next((a for a in mock_data.APPLICATIONS if a["appId"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application '{app_id}' not found")
    levels = mock_data.ACCESS_LEVELS.get(app_id, [])
    return [{"applicationId": app_id, "appName": app["aName"], **lvl} for lvl in levels]


@router.post("", status_code=201)
def create_access_level(payload: AccessLevelCreate, current_user: dict = Depends(get_current_user)):
    app_id = payload.applicationId
    app = next((a for a in mock_data.APPLICATIONS if a["appId"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application '{app_id}' not found")

    existing_levels = mock_data.ACCESS_LEVELS.get(app_id, [])
    if any(lvl["accessLevel"] == payload.accessLevel for lvl in existing_levels):
        raise HTTPException(status_code=409, detail=f"Level '{payload.accessLevel}' already exists for this app.")

    new_level = {"accessLevel": payload.accessLevel, "comments": payload.comments or ""}
    mock_data.ACCESS_LEVELS.setdefault(app_id, []).append(new_level)
    return {"applicationId": app_id, "appName": app["aName"], **new_level}


@router.put("/{app_id}/{level_name}")
def update_access_level(
    app_id: str,
    level_name: str,
    payload: AccessLevelUpdate,
    current_user: dict = Depends(get_current_user)
):
    app = next((a for a in mock_data.APPLICATIONS if a["appId"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application '{app_id}' not found")

    levels = mock_data.ACCESS_LEVELS.get(app_id, [])
    lvl = next((l for l in levels if l["accessLevel"] == level_name), None)
    if not lvl:
        raise HTTPException(status_code=404, detail=f"Level '{level_name}' not found for app '{app_id}'")

    if payload.comments is not None:
        lvl["comments"] = payload.comments
    if payload.accessLevel and payload.accessLevel != level_name:
        # Check no duplicate name
        if any(l["accessLevel"] == payload.accessLevel for l in levels if l is not lvl):
            raise HTTPException(status_code=409, detail=f"Level '{payload.accessLevel}' already exists.")
        lvl["accessLevel"] = payload.accessLevel

    return {"applicationId": app_id, "appName": app["aName"], **lvl}


@router.delete("/{app_id}/{level_name}", status_code=204)
def delete_access_level(app_id: str, level_name: str, current_user: dict = Depends(get_current_user)):
    app = next((a for a in mock_data.APPLICATIONS if a["appId"] == app_id), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application '{app_id}' not found")

    levels = mock_data.ACCESS_LEVELS.get(app_id, [])
    lvl = next((l for l in levels if l["accessLevel"] == level_name), None)
    if not lvl:
        raise HTTPException(status_code=404, detail=f"Level '{level_name}' not found for app '{app_id}'")

    levels.remove(lvl)
    return None
