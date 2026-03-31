"""
routers/users.py — User CRUD endpoints (mock data).
"""
import math
from typing import Optional
from fastapi import APIRouter, Query, HTTPException, Depends
from auth import get_current_user
import mock_data

router = APIRouter(prefix="/users", tags=["users"])


def _enrich_user(u: dict) -> dict:
    return {**u, "accessCount": mock_data.get_user_access_count(u["userId"])}


@router.get("")
def list_users(
    search: Optional[str] = Query(None, description="Search by name, email, or userId"),
    status: Optional[str] = Query(None, description="Filter by status: Active, Inactive"),
    department: Optional[str] = Query(None, description="Filter by department"),
    page: int = Query(1, ge=1),
    pageSize: int = Query(10, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
):
    users = list(mock_data.USERS)

    if search:
        s = search.lower()
        users = [
            u for u in users
            if s in u["fullName"].lower()
            or s in u["email"].lower()
            or s in u["userId"].lower()
        ]
    if status:
        users = [u for u in users if u["status"].lower() == status.lower()]
    if department:
        users = [u for u in users if u["department"].lower() == department.lower()]

    total = len(users)
    total_pages = math.ceil(total / pageSize)
    start = (page - 1) * pageSize
    page_users = users[start: start + pageSize]

    return {
        "items": [_enrich_user(u) for u in page_users],
        "total": total,
        "page": page,
        "pageSize": pageSize,
        "totalPages": total_pages,
    }


@router.get("/departments")
def list_departments(current_user: dict = Depends(get_current_user)):
    depts = sorted(set(u["department"] for u in mock_data.USERS if u.get("department")))
    return depts


@router.get("/{user_id}")
def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    user = next((u for u in mock_data.USERS if u["userId"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")

    # Enrich access records with app names
    access_records = [a for a in mock_data.USER_ACCESS if a["userId"] == user_id]
    enriched_access = []
    for rec in access_records:
        app = next((a for a in mock_data.APPLICATIONS if a["appId"] == rec["applicationId"]), {})
        enriched_access.append({**rec, "appName": app.get("aName", rec["applicationId"])})

    return {**_enrich_user(user), "access": enriched_access}


@router.put("/{user_id}")
def update_user(
    user_id: str,
    updates: dict,
    current_user: dict = Depends(get_current_user),
):
    user = next((u for u in mock_data.USERS if u["userId"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail=f"User '{user_id}' not found")
    # In mock mode, just reflect the change back (no persistence)
    allowed = {"fullName", "email", "department", "title", "status"}
    for key, val in updates.items():
        if key in allowed:
            user[key] = val
    return _enrich_user(user)
