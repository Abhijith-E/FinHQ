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
    
    try:
        security.check_password_complexity(user_in.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if await security.check_pwned_password(user_in.password):
        raise HTTPException(
            status_code=400, 
            detail="This password has been exposed in data breaches. Please choose a different one."
        )

    hashed_pwd = security.get_password_hash(user_in.password)
    user = models.User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name,
        is_active=True,
    )
    db.add(user)
    await db.flush()  # to get user.id
    
    # Store in password history
    pwd_history = models.PasswordHistory(
        user_id=user.id,
        hashed_password=hashed_pwd
    )
    db.add(pwd_history)
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
    
    if user:
        # Check lockout status
        if user.lockout_until and user.lockout_until > datetime.utcnow():
            mins_left = int((user.lockout_until - datetime.utcnow()).total_seconds() / 60) + 1
            raise HTTPException(status_code=403, detail=f"Account locked due to multiple failed login attempts. Try again in {mins_left} minutes.")
            
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        if user:
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.lockout_until = datetime.utcnow() + timedelta(minutes=15)
            await db.commit()
        raise HTTPException(status_code=400, detail="Incorrect email or password")
        
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")

    # Success: reset failed attempts
    user.failed_login_attempts = 0
    user.lockout_until = None
    user.last_login = datetime.utcnow()
    
    if user.is_2fa_enabled:
        # Return a temporary token requiring 2FA step
        temp_token_expires = timedelta(minutes=5)
        temp_token = security.create_access_token(str(user.id), expires_delta=temp_token_expires)
        await db.commit()
        return {
            "access_token": temp_token,
            "token_type": "bearer",
            "requires_2fa": True,
            "message": "2FA verification required."
        }

    
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

@router.post("/login/verify-2fa", response_model=schemas.Token)
@limiter.limit("5/minute")
async def verify_2fa_login(
    request: Request,
    data: schemas.Verify2FA,
    db: AsyncSession = Depends(get_db)
) -> Any:
    """Verify the TOTP code to complete login."""
    try:
        payload = security.decode_token(data.token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise ValueError("Invalid token")
        user_id = int(user_id_str)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired temporary token")
        
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first()
    
    if not user or not user.is_2fa_enabled or not user.totp_secret:
        raise HTTPException(status_code=400, detail="2FA is not properly configured")
        
    if not security.verify_totp(user.totp_secret, data.code):
        user.failed_login_attempts += 1
        await db.commit()
        raise HTTPException(status_code=400, detail="Invalid 2FA code")
        
    # Reset lockouts just in case
    user.failed_login_attempts = 0
    user.lockout_until = None
    
    # Issue real tokens
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    
    access_token = security.create_access_token(user.id, expires_delta=access_token_expires)
    refresh_token = security.create_refresh_token(user.id, expires_delta=refresh_token_expires)
    
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
        "requires_2fa": False
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
    current_user.is_2fa_enabled = True
    await db.commit()
    
    return {"success": True, "message": "2FA successfully enabled"}
