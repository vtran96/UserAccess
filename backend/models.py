"""
models.py — Pydantic request/response models for UserAccess API.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# ── User ──────────────────────────────────────────────────────────────────
class UserBase(BaseModel):
    userId: str
    fullName: str
    email: str
    department: Optional[str] = None
    title: Optional[str] = None
    status: str = "Active"


class UserCreate(UserBase):
    pass


class UserUpdate(BaseModel):
    fullName: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    title: Optional[str] = None
    status: Optional[str] = None


class User(UserBase):
    createdOn: Optional[str] = None
    accessCount: Optional[int] = 0


class UserDetail(User):
    access: list = []


# ── Application ───────────────────────────────────────────────────────────
class ApplicationBase(BaseModel):
    appId: str
    aName: str
    webConsole: Optional[str] = None
    cloudStart: Optional[str] = None
    aServer: Optional[str] = None
    aDirectory: Optional[str] = None
    dbName: Optional[str] = None
    isInternal: Optional[bool] = True
    dbServer: Optional[str] = None
    intURL: Optional[str] = None
    extURL: Optional[str] = None


class Application(ApplicationBase):
    userCount: Optional[int] = 0


class ApplicationDetail(Application):
    members: list = []


# ── Access Level ──────────────────────────────────────────────────────────
class AccessLevel(BaseModel):
    applicationId: str
    accessLevel: str
    comments: Optional[str] = None


# ── User Group (Access Record) ────────────────────────────────────────────
class AccessRecord(BaseModel):
    recId: str
    userId: str
    groupN: str
    applicationId: Optional[str] = None
    createdOn: Optional[str] = None
    # Joined fields for display
    userName: Optional[str] = None
    appName: Optional[str] = None


class AccessGrant(BaseModel):
    userId: str
    applicationId: str
    groupN: str


class AccessUpdate(BaseModel):
    groupN: str


# ── Paginated Response ────────────────────────────────────────────────────
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    pageSize: int
    totalPages: int
