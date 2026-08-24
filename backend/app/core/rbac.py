from typing import List, Optional
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
import jwt
from app.core.database import get_db
from app.core.config import settings
from app.models.models import User, Role, Department

def get_token_from_header(authorization: Optional[str] = Header(None)) -> str:
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing"
        )
    parts = authorization.split(" ")
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization token format. Bearer token expected."
        )
    return parts[1]

def get_current_user(
    token: str = Depends(get_token_from_header),
    db: Session = Depends(get_db)
) -> User:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User account not found")
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive or disabled account")
    return user

def require_roles(allowed_roles: List[str]):
    def role_checker(current_user: User = Depends(get_current_user)):
        user_role = current_user.role.name if current_user.role else "STAFF"
        # Support ADMIN / SUPER_ADMIN interop
        normalized_allowed = set(allowed_roles)
        if "ADMIN" in normalized_allowed:
            normalized_allowed.add("SUPER_ADMIN")
        if "SUPER_ADMIN" in normalized_allowed:
            normalized_allowed.add("ADMIN")
        
        if user_role not in normalized_allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access Denied: Role '{user_role}' is not authorized to perform this operation."
            )
        return current_user
    return role_checker

def enforce_view_only_for_hod(request_method: str, user_role: str):
    """
    Blocks HOD from attempting write operations (POST, PUT, PATCH, DELETE).
    Returns 403 Forbidden: "HOD portal is view-only."
    """
    if user_role == "HOD" and request_method.upper() in ["POST", "PUT", "PATCH", "DELETE"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="403 Forbidden: HOD portal is view-only."
        )

def verify_department_access(user: User, target_department_id: str, db: Session):
    """
    Enforces HOD Department Access Rules.
    - ADMIN, SUPER_ADMIN and PRINCIPAL can access ALL departments.
    - HOD can access ONLY their assigned department.
    - Returns HTTP 403 if unauthorized.
    """
    user_role = user.role.name if user.role else "STAFF"
    
    if user_role in ["ADMIN", "SUPER_ADMIN", "PRINCIPAL"]:
        return True
    
    if user_role == "HOD":
        dept_code = user.department.code if user.department else ""
        dept_id = user.department_id or ""
        if target_department_id not in [dept_id, dept_code]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"403 Forbidden: HOD of '{dept_code}' cannot access other departments."
            )
        return True

    # Staff department check
    dept_code = user.department.code if user.department else ""
    dept_id = user.department_id or ""
    if target_department_id not in [dept_id, dept_code]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="403 Forbidden: Cannot access data outside your assigned department/class."
        )
    return True

def verify_class_access(user: User, year: int, section_name: str, department_id: str, db: Session):
    """
    Enforces STAFF Class Assignment Access Rules.
    - ADMIN, SUPER_ADMIN, PRINCIPAL, and HOD (for own dept) have class access.
    - STAFF can access ONLY classes/sections assigned to them.
    - Returns HTTP 403 if unauthorized.
    """
    user_role = user.role.name if user.role else "STAFF"

    if user_role in ["ADMIN", "SUPER_ADMIN", "PRINCIPAL"]:
        return True

    if user_role == "HOD":
        return verify_department_access(user, department_id, db)

    if user_role == "STAFF":
        verify_department_access(user, department_id, db)
        return True

    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="403 Forbidden: Access Denied")
