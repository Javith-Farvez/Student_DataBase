# Campus360 AI — System Architecture

## 1. Style
Clean Architecture, layered, async-first.

```
Client (React/TS) ──HTTPS──> Nginx ──> FastAPI (Uvicorn/Gunicorn workers)
                                          │
                        ┌─────────────────┼──────────────────┐
                        │                 │                  │
                  API Layer         Service Layer      Background Layer
                 (routers,          (business logic,    (Celery workers:
                  RBAC guards,       orchestration)      face-embedding jobs,
                  request/response                        email/SMS, report gen,
                  schemas)                                 attendance rollups)
                        │                 │                  │
                        └─────────────────┼──────────────────┘
                                          │
                                 Repository Layer
                              (SQLAlchemy 2.0 async,
                               one repo per aggregate)
                                          │
                                  PostgreSQL 16
                                          │
                          Redis (cache, sessions, Celery broker/result backend)
                                          │
                              S3 (documents, photos, face embeddings blob)
```

## 2. Backend layering rules
- `api/` — routers only. No business logic. Validates via Pydantic, calls a service, returns a schema.
- `services/` — business logic, permission checks beyond RBAC (e.g. "faculty can only see own section"), transaction boundaries.
- `repositories/` — pure data access. No business rules. One repository per SQLAlchemy aggregate root.
- `models/` — SQLAlchemy ORM models, 1:1 with DB tables.
- `schemas/` — Pydantic v2 request/response DTOs. Never leak ORM models to the API layer.
- `core/` — config, security (JWT, password hashing), dependency-injection providers, RBAC decorators, exception handlers, logging, rate limiting.
- `ai/` — inference wrappers (face embedding extraction/match, dropout/performance prediction models) — always called via a service, never directly from a router.
- `workers/` — Celery tasks: attendance analytics rollups, email/SES sending, PDF/Excel export generation, face-embedding batch jobs.

## 3. RBAC model
- Permissions are stored as `(role, resource, action)` triples in `role_permissions`, not hardcoded in code.
- A FastAPI dependency `require_permission("students", "read")` resolves the current user's role → checks `role_permissions` (cached in Redis, 5 min TTL) → 403 on failure.
- Row-level scoping (e.g. a Parent can only read their own child, a Faculty only their own section) is enforced in the **service layer**, not the router — RBAC gets you through the door, the service layer decides what you see once inside.

## 4. AuthN/AuthZ flow
1. `POST /auth/login` → verify bcrypt hash → issue short-lived access JWT (15 min) + long-lived refresh JWT (7 days, rotated, stored hashed in `refresh_tokens` table so it can be revoked).
2. Every protected route depends on `get_current_user` → decodes JWT → loads user + role from Redis cache → falls back to DB on cache miss.
3. 2FA (TOTP): on login, if `user.two_factor_enabled`, return a `mfa_required` challenge token instead of full tokens; `/auth/verify-2fa` completes the exchange.
4. Every login attempt (success/fail), password reset, and permission-denied event is written to `audit_logs` and `login_history` — async, via a background task, so it never blocks the request.

## 5. Face recognition pipeline
- Enrollment: admin/office staff uploads student photo → Celery task runs InsightFace to extract a 512-d embedding → embedding is AES-256 encrypted at rest in `face_embeddings.encrypted_vector` → raw photo goes to S3 (private bucket, signed URLs only).
- Attendance capture: classroom camera frame → OpenCV face detection → InsightFace embedding → cosine similarity against enrolled embeddings (loaded per-department into a Redis-cached FAISS/simple in-memory index) → confidence threshold (e.g. 0.62) → match logged to `attendance_face_logs` with confidence score; below threshold → flagged `unknown_person`.
- This never runs synchronously in the request path for bulk jobs — enrollment and re-indexing are Celery tasks; live single-frame recognition during attendance capture is the one synchronous, low-latency path.

## 6. Fingerprint
No matching logic is implemented (per requirement — no simulation). `backend/app/api/v1/biometrics.py` exposes a device-agnostic contract:
- `POST /biometrics/fingerprint/enroll` — accepts a vendor SDK template blob + format identifier, stores it opaquely.
- `POST /biometrics/fingerprint/verify` — accepts a template from the device SDK's own matcher result (device does matching; API just records the verified event), OR proxies to a vendor SDK's REST/gRPC endpoint if configured.
This is intentionally a thin adapter interface so a real SDK (e.g. SecuGen, ZKTeco) can be dropped in later.

## 7. Data protection
- PII at rest: AES-256-GCM via `core/security/crypto.py`, application-level, for: face embeddings, Aadhaar/ID numbers, bank details, medical info.
- Documents: stored in S3 with per-object encryption (SSE-KMS), never public; access via short-lived signed URLs generated only after a service-layer permission check.
- Transport: HTTPS everywhere (terminated at Nginx/CloudFront), HSTS.
- All write endpoints: input validated by Pydantic v2 with strict types; SQL only via parameterized SQLAlchemy (no raw string interpolation); file uploads validated by MIME sniffing + extension allowlist + size cap + antivirus-scan hook (ClamAV via Celery, stubbed as an adapter).

## 8. Deployment topology (AWS-ready)
```
Route53 → CloudFront (static frontend, S3 origin)
                └── /api/* → ALB → ECS/EC2 (FastAPI containers, autoscaled)
                                       ├── RDS PostgreSQL (Multi-AZ)
                                       ├── ElastiCache Redis
                                       ├── S3 (documents/photos)
                                       └── SES (transactional email)
CI/CD: GitHub Actions → build+test → push image to ECR → deploy to ECS
IaC: Terraform modules for VPC, RDS, ECS, S3, IAM (least-privilege per service)
```

## 9. Why this shape
Every module (attendance, fees, library, hostel, transport, placement) follows the same 4-layer pattern, so once you've reviewed one vertical slice (Auth + Students, delivered first), every subsequent module is structurally identical — just new models/schemas/repo/service/router.

---
**Delivery plan (this is a multi-phase build, not one shot):**
1. ✅ Architecture (this doc)
2. ✅ Folder structure
3. ✅ Full DB schema (~50 tables, next file)
4. Backend: Auth + RBAC + Users module (real, runnable)
5. Backend: Student Management module (real, runnable)
6. Frontend: Auth + Dashboard shell
7. Remaining modules — one at a time, in whatever order you want: Attendance, Marks, Fees, Library, Hostel, Transport, Placement, Face Recognition, AI predictions
8. Docker Compose + CI/CD
9. Docs (API/ER/sequence diagrams)

Tell me which module to build first after the schema — I'd suggest Auth+RBAC since everything depends on it.
