from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime, timedelta
from app import schemas, models
from app.api import deps
from app.db.session import get_db
from app.core import security
from app.core.config import settings

router = APIRouter()

@router.get("/me", response_model=schemas.User)
async def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user)
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.post("/forgot-password")
async def forgot_password(
    data: schemas.PasswordReset,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(models.User).where(models.User.email == data.email))
    user = result.scalars().first()
    if not user:
        # Don't reveal user existence
        return {"message": "If an account with that email exists, a secure reset link has been sent."}
        
    expires = timedelta(minutes=15)
    reset_token = security.create_access_token(user.id, expires_delta=expires)
    
    # In a real app we'd send an email here.
    return {
        "message": "If an account with that email exists, a secure reset link has been sent.",
        "reset_token": reset_token # ONLY FOR DEMO. Removing in production!
    }

@router.post("/reset-password")
async def reset_password(
    data: schemas.PasswordResetConfirm,
    db: AsyncSession = Depends(get_db)
):
    try:
        payload = security.decode_token(data.token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise ValueError()
        user_id = int(user_id_str)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    result = await db.execute(select(models.User).where(models.User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check complexity
    try:
        security.check_password_complexity(data.new_password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    if await security.check_pwned_password(data.new_password):
        raise HTTPException(status_code=400, detail="Password exposed in data breaches. Please pick another.")
        
    # Check password history for last 10 passwords
    history_result = await db.execute(
        select(models.PasswordHistory)
        .where(models.PasswordHistory.user_id == user.id)
        .order_by(models.PasswordHistory.created_at.desc())
        .limit(10)
    )
    last_passwords = history_result.scalars().all()
    
    for pwd in last_passwords:
        if security.verify_password(data.new_password, pwd.hashed_password):
            raise HTTPException(status_code=400, detail="Password cannot be the same as any of your last 10 passwords.")
            
    # Update password
    hashed_pwd = security.get_password_hash(data.new_password)
    user.hashed_password = hashed_pwd
    user.password_changed_at = datetime.utcnow()
    
    # Invalidate all existing sessions
    await db.execute(
        delete(models.UserSession)
        .where(models.UserSession.user_id == user.id)
    )
    
    # Add to history
    new_history = models.PasswordHistory(user_id=user.id, hashed_password=hashed_pwd)
    db.add(new_history)
    
    await db.commit()
    return {"message": "Password updated successfully."}
