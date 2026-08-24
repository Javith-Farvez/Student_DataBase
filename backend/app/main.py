import os
from datetime import datetime, timezone
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.core.database import get_db, Base, engine, SessionLocal
from app.core.init_db import init_db
from app.schemas.schemas import HealthCheckResponse
from app.api.v1 import auth, departments, students, phase2_crud, attendance_api, documents_api, face_api, reports_api, sslc_hsc_api, student_portal_api, phase1_navigation_api, academic_records_api, financial_api, certificates_api, role_portals_api, biometrics_api, backup_api, users

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Ensure upload directory exists & mount static route
os.makedirs("uploads/documents", exist_ok=True)
os.makedirs("uploads/certificates", exist_ok=True)
os.makedirs("uploads/photos", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        from app.models.models import User
        if db.query(User).count() == 0:
            init_db()
    except Exception as e:
        print("Startup db verify:", e)
    finally:
        db.close()

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "VSB SmartCampus — Enterprise College Management System API is running!",
        "version": settings.APP_VERSION,
        "docs_url": "http://127.0.0.1:8000/docs",
        "api_v1": settings.API_V1_STR
    }

@app.get("/health", response_model=HealthCheckResponse, tags=["System"])
def health_check(db: Session = Depends(get_db)):
    db_status = "Connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"Error: {e}"

    return HealthCheckResponse(
        status="healthy",
        app_name=settings.APP_NAME,
        version=settings.APP_VERSION,
        database=db_status,
        timestamp=datetime.now(timezone.utc)
    )

# Include API Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(users.router, prefix=settings.API_V1_STR)
app.include_router(departments.router, prefix=settings.API_V1_STR)
app.include_router(students.router, prefix=settings.API_V1_STR)
app.include_router(phase2_crud.router, prefix=settings.API_V1_STR)
app.include_router(attendance_api.router, prefix=settings.API_V1_STR)
app.include_router(documents_api.router, prefix=settings.API_V1_STR)
app.include_router(certificates_api.router, prefix=settings.API_V1_STR)
app.include_router(face_api.router, prefix=settings.API_V1_STR)
app.include_router(reports_api.router, prefix=settings.API_V1_STR)
app.include_router(sslc_hsc_api.router, prefix=settings.API_V1_STR)
app.include_router(student_portal_api.router, prefix=settings.API_V1_STR)
app.include_router(phase1_navigation_api.router, prefix=settings.API_V1_STR)
app.include_router(academic_records_api.router, prefix=settings.API_V1_STR)
app.include_router(financial_api.router, prefix=settings.API_V1_STR)
app.include_router(role_portals_api.router, prefix=settings.API_V1_STR)
app.include_router(biometrics_api.router, prefix=settings.API_V1_STR)
app.include_router(backup_api.router, prefix=settings.API_V1_STR)



