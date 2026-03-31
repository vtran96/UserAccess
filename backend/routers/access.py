"""
routers/access.py — Grant, revoke, update, clone access records.
"""
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, Depends
from pydantic import BaseModel
from models import AccessGrant, AccessUpdate
from auth import get_current_user
import mock_data
from datetime import date

router = APIRouter(prefix="/access", tags=["access"])


def _enrich_record(rec: dict) -> dict:
    user = next((u for u in mock_data.USERS if u["userId"] == rec["userId"]), {})
    app  = next((a for a in mock_data.APPLICATIONS if a["appId"] == rec.get("applicationId")), {})
    return {
        **rec,
        "userName":   user.get("fullName",   rec["userId"]),
        "userEmail":  user.get("email",      ""),
        "department": user.get("department", ""),
        "appName":    app.get("aName",       rec.get("applicationId", "")),
    }


@router.get("")
def list_access(
    userId: Optional[str] = Query(None),
    appId:  Optional[str] = Query(None),
    current_user: dict = Depends(get_current_user),
):
    records = list(mock_data.USER_ACCESS)
    if userId:
        records = [r for r in records if r["userId"] == userId]
    if appId:
        records = [r for r in records if r.get("applicationId") == appId]
    return [_enrich_record(r) for r in records]


@router.post("", status_code=201)
def grant_access(payload: AccessGrant, current_user: dict = Depends(get_current_user)):
    user = next((u for u in mock_data.USERS if u["userId"] == payload.userId), None)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{payload.userId}' not found")

    app = next((a for a in mock_data.APPLICATIONS if a["appId"] == payload.applicationId), None)
    if not app:
        raise HTTPException(status_code=404, detail=f"Application '{payload.applicationId}' not found")

    valid_levels = [lvl["accessLevel"] for lvl in mock_data.ACCESS_LEVELS.get(payload.applicationId, [])]
    if valid_levels and payload.groupN not in valid_levels:
        raise HTTPException(
            status_code=400,
            detail=f"Access level '{payload.groupN}' is not valid for application '{payload.applicationId}'"
        )

    existing = next(
        (r for r in mock_data.USER_ACCESS
         if r["userId"] == payload.userId and r["applicationId"] == payload.applicationId),
        None
    )
    if existing:
        raise HTTPException(
            status_code=409,
            detail="User already has access to this application. Use PUT to change the level."
        )

    new_rec = {
        "recId":         mock_data.get_next_rec_id(),
        "userId":        payload.userId,
        "groupN":        payload.groupN,
        "applicationId": payload.applicationId,
        "createdOn":     str(date.today()),
    }
    mock_data.USER_ACCESS.append(new_rec)
    return _enrich_record(new_rec)


@router.put("/{rec_id}")
def update_access(rec_id: str, payload: AccessUpdate, current_user: dict = Depends(get_current_user)):
    rec = next((r for r in mock_data.USER_ACCESS if r["recId"] == rec_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Access record '{rec_id}' not found")

    valid_levels = [lvl["accessLevel"] for lvl in mock_data.ACCESS_LEVELS.get(rec["applicationId"], [])]
    if valid_levels and payload.groupN not in valid_levels:
        raise HTTPException(status_code=400, detail=f"Invalid access level '{payload.groupN}'")

    rec["groupN"] = payload.groupN
    return _enrich_record(rec)


@router.delete("/{rec_id}", status_code=204)
def revoke_access(rec_id: str, current_user: dict = Depends(get_current_user)):
    rec = next((r for r in mock_data.USER_ACCESS if r["recId"] == rec_id), None)
    if not rec:
        raise HTTPException(status_code=404, detail=f"Access record '{rec_id}' not found")
    mock_data.USER_ACCESS.remove(rec)
    return None


# ── Clone Access ─────────────────────────────────────────────────────────────

class CloneRequest(BaseModel):
    targetUserId: str
    sourceUserId: str


@router.post("/clone", status_code=200)
def clone_access(payload: CloneRequest, current_user: dict = Depends(get_current_user)):
    """
    Clone all access from sourceUserId to targetUserId.
    Merge logic:
      - Same app already on target → overwrite groupN with source level.
      - App only on source        → add new record to target.
      - App only on target        → keep unchanged.
    """
    target_user = next((u for u in mock_data.USERS if u["userId"] == payload.targetUserId), None)
    source_user = next((u for u in mock_data.USERS if u["userId"] == payload.sourceUserId), None)
    if not target_user:
        raise HTTPException(status_code=404, detail=f"Target user '{payload.targetUserId}' not found")
    if not source_user:
        raise HTTPException(status_code=404, detail=f"Source user '{payload.sourceUserId}' not found")
    if payload.targetUserId == payload.sourceUserId:
        raise HTTPException(status_code=400, detail="Target and source user cannot be the same.")

    source_records = [r for r in mock_data.USER_ACCESS if r["userId"] == payload.sourceUserId]
    added = 0
    overwritten = 0

    for src_rec in source_records:
        app_id = src_rec["applicationId"]
        existing = next(
            (r for r in mock_data.USER_ACCESS
             if r["userId"] == payload.targetUserId and r["applicationId"] == app_id),
            None
        )
        if existing:
            # Overwrite
            existing["groupN"] = src_rec["groupN"]
            overwritten += 1
        else:
            # Add new
            new_rec = {
                "recId":         mock_data.get_next_rec_id(),
                "userId":        payload.targetUserId,
                "groupN":        src_rec["groupN"],
                "applicationId": app_id,
                "createdOn":     str(date.today()),
            }
            mock_data.USER_ACCESS.append(new_rec)
            added += 1

    return {
        "targetUserId": payload.targetUserId,
        "sourceUserId": payload.sourceUserId,
        "added":       added,
        "overwritten": overwritten,
        "total":       added + overwritten,
    }
