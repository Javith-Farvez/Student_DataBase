from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# Auth Schemas
class LoginRequest(BaseModel):
    email: Optional[str] = None
    login_id: Optional[str] = None
    password: str
    portal_role: Optional[str] = None
    department_code: Optional[str] = None
    department_id: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    employee_id: Optional[str] = None
    full_name: str
    role: str
    email: str
    department_id: Optional[str] = None
    department_code: Optional[str] = None
    department_name: Optional[str] = None
    assigned_classes: Optional[List[dict]] = None


# User Schemas
class UserBase(BaseModel):
    email: str
    employee_id: Optional[str] = None
    full_name: str
    phone: Optional[str] = None
    role_id: str
    department_id: Optional[str] = None
    is_active: bool = True

class UserResponse(UserBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Department Schemas
class DepartmentBase(BaseModel):
    code: str
    name: str

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

# Comprehensive Student Schemas
class StudentBase(BaseModel):
    register_number: str
    roll_number: str
    admission_number: str
    full_name: str
    dob: str
    gender: str
    blood_group: Optional[str] = "O+"
    department_id: str
    program_id: str
    section_id: Optional[str] = None
    current_year: int = 1
    current_semester: int = 1
    
    # Contact
    email: Optional[str] = None
    phone: Optional[str] = None
    parent_name: Optional[str] = None
    parent_phone: Optional[str] = None
    emergency_contact: Optional[str] = None
    address_line: Optional[str] = None
    city: Optional[str] = "Chennai"
    state: Optional[str] = "Tamil Nadu"
    batch: Optional[str] = "2023-2027"

    # Academic & Performance
    cgpa: Optional[float] = 8.5
    sgpa: Optional[float] = 8.7
    rank: Optional[int] = 5
    arrears: Optional[int] = 0
    credits_earned: Optional[int] = 120

    # Attendance
    attendance_percentage: Optional[float] = 92.5
    present_days: Optional[int] = 85
    absent_days: Optional[int] = 5
    od_days: Optional[int] = 2
    medical_leave: Optional[int] = 0

    # Placement
    placement_status: Optional[str] = "Eligible & Preparing"
    placed_company: Optional[str] = None
    package_offered: Optional[str] = None

class StudentCreate(StudentBase):
    pass

class StudentResponse(StudentBase):
    id: str
    created_at: datetime
    department_name: Optional[str] = None
    program_name: Optional[str] = None

    class Config:
        from_attributes = True

class HealthCheckResponse(BaseModel):
    status: str
    app_name: str
    version: str
    database: str
    timestamp: datetime


# ============================================================
# SSLC (10th) Schemas
# ============================================================

class SSLCBase(BaseModel):
    student_id: str
    school_name: Optional[str] = None
    board: Optional[str] = None                  # State Board / CBSE / ICSE / Matric
    passing_year: Optional[int] = None
    register_number: Optional[str] = None
    total_marks: Optional[float] = None
    max_marks: Optional[float] = 500.0
    percentage: Optional[float] = None
    # Subject Marks (out of 100)
    tamil: Optional[float] = None
    english: Optional[float] = None
    mathematics: Optional[float] = None
    science: Optional[float] = None
    social_science: Optional[float] = None
    optional_subject: Optional[str] = None
    optional_marks: Optional[float] = None
    remarks: Optional[str] = None

class SSLCCreate(SSLCBase):
    pass

class SSLCUpdate(BaseModel):
    school_name: Optional[str] = None
    board: Optional[str] = None
    passing_year: Optional[int] = None
    register_number: Optional[str] = None
    total_marks: Optional[float] = None
    max_marks: Optional[float] = None
    percentage: Optional[float] = None
    tamil: Optional[float] = None
    english: Optional[float] = None
    mathematics: Optional[float] = None
    science: Optional[float] = None
    social_science: Optional[float] = None
    optional_subject: Optional[str] = None
    optional_marks: Optional[float] = None
    remarks: Optional[str] = None

class SSLCResponse(SSLCBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# HSC (12th) Schemas
# ============================================================

class HSCBase(BaseModel):
    student_id: str
    school_name: Optional[str] = None
    board: Optional[str] = None                  # State Board / CBSE / ICSE / Matric
    passing_year: Optional[int] = None
    register_number: Optional[str] = None
    stream: Optional[str] = "Science"            # Science / Commerce / Arts
    total_marks: Optional[float] = None
    max_marks: Optional[float] = 600.0
    percentage: Optional[float] = None
    cutoff: Optional[float] = None               # Out of 200
    # Subject Marks (out of 100)
    physics: Optional[float] = None
    chemistry: Optional[float] = None
    mathematics: Optional[float] = None
    biology: Optional[float] = None
    computer_science: Optional[float] = None
    language1: Optional[float] = None
    language2: Optional[float] = None
    bio_cs_subject: Optional[str] = "Biology"    # "Biology" or "Computer Science"
    remarks: Optional[str] = None

class HSCCreate(HSCBase):
    pass

class HSCUpdate(BaseModel):
    school_name: Optional[str] = None
    board: Optional[str] = None
    passing_year: Optional[int] = None
    register_number: Optional[str] = None
    stream: Optional[str] = None
    total_marks: Optional[float] = None
    max_marks: Optional[float] = None
    percentage: Optional[float] = None
    cutoff: Optional[float] = None
    physics: Optional[float] = None
    chemistry: Optional[float] = None
    mathematics: Optional[float] = None
    biology: Optional[float] = None
    computer_science: Optional[float] = None
    language1: Optional[float] = None
    language2: Optional[float] = None
    bio_cs_subject: Optional[str] = None
    remarks: Optional[str] = None

class HSCResponse(HSCBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# STUDENT & PARENT PORTAL AUTH SCHEMAS
# ============================================================

class StudentLoginRequest(BaseModel):
    register_number: str
    password: str

class ParentLoginRequest(BaseModel):
    register_number: str       # Student's register number
    parent_password: str

class ChangePasswordRequest(BaseModel):
    register_number: str
    old_password: str
    new_password: str

class StudentTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    student_id: str
    register_number: str
    full_name: str
    role: str                  # STUDENT or PARENT
    department_code: str
    department_name: str
    current_year: int
    current_semester: int
    first_login: bool = False


# ============================================================
# LEAVE REQUEST SCHEMAS
# ============================================================

class LeaveRequestCreate(BaseModel):
    student_id: str
    from_date: str
    to_date: str
    reason: str
    leave_type: Optional[str] = "Medical"

class LeaveRequestResponse(BaseModel):
    id: str
    student_id: str
    from_date: str
    to_date: str
    reason: str
    leave_type: str
    status: str
    approved_by: Optional[str] = None
    faculty_remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# OD REQUEST SCHEMAS
# ============================================================

class ODRequestCreate(BaseModel):
    student_id: str
    from_date: str
    to_date: str
    event_name: str
    event_type: Optional[str] = "Symposium"
    venue: Optional[str] = None
    reason: Optional[str] = None

class ODRequestResponse(BaseModel):
    id: str
    student_id: str
    from_date: str
    to_date: str
    event_name: str
    event_type: str
    venue: Optional[str] = None
    reason: Optional[str] = None
    status: str
    approved_by: Optional[str] = None
    faculty_remarks: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# LAB MARK & MODEL EXAM SCHEMAS
# ============================================================

class LabMarkCreate(BaseModel):
    student_id: str
    semester: int
    lab_name: Optional[str] = None
    cycle_test_1: Optional[float] = 0.0
    cycle_test_2: Optional[float] = 0.0
    viva: Optional[float] = 0.0
    record: Optional[float] = 0.0
    total: Optional[float] = 0.0
    max_marks: Optional[float] = 100.0

class LabMarkResponse(LabMarkCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

class ModelExamMarkCreate(BaseModel):
    student_id: str
    semester: int
    subject_name: Optional[str] = None
    marks_obtained: Optional[float] = 0.0
    max_marks: Optional[float] = 100.0
    grade: Optional[str] = None

class ModelExamMarkResponse(ModelExamMarkCreate):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# ============================================================
# PHASE 2: 15-STEP COMPLETE STUDENT REGISTRATION SCHEMA
# ============================================================
class DocumentItemPayload(BaseModel):
    document_type: str
    file_name: str
    file_path: Optional[str] = None
    version: Optional[int] = 1
    status: Optional[str] = "VERIFIED"
    notes: Optional[str] = None

class CompleteStudentRegistrationSchema(BaseModel):
    # 1. Identity
    register_number: str
    admission_number: str
    roll_number: str
    university_number: Optional[str] = None
    photo_url: Optional[str] = None

    # 2. Personal Details
    full_name: str
    dob: str
    gender: str
    blood_group: Optional[str] = "O+"
    nationality: Optional[str] = "Indian"
    religion: Optional[str] = "Hindu"
    community: Optional[str] = "BC"
    caste: Optional[str] = None
    email: str
    phone: Optional[str] = None
    alternate_mobile: Optional[str] = None

    # 3. Family Details
    father_name: Optional[str] = None
    father_occupation: Optional[str] = "Business"
    father_phone: Optional[str] = None
    mother_name: Optional[str] = None
    mother_occupation: Optional[str] = "Homemaker"
    mother_phone: Optional[str] = None
    guardian_name: Optional[str] = None
    guardian_phone: Optional[str] = None
    emergency_contact: Optional[str] = None

    # 4. Address
    door_number: Optional[str] = None
    street: Optional[str] = None
    village: Optional[str] = None
    city: Optional[str] = "Karur"
    district: Optional[str] = "Karur"
    state: Optional[str] = "Tamil Nadu"
    country: Optional[str] = "India"
    pincode: Optional[str] = "639001"
    current_address: Optional[str] = None
    permanent_address: Optional[str] = None

    # 5. Academic Details
    department_code: Optional[str] = "AIDS"
    department_name: Optional[str] = "Artificial Intelligence & Data Science"
    course: Optional[str] = "B.E. AI & DS"
    regulation: Optional[str] = "2021"
    academic_year: Optional[str] = "2025-2026"
    admission_year: Optional[str] = "2021"
    current_year: int = 1
    current_semester: int = 1
    section_name: str = "A"
    class_advisor: Optional[str] = None
    mentor: Optional[str] = None
    student_status: Optional[str] = "Active" # Active, Graduated, Transferred, Discontinued

    # 6. Government / Identity Documents (Masked & Encrypted)
    aadhaar_number: Optional[str] = None
    pan_number: Optional[str] = None
    passport_number: Optional[str] = None
    driving_licence: Optional[str] = None

    # 7. Document Vault / Certificates
    documents: Optional[List[DocumentItemPayload]] = []

    # 8. Hostel
    hosteller: bool = False
    hostel_name: Optional[str] = "VSB Boys Hostel Block A"
    hostel_block: Optional[str] = "Block A"
    floor: Optional[str] = "2nd Floor"
    room_number: Optional[str] = "204"
    bed_number: Optional[str] = "Bed 2"
    mess_type: Optional[str] = "Non-Veg"

    # 9. Transport
    bus_required: bool = True
    bus_number: Optional[str] = "Route No. 4"
    bus_route: Optional[str] = "Karur Bus Stand to VSB Campus"
    boarding_point: Optional[str] = "Karur Bus Stand (07:45 AM)"
    driver_name: Optional[str] = "Murugan K"
    pickup_time: Optional[str] = "07:45 AM"

    # 10. Scholarship
    scholarship_type: Optional[str] = "First Graduate Scholarship"
    scholarship_provider: Optional[str] = "Government of Tamil Nadu"
    scholarship_amount: Optional[float] = 25000.0
    scholarship_year: Optional[str] = "2025-2026"
    scholarship_status: Optional[str] = "Approved & Sanctioned"

    # 11. Medical Information
    allergy_info: Optional[str] = "No known allergies"
    medical_notes: Optional[str] = "Fit for sports and academic activities"

    # 12. Placement Information
    resume_link: Optional[str] = None
    skills: Optional[str] = "Python, Data Structures, AI/ML, SQL"
    programming_languages: Optional[str] = "Python, C++, Java"
    internships: Optional[str] = "Data Science Intern at VSB Tech"
    hackathons: Optional[str] = "1st Place VSB Smart Campus Hackathon"
    placement_training: Optional[str] = "Completed Aptitude & Technical Training"
    assessment_score: Optional[float] = 95.0
    placement_status: Optional[str] = "Eligible & Preparing"

    # 13. Face AI Registration
    face_captured: bool = False
    encrypted_face_embedding: Optional[str] = None

