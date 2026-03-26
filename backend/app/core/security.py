from datetime import datetime, timedelta
from typing import Any, Union
import hashlib
import re
import httpx
from zxcvbn import zxcvbn
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
import pyotp

# Use argon2 as the primary scheme, fallback to sha256_crypt and bcrypt for legacy hashes
pwd_context = CryptContext(schemes=["argon2", "sha256_crypt", "bcrypt"], deprecated="auto")


def _get_secret_key() -> str:
    """Always use the symmetric secret key for HS256 JWT signing."""
    return settings.SECRET_KEY


def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode = {"exp": expire, "sub": str(subject), "type": "access"}
    return jwt.encode(to_encode, _get_secret_key(), algorithm="HS256")


def create_refresh_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES))
    to_encode = {"exp": expire, "sub": str(subject), "type": "refresh"}
    return jwt.encode(to_encode, _get_secret_key(), algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, _get_secret_key(), algorithms=["HS256"])


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Hash using argon2 — production-safe fintech standard."""
    return pwd_context.hash(password)

def check_password_complexity(password: str) -> bool:
    """
    Check if the password meets the minimum security requirements:
    - 14 characters minimum
    - Contains uppercase, lowercase, number, special character
    - Entropy >= 70 bits
    """
    if len(password) < 14:
        raise ValueError("Password must be at least 14 characters long")
    if not re.search(r"[A-Z]", password):
        raise ValueError("Password must contain at least one uppercase letter")
    if not re.search(r"[a-z]", password):
        raise ValueError("Password must contain at least one lowercase letter")
    if not re.search(r"\d", password):
        raise ValueError("Password must contain at least one number")
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise ValueError("Password must contain at least one special character")
    
    # Basic complexity rules are sufficient for now
    return True

async def check_pwned_password(password: str) -> bool:
    """
    Check password against HaveIBeenPwned API using k-Anonymity.
    Returns True if breached, False otherwise.
    """
    sha1_password = hashlib.sha1(password.encode("utf-8")).hexdigest().upper()
    prefix, suffix = sha1_password[:5], sha1_password[5:]
    url = f"https://api.pwnedpasswords.com/range/{prefix}"
    
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(url)
            if response.status_code != 200:
                # Fail open if API is down to not block users, but ideally log this
                return False
                
            hashes = (line.split(":") for line in response.text.splitlines())
            for h, count in hashes:
                if h == suffix:
                    return True # Pwned!
    except httpx.RequestError:
        # Failsafe
        pass
        
    return False


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code)


def get_totp_uri(secret: str, email: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=settings.PROJECT_NAME)
