from datetime import timedelta, datetime
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import uuid
import uuid 

from app import schemas, models
from app.api import deps
from app.core import security
from app.core.config import settings
from app.db.session import get_db

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

router = APIRouter()

@router.post("/register", response_model=schemas.User)
@limiter.limit("5/minute")
async def register_user(
    request: Request,
    *,
    db: AsyncSession = Depends(get_db),
    user_in: schemas.UserCreate,
) -> Any:
    """
    Create new user.
    """
    result = await db.execute(select(models.User).where(models.User.email == user_in.email))
    user = result.scalars().first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    
    user = models.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        full_name=user_in.full_name,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user

@router.post("/login/access-token", response_model=schemas.Token)
@limiter.limit("10/minute")
async def login_access_token(
    request: Request,
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    result = await db.execute(select(models.User).where(models.User.email == form_data.username))
    user = result.scalars().first()
    
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Important: In a real system, we'd verify 2FA here if enabled.
    # For now, we issue tokens immediately.
    
    # Update last login
    user.last_login = datetime.utcnow()
    
    # Generate tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    access_token = security.create_access_token(user.id, expires_delta=access_token_expires)
    refresh_token = security.create_refresh_token(user.id, expires_delta=refresh_token_expires)
    
    # Create User Session
    ip_address = request.client.host if request.client else "unknown"
    session_token = str(uuid.uuid4())
    
    user_session = models.UserSession(
        user_id=user.id,
        session_token=session_token,
        device_fingerprint=request.headers.get("User-Agent", "unknown"),
        ip_address=ip_address,
        expires_at=datetime.utcnow() + refresh_token_expires
    )
    db.add(user_session)
    await db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/refresh", response_model=schemas.Token)
async def refresh_access_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
) -> Any:
    try:
        payload = security.decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=400, detail="Invalid token type")

        user_id = payload.get("sub")
        result = await db.execute(select(models.User).where(models.User.id == user_id))
        user = result.scalars().first()

        if not user or not user.is_active:
            raise HTTPException(status_code=401, detail="User not found or inactive")

        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        new_access_token = security.create_access_token(user.id, expires_delta=access_token_expires)

        return {
            "access_token": new_access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Could not validate credentials")


@router.post("/2fa/setup")
async def setup_two_factor_auth(
    current_user: models.User = Depends(deps.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a TOTP secret and QR code URI for the user.
    """
    secret = security.generate_totp_secret()
    
    # Temporarily store the secret until verified
    current_user.totp_secret = secret
    await db.commit()
    
    uri = security.get_totp_uri(secret, current_user.email)
    
    return {"secret": secret, "qr_code_uri": uri}

@router.post("/2fa/verify")
async def verify_two_factor_auth(
    code: str,
    current_user: models.User = Depends(deps.get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Verify the TOTP code to finalize 2FA setup.
    """
    if not current_user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA not setup")
        
    is_valid = security.verify_totp(current_user.totp_secret, code)
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
        
    current_user.is_verified = True
    await db.commit()
    
    return {"success": True, "message": "2FA successfully enabled"}
