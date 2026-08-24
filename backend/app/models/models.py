import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Date, ForeignKey, Text, Numeric
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

# 1. DEPARTMENTS TABLE
class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(20), unique=True, nullable=False) # CSE, AIDS, ECE, EEE, MECH, CIVIL, IT
    name = Column(String(150), nullable=False)
    hod = Column(String(150), nullable=True)
    status = Column(String(20), default="Active", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    users = relationship("User", back_populates="department")
    students = relationship("Student", back_populates="department")
    subjects = relationship("Subject", back_populates="department")

# 2. ROLES TABLE
class Role(Base):
    __tablename__ = "roles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False) # SUPER_ADMIN, PRINCIPAL, HOD, STAFF
    description = Column(Text, nullable=True)
    is_system_role = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    users = relationship("User", back_populates="role")

# 3. USERS / STAFF ACCOUNTS TABLE
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    employee_id = Column(String(50), unique=True, nullable=True) # ADMIN001, PRIN001, HOD001, STF001
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=True)
    full_name = Column(String(150), nullable=False)
    designation = Column(String(100), nullable=True)
    photo_url = Column(Text, nullable=True)
    joining_date = Column(String(20), nullable=True)
    status = Column(String(20), default="Active", nullable=False) # Active, Inactive, Suspended
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=True)
    last_login = Column(DateTime, nullable=True)

    role = relationship("Role", back_populates="users")
    department = relationship("Department", back_populates="users")
    students = relationship("Student", back_populates="user")

# 4. PROGRAMS TABLE
class Program(Base):
    __tablename__ = "programs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    name = Column(String(150), nullable=False)
    duration_years = Column(Integer, nullable=False, default=4)

    students = relationship("Student", back_populates="program")

# 5. SECTIONS TABLE
class Section(Base):
    __tablename__ = "sections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    program_id = Column(String(36), ForeignKey("programs.id"), nullable=False)
    year = Column(Integer, nullable=False)
    semester = Column(Integer, nullable=False)
    name = Column(String(10), nullable=False)

    students = relationship("Student", back_populates="section")

# 5D. STAFF CLASS ASSIGNMENTS TABLE
class StaffClassAssignment(Base):
    __tablename__ = "staff_class_assignments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    year = Column(Integer, nullable=False)
    academic_year = Column(String(20), nullable=True)
    semester = Column(Integer, nullable=True)
    section_name = Column(String(10), nullable=False)
    academic_batch = Column(String(20), nullable=True)
    is_class_advisor = Column(Boolean, default=False, nullable=False)
    status = Column(String(20), default="Active", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    user = relationship("User")
    department = relationship("Department")


# 5E. LOGIN HISTORY TABLE
class LoginHistory(Base):
    __tablename__ = "login_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    employee_id = Column(String(50), nullable=True)
    role_name = Column(String(50), nullable=True)
    department_code = Column(String(20), nullable=True)
    login_time = Column(DateTime, default=utc_now, nullable=False)
    logout_time = Column(DateTime, nullable=True)
    ip_address = Column(String(45), nullable=True)
    device_info = Column(String(255), nullable=True)
    is_success = Column(Boolean, default=False, nullable=False)
    failure_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 5F. PASSWORD RESET HISTORY TABLE
class PasswordResetHistory(Base):
    __tablename__ = "password_reset_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    reset_by_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    reset_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 5B. PERMISSIONS TABLE
class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), unique=True, nullable=False)
    module = Column(String(50), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 5C. ROLE PERMISSIONS TABLE
class RolePermission(Base):
    __tablename__ = "role_permissions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    role_id = Column(String(36), ForeignKey("roles.id"), nullable=False)
    permission_id = Column(String(36), ForeignKey("permissions.id"), nullable=False)
    can_read = Column(Boolean, default=True, nullable=False)
    can_write = Column(Boolean, default=False, nullable=False)
    can_delete = Column(Boolean, default=False, nullable=False)

# 6. CENTRALIZED STUDENTS TABLE
class Student(Base):
    __tablename__ = "students"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    register_number = Column(String(50), unique=True, nullable=False)
    roll_number = Column(String(50), unique=True, nullable=False)
    admission_number = Column(String(50), unique=True, nullable=False)
    university_number = Column(String(50), nullable=True)
    full_name = Column(String(150), nullable=False)
    photo_url = Column(Text, nullable=True)
    dob = Column(String(10), nullable=False)
    gender = Column(String(20), nullable=False)
    blood_group = Column(String(10), nullable=True)
    
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    program_id = Column(String(36), ForeignKey("programs.id"), nullable=True)
    section_id = Column(String(36), ForeignKey("sections.id"), nullable=True)
    section_name = Column(String(10), default="A", nullable=True)
    current_year = Column(Integer, default=1, nullable=False)
    current_semester = Column(Integer, default=1, nullable=False)
    batch = Column(String(20), default="2021-2025", nullable=False)
    
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(20), nullable=True)
    father_name = Column(String(150), nullable=True)
    mother_name = Column(String(150), nullable=True)
    guardian_name = Column(String(150), nullable=True)
    parent_phone = Column(String(20), nullable=True)
    
    current_address = Column(Text, nullable=True)
    permanent_address = Column(Text, nullable=True)
    address_line = Column(Text, nullable=True)
    village = Column(String(100), nullable=True)
    city = Column(String(100), nullable=True)
    district = Column(String(100), nullable=True)
    state = Column(String(100), default="Tamil Nadu", nullable=True)
    country = Column(String(100), default="India", nullable=True)
    pincode = Column(String(20), nullable=True)
    nationality = Column(String(50), default="Indian", nullable=True)
    religion = Column(String(50), default="Hindu", nullable=True)
    community = Column(String(50), default="BC", nullable=True)
    
    scholarship = Column(String(100), nullable=True)
    scholarship_details = Column(Text, nullable=True)
    hosteller = Column(Boolean, default=False, nullable=False)
    day_scholar = Column(Boolean, default=True, nullable=False)
    hostel_details = Column(Text, nullable=True)
    bus_route = Column(Text, nullable=True)
    status = Column(String(20), default="Active", nullable=False) # Active, Archived, Transferred, Discontinued, Graduated
    is_active = Column(Boolean, default=True, nullable=False)
    archived_at = Column(DateTime, nullable=True)
    archived_by = Column(String(100), nullable=True)
    archive_reason = Column(Text, nullable=True)

    cgpa = Column(Float, default=0.0, nullable=False)
    sgpa = Column(Float, default=0.0, nullable=False)
    department_rank = Column(Integer, default=0, nullable=False)
    arrears_count = Column(Integer, default=0, nullable=False)
    credits_earned = Column(Integer, default=0, nullable=False)
    attendance_percentage = Column(Float, default=100.0, nullable=False)
    placement_status = Column(String(50), default="Not Placed", nullable=False)
    placed_company = Column(String(150), nullable=True)
    package_offered = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    # Student & Parent Portal Login Credentials
    student_password_hash = Column(String(255), nullable=True)   # Register Number + Password
    parent_password_hash = Column(String(255), nullable=True)    # Parent portal password
    first_login = Column(Boolean, default=True, nullable=False)  # Force password change on first login
    aadhaar_number = Column(String(20), nullable=True)           # Masked by default
    pan_number = Column(String(20), nullable=True)               # Optional
    passport_number = Column(String(30), nullable=True)          # Optional
    driving_licence = Column(String(30), nullable=True)          # Optional
    annual_income = Column(Float, nullable=True)
    parent_email = Column(String(255), nullable=True)
    emergency_contact = Column(String(20), nullable=True)
    caste = Column(String(100), nullable=True)
    mentor = Column(String(150), nullable=True)
    class_advisor = Column(String(150), nullable=True)
    counsellor = Column(String(150), nullable=True)
    academic_year = Column(String(20), nullable=True)

    user = relationship("User", back_populates="students")
    department = relationship("Department", back_populates="students")
    program = relationship("Program", back_populates="students")
    section = relationship("Section", back_populates="students")
    face_data = relationship("FaceRecognition", back_populates="student", uselist=False)
    attendances = relationship("Attendance", back_populates="student")
    internal_marks = relationship("InternalMark", back_populates="student")
    assignment_marks = relationship("AssignmentMark", back_populates="student")
    semester_marks = relationship("SemesterMark", back_populates="student")
    sgpa_records = relationship("SGPARecord", back_populates="student")
    cgpa_records = relationship("CGPARecord", back_populates="student")
    fee_record = relationship("Fee", back_populates="student", uselist=False)
    hostel_record = relationship("Hostel", back_populates="student", uselist=False)
    bus_record = relationship("Bus", back_populates="student", uselist=False)
    placement_record = relationship("Placement", back_populates="student", uselist=False)
    document_record = relationship("Document", back_populates="student", uselist=False)
    sslc_detail = relationship("SSLCDetail", back_populates="student", uselist=False)
    hsc_detail = relationship("HSCDetail", back_populates="student", uselist=False)
    lab_marks = relationship("LabMark", back_populates="student")
    model_exam_marks = relationship("ModelExamMark", back_populates="student")
    leave_requests = relationship("LeaveRequest", back_populates="student")
    od_requests = relationship("ODRequest", back_populates="student")

# 7. FACE RECOGNITION EMBEDDINGS TABLE
class FaceRecognition(Base):
    __tablename__ = "face_recognition"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    encrypted_face_embedding = Column(Text, nullable=False) # InsightFace 512-d encrypted vector
    capture_date = Column(DateTime, default=utc_now, nullable=False)
    last_updated = Column(DateTime, default=utc_now, nullable=False)
    status = Column(String(20), default="Active", nullable=False)

    student = relationship("Student", back_populates="face_data")

# 8. SUBJECTS TABLE
class Subject(Base):
    __tablename__ = "subjects"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    subject_code = Column(String(20), unique=True, nullable=False)
    subject_name = Column(String(150), nullable=False)
    semester = Column(Integer, nullable=False)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    credits = Column(Integer, default=3, nullable=False)
    faculty_id = Column(String(36), ForeignKey("users.id"), nullable=True)

    department = relationship("Department", back_populates="subjects")

# 9. ATTENDANCE TABLE
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    date = Column(String(10), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id"), nullable=True)
    hour = Column(Integer, default=1, nullable=False)
    faculty_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    attendance_status = Column(String(20), nullable=False) # Present, Absent, OD, Medical_Leave, Late_Entry
    present = Column(Boolean, default=True, nullable=False)
    absent = Column(Boolean, default=False, nullable=False)
    od = Column(Boolean, default=False, nullable=False)
    medical_leave = Column(Boolean, default=False, nullable=False)
    late_entry = Column(Boolean, default=False, nullable=False)
    timestamp = Column(DateTime, default=utc_now, nullable=False)

    student = relationship("Student", back_populates="attendances")

# 10. INTERNAL MARKS TABLE
class InternalMark(Base):
    __tablename__ = "internal_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id"), nullable=False)
    internal_1 = Column(Float, default=0.0, nullable=False)
    internal_2 = Column(Float, default=0.0, nullable=False)
    internal_3 = Column(Float, default=0.0, nullable=False)
    average = Column(Float, default=0.0, nullable=False)

    student = relationship("Student", back_populates="internal_marks")

# 11. ASSIGNMENT MARKS TABLE
class AssignmentMark(Base):
    __tablename__ = "assignment_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id"), nullable=False)
    assignment_1 = Column(Float, default=0.0, nullable=False)
    assignment_2 = Column(Float, default=0.0, nullable=False)
    average = Column(Float, default=0.0, nullable=False)

    student = relationship("Student", back_populates="assignment_marks")

# 12. SEMESTER MARKS TABLE
class SemesterMark(Base):
    __tablename__ = "semester_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id"), nullable=True)
    subject_code = Column(String(50), nullable=True)
    subject_name = Column(String(200), nullable=True)
    credits = Column(Float, default=3.0, nullable=False)
    internal_mark = Column(Float, default=45.0, nullable=True)
    semester_exam_mark = Column(Float, default=85.0, nullable=True)
    total_mark = Column(Float, default=90.0, nullable=True)
    grade = Column(String(10), default="O", nullable=False)
    grade_point = Column(Float, default=10.0, nullable=True)
    result = Column(String(10), default="Pass", nullable=False)

    student = relationship("Student", back_populates="semester_marks")

# 13. SGPA RECORDS TABLE
class SGPARecord(Base):
    __tablename__ = "sgpa_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    sgpa = Column(Float, default=0.0, nullable=False)

    student = relationship("Student", back_populates="sgpa_records")

# 14. CGPA RECORDS TABLE
class CGPARecord(Base):
    __tablename__ = "cgpa_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    cgpa = Column(Float, default=0.0, nullable=False)

    student = relationship("Student", back_populates="cgpa_records")

# 15. FEES TABLE
class Fee(Base):
    __tablename__ = "fees"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    admission_fee = Column(Float, default=15000.0, nullable=False)
    tuition_fee = Column(Float, default=85000.0, nullable=False)
    exam_fee = Column(Float, default=3500.0, nullable=False)
    bus_fee = Column(Float, default=18000.0, nullable=False)
    hostel_fee = Column(Float, default=45000.0, nullable=False)
    scholarship = Column(Float, default=25000.0, nullable=False)
    paid_amount = Column(Float, default=141500.0, nullable=True)
    balance = Column(Float, default=0.0, nullable=False)
    payment_status = Column(String(30), default="Paid", nullable=False)
    receipt_number = Column(String(100), nullable=True)

    student = relationship("Student", back_populates="fee_record")

# 16. HOSTEL TABLE
class Hostel(Base):
    __tablename__ = "hostel"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    hostel = Column(String(100), default="VSB Boys Hostel Block A", nullable=False)
    room_number = Column(String(20), default="204", nullable=False)
    block = Column(String(50), default="Block A", nullable=False)
    mess_type = Column(String(50), default="Non-Veg", nullable=False)

    student = relationship("Student", back_populates="hostel_record")

# 17. BUS TABLE
class Bus(Base):
    __tablename__ = "bus"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    bus_number = Column(String(30), default="Route No. 4", nullable=False)
    driver = Column(String(100), default="Murugan K", nullable=False)
    route = Column(String(150), default="Karur Bus Stand to VSB Campus", nullable=False)
    pickup_point = Column(String(150), default="Karur Bus Stand (07:45 AM)", nullable=False)

    student = relationship("Student", back_populates="bus_record")

# 18. PLACEMENT TABLE
class Placement(Base):
    __tablename__ = "placement"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    resume = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)
    programming_languages = Column(Text, nullable=True)
    internships = Column(Text, nullable=True)
    hackathons = Column(Text, nullable=True)
    assessment_score = Column(Float, default=95.0, nullable=False)
    communication_score = Column(Float, default=94.0, nullable=False)
    technical_score = Column(Float, default=98.0, nullable=False)
    company = Column(String(150), nullable=True)
    package = Column(String(50), nullable=True)
    status = Column(String(50), default="Placed in Tier-1 Company", nullable=False)

    student = relationship("Student", back_populates="placement_record")

# 19. DOCUMENTS TABLE
class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    mark_10th = Column(Text, nullable=True)
    mark_12th = Column(Text, nullable=True)
    transfer_certificate = Column(Text, nullable=True)
    community_certificate = Column(Text, nullable=True)
    income_certificate = Column(Text, nullable=True)
    birth_certificate = Column(Text, nullable=True)
    medical_certificate = Column(Text, nullable=True)
    bonafide = Column(Text, nullable=True)
    internship_certificates = Column(Text, nullable=True)
    hackathon_certificates = Column(Text, nullable=True)
    other_certificates = Column(Text, nullable=True)
    file_path = Column(Text, nullable=True)
    uploaded_date = Column(DateTime, default=utc_now, nullable=False)

    student = relationship("Student", back_populates="document_record")

# 20. NOTIFICATIONS, AUDIT, LOGIN & ACTIVITY LOGS TABLES
class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    target_role = Column(String(50), default="ALL", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False)



# 21. BIOMETRIC FINGERPRINT TABLE (Biometric SDK Integration Abstraction)
class BiometricFingerprint(Base):
    __tablename__ = "biometric_fingerprints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    finger_index = Column(String(20), default="Right_Index", nullable=False) # Thumb, Index, Middle, etc.
    template_data = Column(Text, nullable=False) # Base64 / Encrypted ISO template string from device SDK
    device_model = Column(String(100), nullable=True) # Morpho, SecuGen, Mantra, DigitalPersona
    status = Column(String(20), default="Active", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 22. GRANULAR DOCUMENT ITEM VAULT TABLE
class StudentDocumentItem(Base):
    __tablename__ = "student_document_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    document_type = Column(String(50), nullable=False) # mark_10th, mark_12th, tc, community, income, birth, medical, bonafide, passport_photo, internship, hackathon, sports, course, other
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False) # Storage path or S3 key
    file_size_bytes = Column(Integer, default=0, nullable=False)
    mime_type = Column(String(100), default="application/pdf", nullable=False)
    version = Column(Integer, default=1, nullable=False)
    uploaded_by = Column(String(100), nullable=True)
    uploaded_at = Column(DateTime, default=utc_now, nullable=False)


# 23. SSLC (10th Standard) ACADEMIC DETAILS TABLE
class SSLCDetail(Base):
    __tablename__ = "sslc_details"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, unique=True)

    # School & Board Info
    school_name = Column(String(255), nullable=True)
    board = Column(String(100), nullable=True)         # State Board, CBSE, ICSE, Matric
    passing_year = Column(Integer, nullable=True)
    register_number = Column(String(100), nullable=True)

    # Overall
    total_marks = Column(Float, nullable=True)          # Max typically 500
    max_marks = Column(Float, default=500.0, nullable=True)
    percentage = Column(Float, nullable=True)

    # Subject-wise Marks (out of 100 each)
    tamil = Column(Float, nullable=True)
    english = Column(Float, nullable=True)
    mathematics = Column(Float, nullable=True)
    science = Column(Float, nullable=True)
    social_science = Column(Float, nullable=True)
    optional_subject = Column(String(100), nullable=True)  # Optional 6th subject name
    optional_marks = Column(Float, nullable=True)

    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    student = relationship("Student", back_populates="sslc_detail")


# 24. HSC (12th Standard) ACADEMIC DETAILS TABLE
class HSCDetail(Base):
    __tablename__ = "hsc_details"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id", ondelete="CASCADE"), nullable=False, unique=True)

    # School & Board Info
    school_name = Column(String(255), nullable=True)
    board = Column(String(100), nullable=True)          # State Board, CBSE, ICSE, Matric
    passing_year = Column(Integer, nullable=True)
    register_number = Column(String(100), nullable=True)

    # Stream
    stream = Column(String(50), default="Science", nullable=True)  # Science / Commerce / Arts

    # Overall
    total_marks = Column(Float, nullable=True)           # Max typically 600
    max_marks = Column(Float, default=600.0, nullable=True)
    percentage = Column(Float, nullable=True)
    cutoff = Column(Float, nullable=True)                # Out of 200

    # Subject-wise Marks (out of 100 each)
    physics = Column(Float, nullable=True)
    chemistry = Column(Float, nullable=True)
    mathematics = Column(Float, nullable=True)
    biology = Column(Float, nullable=True)               # Biology OR Computer Science
    computer_science = Column(Float, nullable=True)      # if CS stream
    language1 = Column(Float, nullable=True)             # Tamil/Hindi etc.
    language2 = Column(Float, nullable=True)             # English

    bio_cs_subject = Column(String(50), default="Biology", nullable=True)  # "Biology" or "Computer Science"

    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)

    student = relationship("Student", back_populates="hsc_detail")


# 25. LAB MARKS TABLE
class LabMark(Base):
    __tablename__ = "lab_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id"), nullable=True)
    semester = Column(Integer, nullable=False, default=1)
    lab_name = Column(String(150), nullable=True)
    cycle_test_1 = Column(Float, default=0.0, nullable=True)
    cycle_test_2 = Column(Float, default=0.0, nullable=True)
    viva = Column(Float, default=0.0, nullable=True)
    record = Column(Float, default=0.0, nullable=True)
    total = Column(Float, default=0.0, nullable=True)
    max_marks = Column(Float, default=100.0, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    student = relationship("Student", back_populates="lab_marks")


# 26. MODEL EXAM MARKS TABLE
class ModelExamMark(Base):
    __tablename__ = "model_exam_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    subject_id = Column(String(36), ForeignKey("subjects.id"), nullable=True)
    semester = Column(Integer, nullable=False, default=1)
    subject_name = Column(String(150), nullable=True)
    marks_obtained = Column(Float, default=0.0, nullable=True)
    max_marks = Column(Float, default=100.0, nullable=True)
    grade = Column(String(5), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

    student = relationship("Student", back_populates="model_exam_marks")


# 27. STUDENT LEAVE REQUEST TABLE
class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    from_date = Column(String(10), nullable=False)
    to_date = Column(String(10), nullable=False)
    reason = Column(Text, nullable=False)
    leave_type = Column(String(30), default="Medical", nullable=False)  # Medical, Personal, Emergency
    status = Column(String(20), default="Pending", nullable=False)      # Pending, Approved, Rejected
    approved_by = Column(String(100), nullable=True)
    faculty_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, nullable=False)

    student = relationship("Student", back_populates="leave_requests")


# 28. OD (ON DUTY) REQUEST TABLE
class ODRequest(Base):
    __tablename__ = "od_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    from_date = Column(String(10), nullable=False)
    to_date = Column(String(10), nullable=False)
    event_name = Column(String(200), nullable=False)
    event_type = Column(String(50), default="Symposium", nullable=False)  # Symposium, Hackathon, Sports, Cultural
    venue = Column(String(200), nullable=True)
    reason = Column(Text, nullable=True)
    status = Column(String(20), default="Pending", nullable=False)         # Pending, Approved, Rejected
    approved_by = Column(String(100), nullable=True)
    faculty_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, nullable=False)

    student = relationship("Student", back_populates="od_requests")


# 29. STUDENT CLASS & YEAR PROMOTION HISTORY TABLE
class StudentClassHistory(Base):
    __tablename__ = "student_class_history"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    from_year = Column(Integer, nullable=False)
    to_year = Column(Integer, nullable=False)
    from_section = Column(String(10), nullable=True)
    to_section = Column(String(10), nullable=True)
    changed_by = Column(String(100), nullable=True)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 30. CERTIFICATE ITEMS TABLE
class CertificateItem(Base):
    __tablename__ = "certificate_items"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    name = Column(String(200), nullable=False)
    type = Column(String(100), nullable=False)  # Hackathon, Workshop, Internship, Sports, NSS, NCC, Course, Academic, etc.
    issued_by = Column(String(200), nullable=True)
    issue_date = Column(String(20), nullable=True)
    certificate_number = Column(String(100), nullable=True)
    achievement = Column(String(200), nullable=True)
    participation_status = Column(String(50), default="Participation", nullable=True)  # Participation, Winner, Runner-up
    position = Column(String(50), nullable=True)
    level = Column(String(50), nullable=True)  # National, State, College, International
    description = Column(Text, nullable=True)
    file_path = Column(Text, nullable=True)
    file_name = Column(String(255), nullable=True)
    file_type = Column(String(50), nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    version = Column(Integer, default=1, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)
    uploaded_by = Column(String(100), default="Staff", nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 30B. CERTIFICATE VERSION TABLE
class CertificateVersion(Base):
    __tablename__ = "certificate_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    certificate_id = Column(String(36), ForeignKey("certificate_items.id"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    name = Column(String(200), nullable=True)
    type = Column(String(100), nullable=True)
    issued_by = Column(String(200), nullable=True)
    issue_date = Column(String(20), nullable=True)
    certificate_number = Column(String(100), nullable=True)
    achievement = Column(String(200), nullable=True)
    file_name = Column(String(255), nullable=True)
    file_path = Column(Text, nullable=True)
    file_size_bytes = Column(Integer, nullable=True)
    uploaded_by = Column(String(100), default="Staff", nullable=True)
    reason_for_replacement = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 31. ARREAR RECORD TABLE
class ArrearRecord(Base):
    __tablename__ = "arrears"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    subject_type = Column(String(50), default="Theory", nullable=False)
    credits = Column(Float, default=3.0, nullable=False)
    original_mark = Column(Float, default=35.0, nullable=False)
    grade = Column(String(10), default="U", nullable=False)
    failure_reason = Column(Text, nullable=True)
    attempt_number = Column(Integer, default=1, nullable=False)
    arrear_status = Column(String(30), default="Pending", nullable=False)  # Pending, Cleared, Absent
    exam_date = Column(String(20), nullable=True)
    result_date = Column(String(20), nullable=True)
    cleared_date = Column(String(20), nullable=True)
    cleared_mark = Column(Float, nullable=True)
    cleared_grade = Column(String(10), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 32. ARREAR ATTEMPTS TABLE
class ArrearAttempt(Base):
    __tablename__ = "arrear_attempts"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    arrear_id = Column(String(36), ForeignKey("arrears.id"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    attempt_number = Column(Integer, nullable=False)
    exam_date = Column(String(20), nullable=True)
    mark_obtained = Column(Float, nullable=False)
    grade = Column(String(10), nullable=False)
    result = Column(String(20), default="Fail", nullable=False)  # Pass, Fail
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 33. INTERNSHIP RECORDS TABLE
class InternshipRecord(Base):
    __tablename__ = "internships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    company_name = Column(String(200), nullable=False)
    role = Column(String(100), nullable=False)
    internship_type = Column(String(50), default="Industrial", nullable=False)  # Industrial, Academic, Virtual
    start_date = Column(String(20), nullable=True)
    end_date = Column(String(20), nullable=True)
    duration = Column(String(50), nullable=True)
    technology = Column(String(200), nullable=True)
    description = Column(Text, nullable=True)
    certificate_file = Column(Text, nullable=True)
    verification_status = Column(String(30), default="Verified", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 34. HACKATHON RECORDS TABLE
class HackathonRecord(Base):
    __tablename__ = "hackathons"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    hackathon_name = Column(String(200), nullable=False)
    organizer = Column(String(200), nullable=False)
    date = Column(String(20), nullable=True)
    level = Column(String(50), default="National", nullable=False)  # College, District, State, National, International
    participation_status = Column(String(50), default="Winner", nullable=False)  # Participation, Winner, Runner-up
    position = Column(String(50), nullable=True)
    prize = Column(String(100), nullable=True)
    team_name = Column(String(100), nullable=True)
    project_name = Column(String(200), nullable=True)
    certificate_file = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 35. ACADEMIC AUDIT LOGS TABLE
class AcademicAuditLog(Base):
    __tablename__ = "academic_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    module = Column(String(100), nullable=False)
    semester = Column(Integer, nullable=True)
    subject_code = Column(String(50), nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=False)
    updated_by = Column(String(100), nullable=False)
    role = Column(String(50), default="STAFF", nullable=False)
    reason = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 36. DOCUMENT VERSION HISTORY TABLE
class DocumentVersion(Base):
    __tablename__ = "document_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("student_document_items.id"), nullable=False)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    version_number = Column(Integer, nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size_bytes = Column(Integer, default=0, nullable=False)
    uploaded_by = Column(String(100), nullable=True)
    uploaded_at = Column(DateTime, default=utc_now, nullable=False)
    reason_for_replacement = Column(Text, nullable=True)


# 37. DOCUMENT ACCESS & AUDIT LOG TABLE
class DocumentAccessLog(Base):
    __tablename__ = "document_access_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), nullable=True)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    action = Column(String(50), nullable=False)  # VIEW, PREVIEW, DOWNLOAD, UPLOAD, REPLACE, VERIFY, REJECT, DELETE
    user_id = Column(String(100), nullable=False)
    role = Column(String(50), default="STAFF", nullable=False)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=utc_now, nullable=False)


# 38. SCHOLARSHIP DETAILS TABLE
class ScholarshipDetail(Base):
    __tablename__ = "scholarship_details"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    scholarship_name = Column(String(200), nullable=False)
    scholarship_type = Column(String(100), default="Government First Graduate", nullable=False)
    scholarship_category = Column(String(100), default="BC/MBC Welfare", nullable=False)
    scholarship_provider = Column(String(200), default="Government of Tamil Nadu", nullable=False)
    academic_year = Column(String(20), default="2024-2025", nullable=False)
    eligibility_status = Column(String(50), default="Eligible", nullable=False)
    application_number = Column(String(100), nullable=True)
    application_date = Column(String(20), nullable=True)
    approval_date = Column(String(20), nullable=True)
    amount = Column(Float, default=25000.0, nullable=False)
    renewal_status = Column(String(50), default="Renewed", nullable=False)
    renewal_date = Column(String(20), nullable=True)
    application_status = Column(String(50), default="Approved", nullable=False)  # Pending, Submitted, Approved, Rejected, Renewed
    document_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 39. FIRST GRADUATE DETAILS TABLE
class FirstGraduateDetail(Base):
    __tablename__ = "first_graduate_details"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    is_first_graduate = Column(Boolean, default=True, nullable=False)
    certificate_number = Column(String(100), nullable=True)
    issue_date = Column(String(20), nullable=True)
    eligibility_status = Column(String(50), default="Eligible", nullable=False)
    verification_status = Column(String(50), default="Verified", nullable=False)
    scholarship_name = Column(String(200), default="First Graduate Tuition Fee Waiver", nullable=True)
    academic_year = Column(String(20), default="2024-2025", nullable=True)
    amount = Column(Float, default=25000.0, nullable=True)
    approval_status = Column(String(50), default="Approved", nullable=True)
    document_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 40. NATIVITY DETAILS TABLE
class NativityDetail(Base):
    __tablename__ = "nativity_details"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    native_state = Column(String(100), default="Tamil Nadu", nullable=False)
    native_district = Column(String(100), default="Karur", nullable=False)
    native_taluk = Column(String(100), default="Karur", nullable=False)
    native_village = Column(String(100), default="Thanthonimalai", nullable=False)
    native_city = Column(String(100), default="Karur", nullable=False)
    native_pincode = Column(String(20), default="639005", nullable=False)
    permanent_native_address = Column(Text, nullable=True)
    nativity_status = Column(String(50), default="Native of Tamil Nadu", nullable=False)
    certificate_number = Column(String(100), nullable=True)
    issue_date = Column(String(20), nullable=True)
    verification_status = Column(String(50), default="Verified", nullable=False)
    document_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 41. DYNAMIC INTERNAL ASSESSMENT ENTRY TABLE (Internal 1, Internal 2)
class InternalAssessmentEntry(Base):
    __tablename__ = "internal_assessment_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    assessment_type = Column(String(30), nullable=False)  # Internal_1, Internal_2
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    maximum_mark = Column(Float, default=50.0, nullable=False)
    obtained_mark = Column(Float, default=0.0, nullable=False)
    converted_mark = Column(Float, default=0.0, nullable=False)  # (Obtained / Max) * 100
    exam_date = Column(String(20), nullable=True)
    faculty_name = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 42. DYNAMIC ASSIGNMENT ASSESSMENT ENTRY TABLE (Assignment 1, Assignment 2)
class AssignmentAssessmentEntry(Base):
    __tablename__ = "assignment_assessment_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    assessment_type = Column(String(30), nullable=False)  # Assignment_1, Assignment_2
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    maximum_mark = Column(Float, default=100.0, nullable=False)
    obtained_mark = Column(Float, default=0.0, nullable=False)
    submission_date = Column(String(20), nullable=True)
    faculty_name = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 43. DYNAMIC LAB MARK ENTRY TABLE
class LabMarkEntry(Base):
    __tablename__ = "lab_mark_entries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    lab_code = Column(String(50), nullable=False)
    lab_name = Column(String(200), nullable=False)
    credits = Column(Float, default=2.0, nullable=False)
    internal_practical_mark = Column(Float, default=0.0, nullable=False)
    record_observation_mark = Column(Float, default=0.0, nullable=False)
    practical_exam_mark = Column(Float, default=0.0, nullable=False)
    viva_mark = Column(Float, default=0.0, nullable=False)
    assignment_mark = Column(Float, default=0.0, nullable=False)
    maximum_mark = Column(Float, default=100.0, nullable=False)
    obtained_mark = Column(Float, default=0.0, nullable=False)
    total_mark = Column(Float, default=0.0, nullable=False)
    grade = Column(String(10), default="O", nullable=False)
    grade_point = Column(Float, default=10.0, nullable=False)
    result = Column(String(10), default="Pass", nullable=False)
    arrear_status = Column(String(20), default="None", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 44. ASSESSMENT CONFIGURATION ENGINE TABLE
class AssessmentConfiguration(Base):
    __tablename__ = "assessment_configurations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    regulation = Column(String(50), default="2021", nullable=False)
    department_code = Column(String(20), default="AIDS", nullable=False)
    internal_1_weight = Column(Float, default=25.0, nullable=False)
    internal_2_weight = Column(Float, default=25.0, nullable=False)
    assignment_1_weight = Column(Float, default=25.0, nullable=False)
    assignment_2_weight = Column(Float, default=25.0, nullable=False)
    internal_max_mark = Column(Float, default=50.0, nullable=False)
    assignment_max_mark = Column(Float, default=100.0, nullable=False)
    internal_component_percent = Column(Float, default=40.0, nullable=False)
    semester_exam_component_percent = Column(Float, default=60.0, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 45. INTERNAL 1 MARKS TABLE
class Internal1Mark(Base):
    __tablename__ = "internal_1_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    maximum_mark = Column(Float, default=50.0, nullable=False)
    obtained_mark = Column(Float, default=0.0, nullable=False)
    converted_mark = Column(Float, default=0.0, nullable=False)  # (obtained / max) * 100
    exam_date = Column(String(20), nullable=True)
    faculty_name = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 46. INTERNAL 2 MARKS TABLE
class Internal2Mark(Base):
    __tablename__ = "internal_2_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    maximum_mark = Column(Float, default=50.0, nullable=False)
    obtained_mark = Column(Float, default=0.0, nullable=False)
    converted_mark = Column(Float, default=0.0, nullable=False)  # (obtained / max) * 100
    exam_date = Column(String(20), nullable=True)
    faculty_name = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 47. ASSIGNMENT MARKS TABLE (Assignments 1 & 2)
class AssignmentDetailMark(Base):
    __tablename__ = "assignment_detail_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    maximum_mark = Column(Float, default=100.0, nullable=False)
    assignment_1_obtained = Column(Float, default=0.0, nullable=False)
    assignment_2_obtained = Column(Float, default=0.0, nullable=False)
    assignment_average = Column(Float, default=0.0, nullable=False)  # (a1 + a2) / 2
    submission_date = Column(String(20), nullable=True)
    faculty_name = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 48. SEMESTER THEORY SUBJECT MARKS TABLE
class SemesterTheorySubjectMark(Base):
    __tablename__ = "semester_subject_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    credits = Column(Float, default=3.0, nullable=False)
    internal_mark = Column(Float, default=0.0, nullable=False)
    semester_exam_mark = Column(Float, default=0.0, nullable=False)
    maximum_semester_mark = Column(Float, default=100.0, nullable=False)
    total_mark = Column(Float, default=0.0, nullable=False)
    grade = Column(String(10), default="O", nullable=False)
    grade_point = Column(Float, default=10.0, nullable=False)
    result = Column(String(10), default="Pass", nullable=False)
    arrear_status = Column(String(30), default="None", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 49. ASSIGNMENT 1 MARKS TABLE
class Assignment1Mark(Base):
    __tablename__ = "assignment_1_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    maximum_mark = Column(Float, default=100.0, nullable=False)
    obtained_mark = Column(Float, default=0.0, nullable=False)
    submission_date = Column(String(20), nullable=True)
    faculty_name = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 50. ASSIGNMENT 2 MARKS TABLE
class Assignment2Mark(Base):
    __tablename__ = "assignment_2_marks"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    maximum_mark = Column(Float, default=100.0, nullable=False)
    obtained_mark = Column(Float, default=0.0, nullable=False)
    submission_date = Column(String(20), nullable=True)
    faculty_name = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 51. SUBJECT RESULTS TABLE
class SubjectResult(Base):
    __tablename__ = "subject_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    subject_code = Column(String(50), nullable=False)
    subject_name = Column(String(200), nullable=False)
    subject_type = Column(String(50), default="Theory", nullable=False)
    credits = Column(Float, default=3.0, nullable=False)
    internal_mark = Column(Float, default=0.0, nullable=False)
    exam_mark = Column(Float, default=0.0, nullable=False)
    total_mark = Column(Float, default=0.0, nullable=False)
    grade = Column(String(10), default="O", nullable=False)
    grade_point = Column(Float, default=10.0, nullable=False)
    result = Column(String(10), default="Pass", nullable=False)
    arrear_status = Column(String(30), default="None", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 52. SEMESTER RESULTS TABLE
class SemesterResult(Base):
    __tablename__ = "semester_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    total_subjects = Column(Integer, default=0, nullable=False)
    theory_subjects = Column(Integer, default=0, nullable=False)
    lab_subjects = Column(Integer, default=0, nullable=False)
    total_credits = Column(Float, default=0.0, nullable=False)
    credits_earned = Column(Float, default=0.0, nullable=False)
    passed_count = Column(Integer, default=0, nullable=False)
    failed_count = Column(Integer, default=0, nullable=False)
    arrears_count = Column(Integer, default=0, nullable=False)
    sgpa = Column(Float, default=0.0, nullable=False)
    status = Column(String(50), default="Completed", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 53. SGPA RESULTS TABLE
class SGPAResult(Base):
    __tablename__ = "sgpa_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False)
    sgpa = Column(Float, default=0.0, nullable=False)
    total_credits = Column(Float, default=0.0, nullable=False)
    credits_earned = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 54. CGPA RESULTS TABLE
class CGPAResult(Base):
    __tablename__ = "cgpa_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    cgpa = Column(Float, default=0.0, nullable=False)
    completed_semesters = Column(Integer, default=0, nullable=False)
    total_credits_earned = Column(Float, default=0.0, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 55. STUDENT FEE PROFILE (Quota & Category) TABLE
class StudentFeeProfile(Base):
    __tablename__ = "student_fee_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, unique=True)
    quota_category = Column(String(50), default="Government Quota", nullable=False) # Government Quota, Management Quota, Other / Special Category
    quota_details = Column(Text, nullable=True)
    approval_number = Column(String(100), nullable=True)
    approval_date = Column(String(20), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 56. YEAR-WISE FEE RECORDS TABLE (1st, 2nd, 3rd, 4th Year)
class StudentFeeRecord(Base):
    __tablename__ = "student_fee_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    year = Column(Integer, nullable=False) # 1, 2, 3, 4
    academic_year = Column(String(20), nullable=False) # e.g. 2024-2025
    
    tuition_fee = Column(Float, default=0.0, nullable=False)
    admission_fee = Column(Float, default=0.0, nullable=False)
    university_fee = Column(Float, default=0.0, nullable=False)
    exam_fee = Column(Float, default=0.0, nullable=False)
    lab_fee = Column(Float, default=0.0, nullable=False)
    library_fee = Column(Float, default=0.0, nullable=False)
    development_fee = Column(Float, default=0.0, nullable=False)
    sports_fee = Column(Float, default=0.0, nullable=False)
    placement_fee = Column(Float, default=0.0, nullable=False)
    other_college_fee = Column(Float, default=0.0, nullable=False)
    bus_fee = Column(Float, default=0.0, nullable=False)
    hostel_fee = Column(Float, default=0.0, nullable=False)
    mess_fee = Column(Float, default=0.0, nullable=False)
    special_fee = Column(Float, default=0.0, nullable=False)

    scholarship_amount = Column(Float, default=0.0, nullable=False)
    waiver_amount = Column(Float, default=0.0, nullable=False)
    
    total_fee = Column(Float, default=0.0, nullable=False)
    paid_amount = Column(Float, default=0.0, nullable=False)
    pending_amount = Column(Float, default=0.0, nullable=False)
    payment_status = Column(String(30), default="Pending", nullable=False) # Not Due, Pending, Partially Paid, Paid, Waived, Scholarship Covered, Refunded, Cancelled
    
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 57. SEMESTER-WISE FEE RECORDS TABLE (Sem 1 to Sem 8)
class SemesterFeeRecord(Base):
    __tablename__ = "semester_fee_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    semester = Column(Integer, nullable=False) # 1 to 8
    academic_year = Column(String(20), nullable=False)
    fee_type = Column(String(100), default="Tuition Fee", nullable=False)
    amount = Column(Float, default=0.0, nullable=False)
    due_date = Column(String(20), nullable=True)
    paid_amount = Column(Float, default=0.0, nullable=False)
    balance = Column(Float, default=0.0, nullable=False)
    payment_status = Column(String(30), default="Pending", nullable=False)
    payment_date = Column(String(20), nullable=True)
    receipt_number = Column(String(100), nullable=True)
    receipt_document = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 58. CONFIGURABLE FEE TYPES TABLE
class FeeType(Base):
    __tablename__ = "fee_types"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(50), default="Academic", nullable=False)
    default_amount = Column(Float, default=0.0, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 59. FEE PAYMENTS LOG TABLE
class FeePayment(Base):
    __tablename__ = "fee_payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    fee_record_id = Column(String(36), nullable=True)
    academic_year = Column(String(20), nullable=True)
    semester = Column(Integer, nullable=True)
    amount = Column(Float, default=0.0, nullable=False)
    payment_date = Column(String(20), nullable=False)
    payment_mode = Column(String(30), default="Online", nullable=False) # Cash, UPI, Bank Transfer, Online, Other
    transaction_number = Column(String(100), nullable=True)
    receipt_number = Column(String(100), nullable=False)
    receipt_file = Column(Text, nullable=True)
    collected_by = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 60. HOSTEL YEAR-WISE RECORDS TABLE (1st to 4th Year History)
class HostelRecord(Base):
    __tablename__ = "hostel_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    year = Column(Integer, nullable=False) # 1, 2, 3, 4
    academic_year = Column(String(20), nullable=False)
    is_hosteller = Column(Boolean, default=True, nullable=False)
    hostel_required = Column(String(10), default="Yes", nullable=False)
    hostel_name = Column(String(150), default="VSB Main Hostel", nullable=False)
    hostel_block = Column(String(50), default="A Block", nullable=False)
    floor = Column(String(20), default="1st Floor", nullable=True)
    room_number = Column(String(30), default="101", nullable=False)
    bed_number = Column(String(20), default="B1", nullable=True)
    mess_type = Column(String(50), default="Non-Veg", nullable=False)
    allocation_date = Column(String(20), nullable=True)
    vacated_date = Column(String(20), nullable=True)
    hostel_status = Column(String(30), default="Active", nullable=False) # Active, Vacated, Suspended
    
    hostel_fee = Column(Float, default=45000.0, nullable=False)
    mess_fee = Column(Float, default=35000.0, nullable=False)
    other_hostel_fee = Column(Float, default=0.0, nullable=False)
    scholarship_waiver = Column(Float, default=0.0, nullable=False)
    paid_amount = Column(Float, default=0.0, nullable=False)
    pending_amount = Column(Float, default=0.0, nullable=False)
    payment_status = Column(String(30), default="Pending", nullable=False)
    receipt_number = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 61. TRANSPORT YEAR-WISE RECORDS TABLE (1st to 4th Year History)
class TransportRecord(Base):
    __tablename__ = "transport_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    year = Column(Integer, nullable=False) # 1, 2, 3, 4
    academic_year = Column(String(20), nullable=False)
    transport_required = Column(String(10), default="Yes", nullable=False) # Yes, No
    bus_number = Column(String(50), default="BUS-01", nullable=False)
    route_number = Column(String(50), default="R-01", nullable=False)
    route_name = Column(String(150), default="Karur Central Route", nullable=False)
    boarding_point = Column(String(150), default="Karur Bus Stand", nullable=False)
    pickup_point = Column(String(150), default="Point A", nullable=False)
    drop_point = Column(String(150), default="VSB Campus Gate", nullable=False)
    driver_name = Column(String(100), default="Murugan K", nullable=True)
    driver_contact = Column(String(20), default="9876543210", nullable=True)
    transport_status = Column(String(30), default="Active", nullable=False)
    
    transport_fee = Column(Float, default=18000.0, nullable=False)
    concession_amount = Column(Float, default=0.0, nullable=False)
    paid_amount = Column(Float, default=0.0, nullable=False)
    pending_amount = Column(Float, default=0.0, nullable=False)
    payment_status = Column(String(30), default="Pending", nullable=False)
    receipt_number = Column(String(100), nullable=True)
    receipt_file = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 62. SCHOLARSHIP SCHEMES TABLE (Government, Management, Community, Merit, etc.)
class ScholarshipRecord(Base):
    __tablename__ = "scholarships"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    year = Column(Integer, nullable=False) # 1, 2, 3, 4
    academic_year = Column(String(20), nullable=False)
    scholarship_applicable = Column(String(10), default="Yes", nullable=False)
    scholarship_type = Column(String(100), default="Government Scholarship", nullable=False) # Government, Management, Community, Income, Merit, Sports, Institutional, Private, Other
    scholarship_name = Column(String(200), default="BC/MBC Welfare Scholarship", nullable=False)
    provider = Column(String(200), default="Government of Tamil Nadu", nullable=False)
    category_reason = Column(String(100), nullable=True)
    eligibility_status = Column(String(50), default="Eligible", nullable=False)
    application_number = Column(String(100), nullable=True)
    application_date = Column(String(20), nullable=True)
    approval_date = Column(String(20), nullable=True)
    disbursement_date = Column(String(20), nullable=True)
    
    eligible_amount = Column(Float, default=25000.0, nullable=False)
    approved_amount = Column(Float, default=25000.0, nullable=False)
    disbursed_amount = Column(Float, default=0.0, nullable=False)
    
    status = Column(String(50), default="Approved", nullable=False) # Not Applied, Applied, Under Verification, Approved, Rejected, Disbursed, Renewal Pending, Renewed, Cancelled
    supporting_document = Column(Text, nullable=True)
    approved_by = Column(String(100), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 63. FIRST GRADUATE YEAR-WISE RECORDS TABLE (1st to 4th Year History)
class FirstGraduateRecord(Base):
    __tablename__ = "first_graduate_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    year = Column(Integer, nullable=False) # 1, 2, 3, 4
    academic_year = Column(String(20), nullable=False)
    is_first_graduate = Column(String(10), default="Yes", nullable=False)
    certificate_number = Column(String(100), nullable=True)
    issue_date = Column(String(20), nullable=True)
    verification_status = Column(String(50), default="Verified", nullable=False) # Verified, Pending, Rejected
    is_eligible = Column(String(10), default="Yes", nullable=False)
    government_benefit_amount = Column(Float, default=25000.0, nullable=False)
    application_number = Column(String(100), nullable=True)
    approval_status = Column(String(50), default="Approved", nullable=False) # Approved, Renewed, Pending, Rejected
    supporting_document = Column(Text, nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now, nullable=False)


# 64. INCOME CERTIFICATE RECORDS TABLE
class IncomeCertificateRecord(Base):
    __tablename__ = "income_certificate_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, unique=True)
    annual_income = Column(Float, default=150000.0, nullable=False)
    certificate_number = Column(String(100), nullable=True)
    issue_date = Column(String(20), nullable=True)
    valid_until = Column(String(20), nullable=True)
    certificate_document = Column(Text, nullable=True)
    verification_status = Column(String(50), default="Verified", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 65. NATIVITY RECORDS TABLE
class NativityRecord(Base):
    __tablename__ = "nativity_records"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, unique=True)
    native_state = Column(String(100), default="Tamil Nadu", nullable=False)
    native_district = Column(String(100), default="Karur", nullable=False)
    native_taluk = Column(String(100), default="Karur", nullable=False)
    native_village = Column(String(100), default="Thanthonimalai", nullable=False)
    native_city = Column(String(100), default="Karur", nullable=False)
    native_pincode = Column(String(20), default="639005", nullable=False)
    permanent_native_address = Column(Text, nullable=True)
    certificate_number = Column(String(100), nullable=True)
    issue_date = Column(String(20), nullable=True)
    verification_status = Column(String(50), default="Verified", nullable=False)
    certificate_document = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 66. MASKED & ENCRYPTED BANK DETAILS TABLE
class StudentBankDetail(Base):
    __tablename__ = "student_bank_details"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False, unique=True)
    account_holder_name = Column(String(150), nullable=False)
    bank_name = Column(String(150), nullable=False)
    encrypted_account_number = Column(Text, nullable=False) # Encrypted string
    masked_account_number = Column(String(30), nullable=False) # e.g. •••• •••• 1234
    ifsc_code = Column(String(20), nullable=False)
    branch_name = Column(String(100), nullable=True)
    passbook_document = Column(Text, nullable=True)
    verification_status = Column(String(50), default="Verified", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 67. FINANCIAL & MODULE AUDIT LOGS TABLE
class FinancialAuditLog(Base):
    __tablename__ = "financial_audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    module = Column(String(50), nullable=False) # Fees, Hostel, Transport, Scholarship, FirstGraduate, Bank
    field_name = Column(String(100), nullable=False)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=False)
    updated_by = Column(String(100), nullable=False)
    role = Column(String(50), default="STAFF", nullable=False)
    reason = Column(Text, nullable=False)
    transaction_id = Column(String(100), nullable=True)
    receipt_number = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 68. BIOMETRIC REFERENCES TABLE
class BiometricReference(Base):
    __tablename__ = "biometric_references"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    biometric_type = Column(String(20), nullable=False) # FACE, FINGERPRINT
    template_hash = Column(Text, nullable=False) # Protected template embedding/hash
    device_id = Column(String(50), nullable=True)
    enrolled_by = Column(String(100), nullable=False)
    enrollment_date = Column(DateTime, default=utc_now, nullable=False)
    status = Column(String(20), default="Active", nullable=False)

# 69. BIOMETRIC DEVICES TABLE
class BiometricDevice(Base):
    __tablename__ = "biometric_devices"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    device_name = Column(String(150), nullable=False)
    device_serial = Column(String(100), unique=True, nullable=False)
    device_type = Column(String(50), nullable=False) # FINGERPRINT_SCANNER, FACE_CAM_KIOSK
    location = Column(String(150), nullable=True)
    ip_address = Column(String(50), nullable=True)
    status = Column(String(20), default="Active", nullable=False)
    last_heartbeat = Column(DateTime, default=utc_now, nullable=False)


# 71. PLACEMENT ASSESSMENTS TABLE
class PlacementAssessment(Base):
    __tablename__ = "placement_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    student_id = Column(String(36), ForeignKey("students.id"), nullable=False)
    assessment_name = Column(String(150), nullable=False)
    aptitude_score = Column(Float, default=0.0, nullable=False)
    technical_score = Column(Float, default=0.0, nullable=False)
    coding_score = Column(Float, default=0.0, nullable=False)
    communication_score = Column(Float, default=0.0, nullable=False)
    interview_score = Column(Float, default=0.0, nullable=False)
    total_score = Column(Float, default=0.0, nullable=False)
    assessment_date = Column(String(20), nullable=True)
    remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)


# 72. DEPARTMENT DETAILS TABLE
class DepartmentDetail(Base):
    __tablename__ = "department_details"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False, unique=True)
    about = Column(Text, nullable=True)
    vision = Column(Text, nullable=True)
    mission = Column(Text, nullable=True)
    contact_email = Column(String(150), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    building_location = Column(String(150), nullable=True)
    official_url = Column(Text, nullable=True)
    banner_image_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 73. DEPARTMENT PROGRAMMES TABLE
class DepartmentProgramme(Base):
    __tablename__ = "department_programmes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    programme_name = Column(String(150), nullable=False)
    degree = Column(String(20), default="B.E.", nullable=False)
    duration = Column(String(50), default="4 Years", nullable=False)
    started_year = Column(Integer, nullable=True)
    sanctioned_intake = Column(Integer, default=60, nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 74. DEPARTMENT FACILITIES TABLE
class DepartmentFacility(Base):
    __tablename__ = "department_facilities"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    facility_name = Column(String(150), nullable=False)
    facility_type = Column(String(50), default="Laboratory", nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 75. DEPARTMENT LABS TABLE
class DepartmentLab(Base):
    __tablename__ = "department_labs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    lab_name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    specs = Column(Text, nullable=True)
    equipment = Column(Text, nullable=True)
    lab_incharge = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 76. DEPARTMENT FACULTY TABLE
class DepartmentFaculty(Base):
    __tablename__ = "department_faculty"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    faculty_name = Column(String(150), nullable=False)
    designation = Column(String(100), nullable=False)
    qualification = Column(String(100), nullable=True)
    specialization = Column(String(150), nullable=True)
    email = Column(String(150), nullable=True)
    phone = Column(String(50), nullable=True)
    profile_image = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 77. DEPARTMENT STATISTICS TABLE
class DepartmentStatistic(Base):
    __tablename__ = "department_statistics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    stat_type = Column(String(50), nullable=False) # STUDENTS, FACULTY, PLACEMENTS, LABS, MOUS, PUBLICATIONS
    stat_key = Column(String(100), nullable=False)
    stat_value = Column(String(100), nullable=False)
    year_label = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 78. DEPARTMENT MOUS TABLE
class DepartmentMoU(Base):
    __tablename__ = "department_mous"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    organization = Column(String(200), nullable=False)
    purpose = Column(Text, nullable=False)
    year = Column(Integer, nullable=True)
    mou_type = Column(String(50), default="Industry", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 79. DEPARTMENT RESEARCH TABLE
class DepartmentResearch(Base):
    __tablename__ = "department_research"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    category = Column(String(50), nullable=False) # Area, Publication, Conference, Journal, Project, Innovation
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    authors_or_area = Column(String(255), nullable=True)
    journal_or_conf = Column(String(255), nullable=True)
    year = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 80. DEPARTMENT ACCREDITATION TABLE
class DepartmentAccreditation(Base):
    __tablename__ = "department_accreditation"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False, unique=True)
    nba_status = Column(String(100), default="Applied / Eligible", nullable=False)
    naac_status = Column(String(100), default="NAAC 'A' Grade", nullable=False)
    anna_univ_affiliation = Column(String(150), default="Permanently Affiliated", nullable=False)
    aicte_approval = Column(String(150), default="Approved by AICTE", nullable=False)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 81. DEPARTMENT SYLLABUS TABLE
class DepartmentSyllabus(Base):
    __tablename__ = "department_syllabus"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    regulation = Column(String(50), default="R2021", nullable=False)
    semester_number = Column(Integer, nullable=False)
    subject_code = Column(String(20), nullable=False)
    subject_title = Column(String(150), nullable=False)
    credits = Column(Float, default=3.0, nullable=False)
    syllabus_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now, nullable=False)

# 82. DEPARTMENT LINKS TABLE
class DepartmentLink(Base):
    __tablename__ = "department_links"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    department_id = Column(String(36), ForeignKey("departments.id"), nullable=False)
    link_title = Column(String(150), nullable=False)
    url = Column(Text, nullable=False)
    link_type = Column(String(50), default="Official Website", nullable=False)
    created_at = Column(DateTime, default=utc_now, nullable=False)
