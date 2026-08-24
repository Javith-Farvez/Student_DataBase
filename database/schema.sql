-- ============================================================================
-- Campus360 AI — PostgreSQL Schema (Phase 3)
-- Convention: UUID PKs, snake_case, soft deletes via deleted_at, audit via
-- created_at/updated_at + audit_logs table, FKs indexed, unique constraints
-- where real-world uniqueness applies (register numbers, emails, etc).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";       -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- fuzzy search on names
CREATE EXTENSION IF NOT EXISTS "citext";         -- case-insensitive email/text

-- Generic trigger function to maintain updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 1. IDENTITY & ACCESS
-- ============================================================================

CREATE TABLE roles (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(50) UNIQUE NOT NULL,   -- SUPER_ADMIN, PRINCIPAL, ...
    description     TEXT,
    is_system_role  BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE permissions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource    VARCHAR(100) NOT NULL,             -- 'students', 'fees', ...
    action      VARCHAR(20)  NOT NULL,             -- 'create','read','update','delete','export'
    UNIQUE (resource, action)
);

CREATE TABLE role_permissions (
    role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE departments (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code        VARCHAR(20) UNIQUE NOT NULL,       -- 'CSE','AIDS','ECE'
    name        VARCHAR(150) NOT NULL,
    hod_user_id UUID,                               -- FK added after users table
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ
);

CREATE TABLE users (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email               CITEXT UNIQUE NOT NULL,
    phone               VARCHAR(20) UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    role_id             UUID NOT NULL REFERENCES roles(id),
    department_id       UUID REFERENCES departments(id),
    full_name           VARCHAR(150) NOT NULL,
    is_active           BOOLEAN NOT NULL DEFAULT true,
    is_email_verified   BOOLEAN NOT NULL DEFAULT false,
    two_factor_enabled  BOOLEAN NOT NULL DEFAULT false,
    two_factor_secret   VARCHAR(255),               -- encrypted at app layer
    failed_login_count  SMALLINT NOT NULL DEFAULT 0,
    locked_until        TIMESTAMPTZ,
    last_login_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ
);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_department ON users(department_id);
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();

ALTER TABLE departments ADD CONSTRAINT fk_dept_hod FOREIGN KEY (hod_user_id) REFERENCES users(id);

CREATE TABLE refresh_tokens (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash   VARCHAR(255) NOT NULL,
    is_revoked   BOOLEAN NOT NULL DEFAULT false,
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);

CREATE TABLE login_history (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id) ON DELETE SET NULL,
    email_tried CITEXT NOT NULL,
    ip_address  INET,
    user_agent  TEXT,
    success     BOOLEAN NOT NULL,
    reason      VARCHAR(100),                        -- 'bad_password','locked','mfa_fail',...
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_login_history_user ON login_history(user_id, created_at DESC);

CREATE TABLE audit_logs (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action        VARCHAR(100) NOT NULL,              -- 'STUDENT_UPDATE','FEE_PAYMENT',...
    entity_type   VARCHAR(100) NOT NULL,
    entity_id     UUID,
    before_state  JSONB,
    after_state   JSONB,
    ip_address    INET,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_actor ON audit_logs(actor_user_id, created_at DESC);

CREATE TABLE password_reset_tokens (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(255) NOT NULL,
    expires_at  TIMESTAMPTZ NOT NULL,
    used_at     TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 2. ACADEMIC STRUCTURE
-- ============================================================================

CREATE TABLE programs (                              -- B.Tech, M.Tech, MBA...
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id  UUID NOT NULL REFERENCES departments(id),
    name           VARCHAR(150) NOT NULL,
    duration_years SMALLINT NOT NULL,
    deleted_at     TIMESTAMPTZ
);

CREATE TABLE academic_years (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    label       VARCHAR(20) UNIQUE NOT NULL,          -- '2025-2026'
    start_date  DATE NOT NULL,
    end_date    DATE NOT NULL,
    is_current  BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE sections (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id   UUID NOT NULL REFERENCES programs(id),
    year         SMALLINT NOT NULL,                   -- 1..4
    semester     SMALLINT NOT NULL,                   -- 1..8
    name         VARCHAR(10) NOT NULL,                -- 'A','B'
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    UNIQUE (program_id, year, semester, name, academic_year_id)
);

CREATE TABLE subjects (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code         VARCHAR(30) UNIQUE NOT NULL,
    name         VARCHAR(200) NOT NULL,
    program_id   UUID NOT NULL REFERENCES programs(id),
    semester     SMALLINT NOT NULL,
    credits      NUMERIC(3,1) NOT NULL,
    is_lab       BOOLEAN NOT NULL DEFAULT false,
    deleted_at   TIMESTAMPTZ
);

CREATE TABLE faculty_subject_assignments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id   UUID NOT NULL REFERENCES users(id),
    subject_id   UUID NOT NULL REFERENCES subjects(id),
    section_id   UUID NOT NULL REFERENCES sections(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    UNIQUE (faculty_id, subject_id, section_id, academic_year_id)
);
CREATE INDEX idx_fsa_section ON faculty_subject_assignments(section_id);

-- ============================================================================
-- 3. STUDENTS
-- ============================================================================

CREATE TABLE students (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID UNIQUE REFERENCES users(id),   -- login identity
    register_number     VARCHAR(30) UNIQUE NOT NULL,
    roll_number         VARCHAR(30) NOT NULL,
    admission_number    VARCHAR(30) UNIQUE NOT NULL,
    photo_url           TEXT,
    full_name           VARCHAR(150) NOT NULL,
    dob                 DATE NOT NULL,
    gender              VARCHAR(20) NOT NULL,
    blood_group         VARCHAR(5),
    department_id       UUID NOT NULL REFERENCES departments(id),
    program_id          UUID NOT NULL REFERENCES programs(id),
    section_id          UUID REFERENCES sections(id),
    current_year        SMALLINT NOT NULL,
    current_semester    SMALLINT NOT NULL,
    email               CITEXT,
    phone               VARCHAR(20),
    address_line        TEXT,
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(10),
    emergency_contact_name  VARCHAR(150),
    emergency_contact_phone VARCHAR(20),
    admission_date      DATE NOT NULL DEFAULT CURRENT_DATE,
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE, GRADUATED, DROPPED, SUSPENDED
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE (roll_number, department_id, admission_date)
);
CREATE INDEX idx_students_dept ON students(department_id);
CREATE INDEX idx_students_section ON students(section_id);
CREATE INDEX idx_students_name_trgm ON students USING gin (full_name gin_trgm_ops);
CREATE TRIGGER trg_students_updated BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE parent_guardians (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id     UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    relation_type  VARCHAR(20) NOT NULL,     -- FATHER, MOTHER, GUARDIAN
    full_name      VARCHAR(150) NOT NULL,
    occupation     VARCHAR(150),
    phone          VARCHAR(20),
    email          CITEXT,
    user_id        UUID REFERENCES users(id),  -- parent portal login, nullable
    is_primary_contact BOOLEAN NOT NULL DEFAULT false
);
CREATE INDEX idx_parent_student ON parent_guardians(student_id);

CREATE TABLE student_documents (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    document_type   VARCHAR(50) NOT NULL,   -- TRANSFER_CERT, COMMUNITY_CERT, INCOME_CERT, BONAFIDE, BIRTH_CERT, MEDICAL_CERT, PASSPORT_PHOTO
    file_s3_key      TEXT NOT NULL,
    file_hash_sha256 VARCHAR(64) NOT NULL,
    is_verified      BOOLEAN NOT NULL DEFAULT false,
    verified_by      UUID REFERENCES users(id),
    verified_at      TIMESTAMPTZ,
    uploaded_by      UUID REFERENCES users(id),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at       TIMESTAMPTZ
);
CREATE INDEX idx_docs_student ON student_documents(student_id);

CREATE TABLE student_skills (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    skill_name  VARCHAR(100) NOT NULL,
    proficiency VARCHAR(20)               -- BEGINNER, INTERMEDIATE, ADVANCED
);

CREATE TABLE student_certificates (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    title        VARCHAR(200) NOT NULL,
    issuer       VARCHAR(200),
    issue_date   DATE,
    file_s3_key  TEXT
);

CREATE TABLE scholarships (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    name          VARCHAR(150) NOT NULL,
    amount        NUMERIC(12,2) NOT NULL,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    approved_by   UUID REFERENCES users(id),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING'  -- PENDING, APPROVED, REJECTED
);

-- ============================================================================
-- 4. BIOMETRICS / FACE RECOGNITION
-- ============================================================================

CREATE TABLE face_embeddings (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id       UUID UNIQUE NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    encrypted_vector BYTEA NOT NULL,         -- AES-256-GCM encrypted 512-d embedding
    model_version    VARCHAR(50) NOT NULL,   -- e.g. 'insightface-buffalo_l'
    enrolled_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    enrolled_by      UUID REFERENCES users(id)
);

CREATE TABLE attendance_face_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id      UUID REFERENCES students(id),        -- null if unmatched
    camera_source   VARCHAR(100),
    confidence      NUMERIC(5,4),
    is_unknown      BOOLEAN NOT NULL DEFAULT false,
    captured_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    frame_s3_key    TEXT
);
CREATE INDEX idx_face_logs_student ON attendance_face_logs(student_id, captured_at DESC);

CREATE TABLE fingerprint_templates (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID REFERENCES students(id) ON DELETE CASCADE,
    staff_id      UUID REFERENCES users(id) ON DELETE CASCADE,
    device_vendor VARCHAR(100) NOT NULL,
    template_blob BYTEA NOT NULL,            -- opaque vendor SDK template
    enrolled_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    CHECK (student_id IS NOT NULL OR staff_id IS NOT NULL)
);

-- ============================================================================
-- 5. ATTENDANCE
-- ============================================================================

CREATE TABLE attendance_records (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id    UUID NOT NULL REFERENCES students(id),
    subject_id    UUID REFERENCES subjects(id),           -- null = daily/general attendance
    section_id    UUID NOT NULL REFERENCES sections(id),
    date          DATE NOT NULL,
    status        VARCHAR(20) NOT NULL,     -- PRESENT, ABSENT, LATE, OD, MEDICAL_LEAVE, HOLIDAY
    marked_by     UUID REFERENCES users(id),
    marked_via    VARCHAR(20) NOT NULL DEFAULT 'MANUAL',  -- MANUAL, FACE_RECOGNITION
    remarks       TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, subject_id, date)
);
CREATE INDEX idx_attendance_student_date ON attendance_records(student_id, date);
CREATE INDEX idx_attendance_section_date ON attendance_records(section_id, date);

-- ============================================================================
-- 6. MARKS / EXAMS
-- ============================================================================

CREATE TABLE exams (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name         VARCHAR(150) NOT NULL,       -- 'Internal 1', 'Semester End'
    exam_type    VARCHAR(20) NOT NULL,        -- INTERNAL, EXTERNAL, ASSIGNMENT, LAB
    subject_id   UUID NOT NULL REFERENCES subjects(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    max_marks    NUMERIC(6,2) NOT NULL,
    exam_date    DATE
);

CREATE TABLE marks (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   UUID NOT NULL REFERENCES students(id),
    exam_id      UUID NOT NULL REFERENCES exams(id),
    marks_obtained NUMERIC(6,2) NOT NULL,
    grade        VARCHAR(5),
    entered_by   UUID REFERENCES users(id),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, exam_id)
);
CREATE INDEX idx_marks_student ON marks(student_id);

CREATE TABLE semester_results (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   UUID NOT NULL REFERENCES students(id),
    semester     SMALLINT NOT NULL,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    sgpa         NUMERIC(4,2),
    cgpa         NUMERIC(4,2),
    rank_in_section SMALLINT,
    published_at TIMESTAMPTZ,
    UNIQUE (student_id, semester, academic_year_id)
);

-- ============================================================================
-- 7. FEES
-- ============================================================================

CREATE TABLE fee_structures (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id   UUID NOT NULL REFERENCES programs(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id),
    semester     SMALLINT NOT NULL,
    tuition_fee  NUMERIC(12,2) NOT NULL,
    hostel_fee   NUMERIC(12,2) NOT NULL DEFAULT 0,
    bus_fee      NUMERIC(12,2) NOT NULL DEFAULT 0,
    misc_fee     NUMERIC(12,2) NOT NULL DEFAULT 0,
    UNIQUE (program_id, academic_year_id, semester)
);

CREATE TABLE fee_installments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fee_structure_id  UUID NOT NULL REFERENCES fee_structures(id),
    installment_no    SMALLINT NOT NULL,
    amount            NUMERIC(12,2) NOT NULL,
    due_date          DATE NOT NULL
);

CREATE TABLE fee_payments (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id        UUID NOT NULL REFERENCES students(id),
    fee_installment_id UUID NOT NULL REFERENCES fee_installments(id),
    amount_paid       NUMERIC(12,2) NOT NULL,
    penalty_amount    NUMERIC(12,2) NOT NULL DEFAULT 0,
    payment_gateway_ref VARCHAR(150),
    payment_method    VARCHAR(30),          -- RAZORPAY, CASH, DD
    receipt_number    VARCHAR(50) UNIQUE NOT NULL,
    paid_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    status            VARCHAR(20) NOT NULL DEFAULT 'SUCCESS'  -- SUCCESS, FAILED, REFUNDED
);
CREATE INDEX idx_fee_payments_student ON fee_payments(student_id);

-- ============================================================================
-- 8. LIBRARY
-- ============================================================================

CREATE TABLE library_books (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn          VARCHAR(20),
    barcode       VARCHAR(50) UNIQUE NOT NULL,
    title         VARCHAR(300) NOT NULL,
    author        VARCHAR(200),
    category      VARCHAR(100),
    total_copies  INTEGER NOT NULL DEFAULT 1,
    available_copies INTEGER NOT NULL DEFAULT 1,
    deleted_at    TIMESTAMPTZ
);
CREATE INDEX idx_books_title_trgm ON library_books USING gin (title gin_trgm_ops);

CREATE TABLE library_transactions (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id      UUID NOT NULL REFERENCES library_books(id),
    student_id   UUID REFERENCES students(id),
    staff_id     UUID REFERENCES users(id),
    issued_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    due_date     DATE NOT NULL,
    returned_at  TIMESTAMPTZ,
    fine_amount  NUMERIC(8,2) NOT NULL DEFAULT 0,
    fine_paid    BOOLEAN NOT NULL DEFAULT false,
    CHECK (student_id IS NOT NULL OR staff_id IS NOT NULL)
);
CREATE INDEX idx_lib_txn_book ON library_transactions(book_id);
CREATE INDEX idx_lib_txn_student ON library_transactions(student_id);

-- ============================================================================
-- 9. HOSTEL
-- ============================================================================

CREATE TABLE hostel_blocks (
    id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name     VARCHAR(100) NOT NULL,
    warden_id UUID REFERENCES users(id),
    gender_type VARCHAR(10) NOT NULL       -- MALE, FEMALE, MIXED
);

CREATE TABLE hostel_rooms (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    block_id  UUID NOT NULL REFERENCES hostel_blocks(id),
    room_number VARCHAR(20) NOT NULL,
    capacity  SMALLINT NOT NULL,
    UNIQUE (block_id, room_number)
);

CREATE TABLE hostel_allocations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID NOT NULL REFERENCES students(id),
    room_id     UUID NOT NULL REFERENCES hostel_rooms(id),
    allocated_from DATE NOT NULL,
    allocated_until DATE,
    status      VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
);
CREATE INDEX idx_hostel_alloc_student ON hostel_allocations(student_id);

CREATE TABLE hostel_complaints (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID NOT NULL REFERENCES students(id),
    room_id     UUID REFERENCES hostel_rooms(id),
    category    VARCHAR(50),
    description TEXT NOT NULL,
    status      VARCHAR(20) NOT NULL DEFAULT 'OPEN',   -- OPEN, IN_PROGRESS, RESOLVED
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE TABLE hostel_visitors (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID NOT NULL REFERENCES students(id),
    visitor_name VARCHAR(150) NOT NULL,
    relation    VARCHAR(50),
    check_in_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    check_out_at TIMESTAMPTZ,
    id_proof_type VARCHAR(50)
);

-- ============================================================================
-- 10. TRANSPORT
-- ============================================================================

CREATE TABLE bus_routes (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_name  VARCHAR(150) NOT NULL,
    vehicle_number VARCHAR(30) NOT NULL,
    driver_id   UUID REFERENCES users(id),
    capacity    SMALLINT NOT NULL,
    gps_device_id VARCHAR(100)
);

CREATE TABLE bus_pickup_points (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    route_id    UUID NOT NULL REFERENCES bus_routes(id) ON DELETE CASCADE,
    point_name  VARCHAR(150) NOT NULL,
    sequence_no SMALLINT NOT NULL,
    latitude    NUMERIC(9,6),
    longitude   NUMERIC(9,6)
);

CREATE TABLE bus_allocations (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id   UUID NOT NULL REFERENCES students(id),
    route_id     UUID NOT NULL REFERENCES bus_routes(id),
    pickup_point_id UUID REFERENCES bus_pickup_points(id),
    academic_year_id UUID NOT NULL REFERENCES academic_years(id)
);

CREATE TABLE bus_attendance (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id  UUID NOT NULL REFERENCES students(id),
    route_id    UUID NOT NULL REFERENCES bus_routes(id),
    date        DATE NOT NULL,
    boarded     BOOLEAN NOT NULL DEFAULT false,
    UNIQUE (student_id, date)
);

-- ============================================================================
-- 11. PLACEMENT
-- ============================================================================

CREATE TABLE companies (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(200) NOT NULL,
    industry    VARCHAR(100),
    website     TEXT,
    hr_contact_email CITEXT
);

CREATE TABLE placement_drives (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id  UUID NOT NULL REFERENCES companies(id),
    drive_date  DATE NOT NULL,
    role_offered VARCHAR(150),
    ctc_offered NUMERIC(12,2),
    eligible_programs UUID[],              -- array of program ids
    min_cgpa    NUMERIC(4,2)
);

CREATE TABLE placement_applications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    drive_id    UUID NOT NULL REFERENCES placement_drives(id),
    student_id  UUID NOT NULL REFERENCES students(id),
    resume_s3_key TEXT,
    status      VARCHAR(30) NOT NULL DEFAULT 'APPLIED',  -- APPLIED, SHORTLISTED, INTERVIEWED, OFFERED, REJECTED
    applied_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (drive_id, student_id)
);

CREATE TABLE placement_offers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID UNIQUE NOT NULL REFERENCES placement_applications(id),
    ctc          NUMERIC(12,2) NOT NULL,
    offer_letter_s3_key TEXT,
    offered_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    accepted     BOOLEAN
);

-- ============================================================================
-- 12. AI / ANALYTICS
-- ============================================================================

CREATE TABLE ai_predictions (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id     UUID NOT NULL REFERENCES students(id),
    prediction_type VARCHAR(50) NOT NULL,   -- PERFORMANCE, ATTENDANCE_RISK, DROPOUT_RISK, PLACEMENT
    model_version  VARCHAR(50) NOT NULL,
    score          NUMERIC(6,4) NOT NULL,
    explanation    JSONB,                    -- feature importances for explainability
    predicted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_ai_pred_student ON ai_predictions(student_id, prediction_type);

CREATE TABLE ai_assistant_conversations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id),
    title       VARCHAR(200),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE ai_assistant_messages (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_assistant_conversations(id) ON DELETE CASCADE,
    role            VARCHAR(20) NOT NULL,   -- user, assistant
    content         TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 13. NOTIFICATIONS / SYSTEM
-- ============================================================================

CREATE TABLE notifications (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200) NOT NULL,
    body        TEXT,
    channel     VARCHAR(20) NOT NULL DEFAULT 'IN_APP',  -- IN_APP, EMAIL, SMS
    is_read     BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notif_user ON notifications(user_id, is_read);

CREATE TABLE system_settings (
    key         VARCHAR(100) PRIMARY KEY,
    value       JSONB NOT NULL,
    updated_by  UUID REFERENCES users(id),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Total tables in this file: 49
-- (roles, permissions, role_permissions, departments, users, refresh_tokens,
--  login_history, audit_logs, password_reset_tokens, programs, academic_years,
--  sections, subjects, faculty_subject_assignments, students, parent_guardians,
--  student_documents, student_skills, student_certificates, scholarships,
--  face_embeddings, attendance_face_logs, fingerprint_templates,
--  attendance_records, exams, marks, semester_results, fee_structures,
--  fee_installments, fee_payments, library_books, library_transactions,
--  hostel_blocks, hostel_rooms, hostel_allocations, hostel_complaints,
--  hostel_visitors, bus_routes, bus_pickup_points, bus_allocations,
--  bus_attendance, companies, placement_drives, placement_applications,
--  placement_offers, ai_predictions, ai_assistant_conversations,
--  ai_assistant_messages, notifications, system_settings)
