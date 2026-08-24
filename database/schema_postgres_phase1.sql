-- =============================================================================
-- VSB SmartCampus - PostgreSQL Database Schema (Phase 1)
-- Institution: V.S.B ENGINEERING COLLEGE
-- Roles: SUPER_ADMIN, PRINCIPAL, HOD, STAFF
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(50) UNIQUE NOT NULL, -- SUPER_ADMIN, PRINCIPAL, HOD, STAFF
    description TEXT,
    is_system_role BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50) NOT NULL, -- DEPARTMENT, ACADEMIC, STUDENT, MARKS, SYSTEM
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. ROLE_PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS role_permissions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    role_id VARCHAR(36) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id VARCHAR(36) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

-- 4. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code VARCHAR(20) UNIQUE NOT NULL, -- AIDS, CSE, ECE, EEE, MECH, CIVIL, IT
    name VARCHAR(150) NOT NULL,
    hod_name VARCHAR(150),
    status VARCHAR(20) DEFAULT 'Active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. COURSES TABLE
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    department_id VARCHAR(36) NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    degree VARCHAR(50) DEFAULT 'B.E. / B.Tech' NOT NULL,
    duration_years INT DEFAULT 4 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. ACADEMIC YEARS TABLE
CREATE TABLE IF NOT EXISTS academic_years (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    year_code VARCHAR(20) UNIQUE NOT NULL, -- 2025-2026, 2024-2025
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    is_current BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. YEARS TABLE
CREATE TABLE IF NOT EXISTS years (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    year_number INT UNIQUE NOT NULL, -- 1, 2, 3, 4
    name VARCHAR(50) NOT NULL -- 1st Year, 2nd Year, 3rd Year, 4th Year
);

-- 8. SEMESTERS TABLE
CREATE TABLE IF NOT EXISTS semesters (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    year_number INT NOT NULL, -- 1..4
    semester_number INT UNIQUE NOT NULL, -- 1..8
    name VARCHAR(50) NOT NULL
);

-- 9. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    name VARCHAR(10) NOT NULL -- A, B, C
);

-- 10. CLASSES TABLE (Central Class Entity)
CREATE TABLE IF NOT EXISTS classes (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    department_id VARCHAR(36) NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    year_number INT NOT NULL, -- 1, 2, 3, 4
    semester_number INT NOT NULL, -- 1..8
    section_name VARCHAR(10) NOT NULL, -- A, B, C
    academic_year_id VARCHAR(36) REFERENCES academic_years(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_dept_year_sec UNIQUE (department_id, year_number, section_name, academic_year_id)
);

-- 11. USERS / ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    employee_id VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id VARCHAR(36) NOT NULL REFERENCES roles(id),
    department_id VARCHAR(36) REFERENCES departments(id),
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100),
    photo_url TEXT,
    joining_date VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 12. STAFF TABLE
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    department_id VARCHAR(36) NOT NULL REFERENCES departments(id),
    qualification VARCHAR(150),
    experience_years INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 13. STAFF CLASS ASSIGNMENTS (Class Advisor mapping)
CREATE TABLE IF NOT EXISTS staff_class_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    staff_id VARCHAR(36) NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    class_id VARCHAR(36) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    is_class_advisor BOOLEAN DEFAULT FALSE NOT NULL,
    academic_year_id VARCHAR(36) REFERENCES academic_years(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_staff_class UNIQUE (staff_id, class_id, academic_year_id)
);

-- 14. STAFF SUBJECT ASSIGNMENTS (Subject Teacher mapping)
CREATE TABLE IF NOT EXISTS staff_subject_assignments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    staff_id VARCHAR(36) NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    class_id VARCHAR(36) NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_code VARCHAR(50) NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    academic_year_id VARCHAR(36) REFERENCES academic_years(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 15. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    register_number VARCHAR(50) UNIQUE NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    photo_url TEXT,
    dob VARCHAR(10) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    department_id VARCHAR(36) NOT NULL REFERENCES departments(id),
    class_id VARCHAR(36) REFERENCES classes(id),
    current_year INT DEFAULT 1 NOT NULL,
    current_semester INT DEFAULT 1 NOT NULL,
    section_name VARCHAR(10) DEFAULT 'A' NOT NULL,
    batch VARCHAR(20) DEFAULT '2021-2025' NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    father_name VARCHAR(150),
    mother_name VARCHAR(150),
    guardian_name VARCHAR(150),
    parent_phone VARCHAR(20),
    current_address TEXT,
    cgpa DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    sgpa DOUBLE PRECISION DEFAULT 0.0 NOT NULL,
    arrears_count INT DEFAULT 0 NOT NULL,
    attendance_percentage DOUBLE PRECISION DEFAULT 100.0 NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 16. STUDENT CLASS HISTORY TABLE
CREATE TABLE IF NOT EXISTS student_class_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id VARCHAR(36) NOT NULL REFERENCES classes(id),
    academic_year_id VARCHAR(36) REFERENCES academic_years(id),
    year_number INT NOT NULL,
    semester_number INT NOT NULL,
    promoted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 17. STUDENT DEPARTMENT HISTORY TABLE
CREATE TABLE IF NOT EXISTS student_department_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    student_id VARCHAR(36) NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    department_id VARCHAR(36) NOT NULL REFERENCES departments(id),
    start_date DATE NOT NULL,
    end_date DATE,
    reason TEXT
);

-- 18. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 19. LOGIN HISTORY TABLE
CREATE TABLE IF NOT EXISTS login_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    user_id VARCHAR(36) NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT
);

-- =============================================================================
-- INDEXES FOR FAST SEARCH & FILTERING
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(register_number);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
CREATE INDEX IF NOT EXISTS idx_students_year ON students(current_year);
CREATE INDEX IF NOT EXISTS idx_students_sec ON students(section_name);
CREATE INDEX IF NOT EXISTS idx_classes_dept_yr_sec ON classes(department_id, year_number, section_name);
CREATE INDEX IF NOT EXISTS idx_staff_user ON staff(user_id);
CREATE INDEX IF NOT EXISTS idx_staff_dept ON staff(department_id);
CREATE INDEX IF NOT EXISTS idx_staff_assignments ON staff_class_assignments(staff_id, class_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);

-- =============================================================================
-- SEED INITIAL DATA (ROLES & DEPARTMENTS)
-- =============================================================================
INSERT INTO roles (id, name, description) VALUES
('r-admin', 'SUPER_ADMIN', 'Super Admin with complete college control'),
('r-prin', 'PRINCIPAL', 'Principal with institutional-wide access across all departments'),
('r-hod', 'HOD', 'Head of Department restricted to assigned department'),
('r-staff', 'STAFF', 'Faculty member restricted to assigned classes/subjects')
ON CONFLICT (name) DO NOTHING;

INSERT INTO departments (id, code, name, hod_name) VALUES
('d-aids', 'AIDS', 'Artificial Intelligence & Data Science', 'Dr. K. Senthil Kumar'),
('d-cse', 'CSE', 'Computer Science & Engineering', 'Dr. R. Praveen'),
('d-ece', 'ECE', 'Electronics & Communication Engineering', 'Dr. M. Vasudevan'),
('d-eee', 'EEE', 'Electrical & Electronics Engineering', 'Dr. S. Ramesh'),
('d-mech', 'MECH', 'Mechanical Engineering', 'Dr. G. Karthik'),
('d-civil', 'CIVIL', 'Civil Engineering', 'Dr. P. Sundaram'),
('d-it', 'IT', 'Information Technology', 'Dr. N. Balamurugan')
ON CONFLICT (code) DO NOTHING;

INSERT INTO academic_years (id, year_code, start_year, end_year, is_current) VALUES
('ay-2025', '2025-2026', 2025, 2026, TRUE),
('ay-2024', '2024-2025', 2024, 2025, FALSE)
ON CONFLICT (year_code) DO NOTHING;
