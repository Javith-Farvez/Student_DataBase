import hashlib
import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain-text password against a BCrypt hashed password.
    Supports fallback check for legacy SHA256 hashes if any exist.
    """
    if not hashed_password or not plain_password:
        return False
        
    try:
        pw_bytes = plain_password.encode("utf-8")[:72]
        hash_bytes = hashed_password.encode("utf-8")
        if bcrypt.checkpw(pw_bytes, hash_bytes):
            return True
    except Exception:
        pass

    # Legacy SHA256 fallback check
    legacy_sha256 = hashlib.sha256(plain_password.encode("utf-8")).hexdigest()
    if hashed_password == legacy_sha256:
        return True

    return False

def get_password_hash(password: str) -> str:
    """
    Generates a secure BCrypt password hash.
    """
    pw_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pw_bytes, salt).decode("utf-8")

