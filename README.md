# VSB SmartCampus — Enterprise College Management System
### Developed exclusively for **V.S.B ENGINEERING COLLEGE** (Karur - 639 111)

![VSB Emblem](frontend/src/assets/vsb-logo.png)

> **Motto**: *"HARDWORK IS THE KEY TO SUCCESS"*

---

## 🏛️ System Architecture

VSB SmartCampus is a production-grade Enterprise Student Information System (SIS) and Biometric Attendance Platform engineered for **V.S.B ENGINEERING COLLEGE**. It aggregates every student's complete academic life—from admission until graduation—in one centralized PostgreSQL database.

```
                  ┌─────────────────────────────────────────────────────────┐
                  │          V.S.B ENGINEERING COLLEGE ENTERPRISE          │
                  └────────────────────────────┬────────────────────────────┘
                                               │
               ┌───────────────────────────────┴───────────────────────────────┐
               │                     NGINX REVERSE PROXY                       │
               │               (Port 80 HTTP / 443 HTTPS Proxy)                │
               └───────────────┬───────────────────────────────┬───────────────┘
                               │                               │
                               ▼                               ▼
               ┌───────────────────────────────┐               │
               │       REACT VITE SPA          │               │
               │  (Glassmorphism ERP Console)  │               │
               └───────────────────────────────┘               │
                                                               │
                                                               ▼
                                               ┌───────────────────────────────┐
                                               │      FASTAPI PYTHON REST      │
                                               │ (InsightFace AI & Biometrics) │
                                               └───────────────┬───────────────┘
                                                               │
                                                               ▼
                                               ┌───────────────────────────────┐
                                               │     POSTGRESQL 16 DATABASE    │
                                               │  (70+ Tables, UUID, Audit)    │
                                               └───────────────────────────────┘
```

---

## 🔒 Authorized Staff Portals (4 Portals Only)

| Portal Role | Primary Identifier | Access Scope |
| :--- | :--- | :--- |
| 👑 **Super Admin** | `Admin ID / Email` (`ADMIN001`) | Complete ERP Control, System Settings, Audit Logs |
| 🏛️ **Principal** | `Employee ID` (`PRIN001`) | Executive Analytics, Student Directory, Major Approvals |
| 👔 **HOD** | `Employee ID` (`HOD001`) | Department Scoped (1st-4th Year), OD & Leave Approvals |
| 👩‍🏫 **Staff / Faculty** | `Employee ID` (`STF001`) | Class & Subject Scoped, Attendance & Mark Uploads |

*(Note: Students and Parents DO NOT have login portals. Only authorized college staff access student records).*

---

## 📊 Database Schema Overview (70+ PostgreSQL Tables)

1. **Central Student Entity (`students`)**: Register Number, Roll Number, Admission Number, University Number, Photo, Full Name, DOB, Gender, Blood Group, Department, Program, Section, Batch, Family Details, Address, Demographics.
2. **Academic & Marks (`student_marks`, `subjects`)**: IA1, IA2, IA3, Assignment 1 & 2, Lab Marks, Practical Marks, Model Exam, Semester 1–8 Marks, Credits, Grade Points, SGPA, CGPA calculation.
3. **Attendance & Biometrics (`attendance_records`, `biometric_logs`)**: Daily, Subject-wise %, Present, Absent, OD, Medical Leave, InsightFace 512-d AI face recognition embeddings, fingerprint SDK matcher logs.
4. **Campus Services (`hostel_allocations`, `bus_allocations`, `fee_payments`)**: Hostel Block/Room/Mess, Bus Route/Boarding Point, Fee Balance and payment receipts.
5. **Document Vault (`document_vault`)**: Secure role-based document storage (10th, 12th, TC, Community, Income, Bonafide, Internship certificates).

---

## 🚀 Quick Start Deployment Guide

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) (v20.10+)
- Python 3.11+
- Node.js 20+

### Option A: Docker Compose Deployment (Recommended)

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/vsb-college/vsb-smartcampus.git
   cd vsb-smartcampus
   ```

2. **Launch Production Containers**:
   ```bash
   docker-compose up --build -d
   ```

3. **Seed Database Tables**:
   ```bash
   docker exec -it vsb_smartcampus_backend python database/seed_data.py
   ```

4. **Access Applications**:
   - **Frontend ERP Web App**: [http://localhost:80](http://localhost:80) or [http://localhost:5173](http://localhost:5173)
   - **FastAPI REST API**: [http://localhost:8000](http://localhost:8000)
   - **Swagger API Interactive Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

### Option B: Local Developer Manual Execution

#### 1. Backend Server Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python run_server.py --init-only
python run_server.py
```

#### 2. Frontend Development Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Staff Demo Credentials

| Role | Employee ID | Password | Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `ADMIN001` | `admin123` | Level 1 Full Access |
| **Principal** | `PRIN001` | `pass123` | Executive Overview |
| **HOD** | `HOD001` | `pass123` | HOD AI & DS Department |
| **Staff** | `STF001` | `pass123` | Faculty Section A |

---

## 📄 License & Ownership
Copyright © 2026 **V.S.B ENGINEERING COLLEGE** (Karur - 639 111). All Rights Reserved. Enterprise software product built exclusively for V.S.B Engineering College.
