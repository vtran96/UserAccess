"""
auth.py — Microsoft SSO stub.
Accepts admin/admin for development. Replace MS_* env vars with real values for production.
"""
from datetime import datetime, timedelta
from typing import Optional
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key-change-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# ── Stub credentials (plain-text for dev stub; use bcrypt in production) ──
STUB_USERS = {
    "admin": {
        "username": "admin",
        "fullName": "Administrator",
        "email": "admin@nycem.nyc.gov",
        "role": "admin",
        "plain_password": "admin",   # STUB ONLY — replace with hashed in prod
    }
}

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

router = APIRouter(prefix="/auth", tags=["auth"])


class Token(BaseModel):
    access_token: str
    token_type: str
    user: dict


class TokenData(BaseModel):
    username: Optional[str] = None


def verify_password(plain_password: str, stored_password: str) -> bool:
    # Dev stub: plain text comparison using secrets.compare_digest (timing-safe)
    return secrets.compare_digest(plain_password.encode(), stored_password.encode())


def authenticate_user(username: str, password: str):
    user = STUB_USERS.get(username)
    if not user:
        return False
    if not verify_password(password, user["plain_password"]):
        return False
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = STUB_USERS.get(username)
    if user is None:
        raise credentials_exception
    return user


@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user["username"]},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "username": user["username"],
            "fullName": user["fullName"],
            "email": user["email"],
            "role": user["role"],
        }
    }


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    return {k: v for k, v in current_user.items() if k != "plain_password"}


@router.post("/logout")
async def logout():
    # Client-side token removal — stub endpoint for SSO redirect later
    return {"message": "Logged out successfully"}
