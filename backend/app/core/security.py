from datetime import datetime, timedelta
from typing import Any, Union
import hashlib
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
import pyotp

# Use sha256_crypt to avoid bcrypt 72-byte limit bug in passlib
# bcrypt is still included as second-choice for any legacy hashes
pwd_context = CryptContext(schemes=["sha256_crypt", "bcrypt"], deprecated="auto")


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
    """Hash using sha256_crypt — no 72-byte limit, production-safe."""
    return pwd_context.hash(password)


def generate_totp_secret() -> str:
    return pyotp.random_base32()


def verify_totp(secret: str, code: str) -> bool:
    totp = pyotp.TOTP(secret)
    return totp.verify(code)


def get_totp_uri(secret: str, email: str) -> str:
    return pyotp.totp.TOTP(secret).provisioning_uri(name=email, issuer_name=settings.PROJECT_NAME)
