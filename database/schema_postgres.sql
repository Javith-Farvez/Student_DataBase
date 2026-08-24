-- ====================================================================
-- VSB SmartCampus Phase 2 — Normalized 20 Table PostgreSQL Schema DDL
-- Developed exclusively for V.S.B ENGINEERING COLLEGE
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    hod VARCHAR(150),
    status VARCHAR(20) DEFAULT 'Active' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. STAFF / USERS ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    role_id VARCHAR(36) REFERENCES roles(id) ON DELETE RESTRICT,
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE SET NULL,
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100),
    photo_url TEXT,
    joining_date VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. PROGRAMS TABLE
CREATE TABLE IF NOT EXISTS programs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    duration_years INT DEFAULT 4 NOT NULL
);

-- 5. SECTIONS TABLE
CREATE TABLE IF NOT EXISTS sections (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id VARCHAR(36) REFERENCES programs(id) ON DELETE CASCADE,
    year INT NOT NULL,
    semester INT NOT NULL,
    name VARCHAR(10) NOT NULL
);

-- 6. STUDENTS CENTRALIZED TABLE
CREATE TABLE IF NOT EXISTS students (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    register_number VARCHAR(50) UNIQUE NOT NULL,
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    admission_number VARCHAR(50) UNIQUE NOT NULL,
    university_number VARCHAR(50),
    full_name VARCHAR(150) NOT NULL,
    photo_url TEXT,
    dob VARCHAR(10) NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10),
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE RESTRICT,
    program_id VARCHAR(36) REFERENCES programs(id) ON DELETE SET NULL,
    section_id VARCHAR(36) REFERENCES sections(id) ON DELETE SET NULL,
    current_year INT DEFAULT 1 NOT NULL,
    current_semester INT DEFAULT 1 NOT NULL,
    batch VARCHAR(20) DEFAULT '2021-2025' NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    father_name VARCHAR(150),
    mother_name VARCHAR(150),
    guardian_name VARCHAR(150),
    parent_phone VARCHAR(20),
    current_address TEXT,
    permanent_address TEXT,
    address_line TEXT,
    village VARCHAR(100),
    city VARCHAR(100),
    district VARCHAR(100),
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    country VARCHAR(100) DEFAULT 'India',
    pincode VARCHAR(20),
    scholarship VARCHAR(100),
    scholarship_details TEXT,
    hosteller BOOLEAN DEFAULT FALSE NOT NULL,
    day_scholar BOOLEAN DEFAULT TRUE NOT NULL,
    hostel_details TEXT,
    bus_route TEXT,
    status VARCHAR(20) DEFAULT 'Active' NOT NULL,
    cgpa FLOAT DEFAULT 0.0 NOT NULL,
    sgpa FLOAT DEFAULT 0.0 NOT NULL,
    department_rank INT DEFAULT 0 NOT NULL,
    arrears_count INT DEFAULT 0 NOT NULL,
    credits_earned INT DEFAULT 0 NOT NULL,
    attendance_percentage FLOAT DEFAULT 100.0 NOT NULL,
    placement_status VARCHAR(50) DEFAULT 'Not Placed' NOT NULL,
    placed_company VARCHAR(150),
    package_offered VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. FACE RECOGNITION EMBEDDINGS TABLE
CREATE TABLE IF NOT EXISTS face_recognition (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    encrypted_face_embedding TEXT NOT NULL,
    capture_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    status VARCHAR(20) DEFAULT 'Active' NOT NULL
);

-- 8. SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS subjects (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_code VARCHAR(20) UNIQUE NOT NULL,
    subject_name VARCHAR(150) NOT NULL,
    semester INT NOT NULL,
    department_id VARCHAR(36) REFERENCES departments(id) ON DELETE RESTRICT,
    credits INT DEFAULT 3 NOT NULL,
    faculty_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    date VARCHAR(10) NOT NULL,
    subject_id VARCHAR(36) REFERENCES subjects(id) ON DELETE CASCADE,
    hour INT DEFAULT 1 NOT NULL,
    faculty_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    attendance_status VARCHAR(20) NOT NULL,
    present BOOLEAN DEFAULT TRUE NOT NULL,
    absent BOOLEAN DEFAULT FALSE NOT NULL,
    od BOOLEAN DEFAULT FALSE NOT NULL,
    medical_leave BOOLEAN DEFAULT FALSE NOT NULL,
    late_entry BOOLEAN DEFAULT FALSE NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 10. INTERNAL MARKS TABLE
CREATE TABLE IF NOT EXISTS internal_marks (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    subject_id VARCHAR(36) REFERENCES subjects(id) ON DELETE CASCADE,
    internal_1 FLOAT DEFAULT 0.0 NOT NULL,
    internal_2 FLOAT DEFAULT 0.0 NOT NULL,
    internal_3 FLOAT DEFAULT 0.0 NOT NULL,
    average FLOAT DEFAULT 0.0 NOT NULL
);

-- 11. ASSIGNMENT MARKS TABLE
CREATE TABLE IF NOT EXISTS assignment_marks (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    subject_id VARCHAR(36) REFERENCES subjects(id) ON DELETE CASCADE,
    assignment_1 FLOAT DEFAULT 0.0 NOT NULL,
    assignment_2 FLOAT DEFAULT 0.0 NOT NULL,
    average FLOAT DEFAULT 0.0 NOT NULL
);

-- 12. SEMESTER MARKS TABLE
CREATE TABLE IF NOT EXISTS semester_marks (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    subject_id VARCHAR(36) REFERENCES subjects(id) ON DELETE CASCADE,
    credits INT DEFAULT 3 NOT NULL,
    grade VARCHAR(5) DEFAULT 'O' NOT NULL,
    marks FLOAT DEFAULT 90.0 NOT NULL,
    result VARCHAR(10) DEFAULT 'PASS' NOT NULL
);

-- 13. SGPA RECORDS TABLE
CREATE TABLE IF NOT EXISTS sgpa_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    sgpa FLOAT DEFAULT 0.0 NOT NULL
);

-- 14. CGPA RECORDS TABLE
CREATE TABLE IF NOT EXISTS cgpa_records (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) REFERENCES students(id) ON DELETE CASCADE,
    cgpa FLOAT DEFAULT 0.0 NOT NULL
);

-- 15. FEES TABLE
CREATE TABLE IF NOT EXISTS fees (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    admission_fee FLOAT DEFAULT 15000.0 NOT NULL,
    tuition_fee FLOAT DEFAULT 85000.0 NOT NULL,
    exam_fee FLOAT DEFAULT 3500.0 NOT NULL,
    bus_fee FLOAT DEFAULT 18000.0 NOT NULL,
    hostel_fee FLOAT DEFAULT 45000.0 NOT NULL,
    scholarship FLOAT DEFAULT 25000.0 NOT NULL,
    balance FLOAT DEFAULT 0.0 NOT NULL,
    payment_status VARCHAR(30) DEFAULT 'Paid' NOT NULL
);

-- 16. HOSTEL TABLE
CREATE TABLE IF NOT EXISTS hostel (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    hostel VARCHAR(100) DEFAULT 'VSB Boys Hostel Block A' NOT NULL,
    room_number VARCHAR(20) DEFAULT '204' NOT NULL,
    block VARCHAR(50) DEFAULT 'Block A' NOT NULL,
    mess_type VARCHAR(50) DEFAULT 'Non-Veg' NOT NULL
);

-- 17. BUS TABLE
CREATE TABLE IF NOT EXISTS bus (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    bus_number VARCHAR(30) DEFAULT 'Route No. 4' NOT NULL,
    driver VARCHAR(100) DEFAULT 'Murugan K' NOT NULL,
    route VARCHAR(150) DEFAULT 'Karur Bus Stand to VSB Campus' NOT NULL,
    pickup_point VARCHAR(150) DEFAULT 'Karur Bus Stand (07:45 AM)' NOT NULL
);

-- 18. PLACEMENT TABLE
CREATE TABLE IF NOT EXISTS placement (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    resume TEXT,
    skills TEXT,
    programming_languages TEXT,
    internships TEXT,
    hackathons TEXT,
    assessment_score FLOAT DEFAULT 95.0 NOT NULL,
    communication_score FLOAT DEFAULT 94.0 NOT NULL,
    technical_score FLOAT DEFAULT 98.0 NOT NULL,
    company VARCHAR(150),
    package VARCHAR(50),
    status VARCHAR(50) DEFAULT 'Placed in Tier-1 Company' NOT NULL
);

-- 19. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(36) UNIQUE REFERENCES students(id) ON DELETE CASCADE,
    mark_10th TEXT,
    mark_12th TEXT,
    transfer_certificate TEXT,
    community_certificate TEXT,
    income_certificate TEXT,
    birth_certificate TEXT,
    medical_certificate TEXT,
    bonafide TEXT,
    internship_certificates TEXT,
    hackathon_certificates TEXT,
    other_certificates TEXT,
    file_path TEXT,
    uploaded_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 20. NOTIFICATIONS, AUDIT LOGS, LOGIN HISTORY & ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    target_role VARCHAR(50) DEFAULT 'ALL' NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details TEXT,
    ip_address VARCHAR(50),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE IF NOT EXISTS login_history (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(36) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT
);

CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(36) NOT NULL,
    activity TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- SEARCH PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_students_reg_no ON students(register_number);
CREATE INDEX IF NOT EXISTS idx_students_roll_no ON students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_name ON students(full_name);
CREATE INDEX IF NOT EXISTS idx_students_dept ON students(department_id);
