import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

def hash_password(password: str) -> str:
    """Hash a password using PBKDF2-HMAC-SHA256 with a unique salt."""
    salt = os.urandom(16).hex()
    key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000).hex()
    return f"{salt}:{key}"

def verify_password(stored_hash: str, password: str) -> bool:
    """Verify a plain password against the stored salt:hash or raw sha256/text."""
    if not stored_hash:
        return False
    if ":" in stored_hash:
        salt, key = stored_hash.split(":", 1)
        new_key = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), bytes.fromhex(salt), 100000).hex()
        return secrets.compare_digest(key, new_key)
    # Fallback to single sha256 hex digest
    computed = hashlib.sha256(password.encode("utf-8")).hexdigest()
    if secrets.compare_digest(stored_hash, computed):
        return True
    # Fallback to plain text match if seeded without hashing
    return secrets.compare_digest(stored_hash, password)

def generate_session_token() -> str:
    """Generate a secure 64-char hex token for authenticated sessions."""
    return secrets.token_hex(32)

def get_session_expiry(days: int = 14) -> str:
    """Return ISO format string of expiration date."""
    expiry = datetime.now(timezone.utc) + timedelta(days=days)
    return expiry.isoformat()
