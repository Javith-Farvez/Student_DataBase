from sqlalchemy.orm import Session
from app.core.database import Base, engine, SessionLocal
from app.core.security import get_password_hash
from app.models.models import (
    Role, Department, User, Program, Section, Student, StaffClassAssignment,
    SemesterMark, InternalMark, ArrearRecord, ArrearAttempt,
    CertificateItem, InternshipRecord, HackathonRecord,
    StudentDocumentItem, Fee, Hostel, Bus, AcademicAuditLog, AuditLog,
    DocumentVersion, DocumentAccessLog, ScholarshipDetail, FirstGraduateDetail, NativityDetail
)

# Pre-computed bcrypt hashes for instant seeding (under 1 second)
BCRYPT_ADMIN = get_password_hash("admin123")
BCRYPT_PASS123 = get_password_hash("pass123")
BCRYPT_STUDENT = get_password_hash("student123")
BCRYPT_PARENT = get_password_hash("parent123")

def hash_password(password: str) -> str:
    if password == "admin123":
        return BCRYPT_ADMIN
    elif password == "pass123":
        return BCRYPT_PASS123
    elif password == "student123":
        return BCRYPT_STUDENT
    elif password == "parent123":
        return BCRYPT_PARENT
    return get_password_hash(password)

def init_db():
    print("Recreating database tables and seeding comprehensive VSB SmartCampus example data...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    try:
        # 1. Seed System Roles (ADMIN, PRINCIPAL, HOD, STAFF)
        roles_data = [
            ("ADMIN", "Super Admin Portal - Complete System Management & Controls"),
            ("PRINCIPAL", "Principal Portal - Executive Institutional Overview"),
            ("HOD", "Head of Department Portal - Department Scoped Management"),
            ("STAFF", "Faculty & Staff Portal - Class Mark Entry & Attendance")
        ]
        
        roles_map = {}
        for name, desc in roles_data:
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name, description=desc, is_system_role=True)
                db.add(role)
                db.commit()
                db.refresh(role)
            roles_map[name] = role

        # 2. Seed V.S.B Engineering College 11 UG Departments
        depts_data = [
            ("IT", "Information Technology", "Dr. N. Priya"),
            ("CSE", "Computer Science and Engineering", "Dr. A. Ramesh"),
            ("AIDS", "Artificial Intelligence and Data Science", "Dr. K. Senthil Kumar"),
            ("AIML", "Artificial Intelligence and Machine Learning", "Dr. R. Vignesh"),
            ("CSBS", "Computer Science and Business System", "Dr. S. Meenakshi"),
            ("CCE", "Computer and Communication Engineering", "Dr. T. Anand"),
            ("ECE", "Electronics and Communication Engineering", "Dr. P. Murugan"),
            ("EEE", "Electrical and Electronics Engineering", "Dr. K. Balaji"),
            ("MECH", "Mechanical Engineering", "Dr. S. Karthik"),
            ("CHEM", "Chemical Engineering", "Dr. V. Lakshmi"),
            ("CIVIL", "Civil Engineering", "Dr. M. Sundaram")
        ]
        
        depts_map = {}
        for code, name, hod_name in depts_data:
            dept = db.query(Department).filter(Department.code == code).first()
            if not dept:
                dept = Department(code=code, name=name, hod=hod_name, status="Active")
                db.add(dept)
                db.flush()
            depts_map[code] = dept

        # 3. Seed System & Staff Accounts for ALL 11 Departments
        staff_accounts = [
            ("ADMIN001", "admin@vsb.ac.in", "Dr. V.S.B Administrator", "ADMIN", "admin123", "AIDS"),
            ("ADMIN_001", "admin001@vsb.ac.in", "Dr. V.S.B System Administrator", "ADMIN", "admin123", "AIDS"),
            ("PRIN001", "principal@vsb.ac.in", "Dr. V.S.B Principal", "PRINCIPAL", "pass123", "AIDS"),
            ("PRINCIPAL_001", "principal001@vsb.ac.in", "Dr. V.S.B Principal Executive", "PRINCIPAL", "pass123", "AIDS"),
        ]

        # Add HOD and Staff accounts for every single department
        for code, name, hod_name in depts_data:
            # Primary HOD (e.g. AIDS_HOD_001, EEE_HOD_001)
            staff_accounts.append((f"{code}_HOD_001", f"hod.{code.lower()}@vsb.ac.in", f"{hod_name} (HOD {code})", "HOD", "pass123", code))
            # Secondary HOD alias (e.g. HOD_AIDS_001, HOD_EEE_001)
            staff_accounts.append((f"HOD_{code}_001", f"hod_{code.lower()}@vsb.ac.in", f"{hod_name} (HOD {code})", "HOD", "pass123", code))
            # Primary Staff (e.g. STAFF_AIDS_001, STAFF_EEE_001)
            staff_accounts.append((f"STAFF_{code}_001", f"staff.{code.lower()}@vsb.ac.in", f"Prof. Faculty ({code})", "STAFF", "pass123", code))

        users_map = {}
        for emp_id, email, name, role_key, raw_pass, dept_code in staff_accounts:
            user = db.query(User).filter((User.email == email) | (User.employee_id == emp_id)).first()
            if not user:
                user = User(
                    employee_id=emp_id,
                    email=email,
                    password_hash=hash_password(raw_pass),
                    full_name=name,
                    role_id=roles_map[role_key].id,
                    department_id=depts_map[dept_code].id,
                    is_active=True
                )
                db.add(user)
                db.flush()
            users_map[emp_id] = user

        # 4. Seed Programs and Sections for ALL 11 Departments
        prog_map = {}
        section_map = {} # (dept_code, year, sec_name) -> Section

        for code, name, _ in depts_data:
            prefix = "B.Tech" if code in ["IT", "AIDS", "AIML", "CSBS", "CHEM"] else "B.E."
            prog_name = f"{prefix} in {name}"
            prog = Program(department_id=depts_map[code].id, name=prog_name, duration_years=4)
            db.add(prog)
            db.flush()
            prog_map[code] = prog

            # Create Year 1 to 4 and Section A, B, C for each department
            for y in [1, 2, 3, 4]:
                for s in ["A", "B", "C"]:
                    sec = Section(
                        program_id=prog.id,
                        year=y,
                        semester=y * 2,
                        name=s
                    )
                    db.add(sec)
                    db.flush()
                    section_map[(code, y, s)] = sec

        # 5. Seed Staff Class Assignments for ALL Departments (Years 1..4, Sections A, B, C)
        academic_batches = {
            1: ("2024-25", 1, "2024-2028"),
            2: ("2023-24", 3, "2023-2027"),
            3: ("2022-23", 5, "2022-2026"),
            4: ("2021-22", 7, "2021-2025")
        }

        for code, _, _ in depts_data:
            staff_id = f"STAFF_{code}_001"
            if staff_id in users_map:
                u = users_map[staff_id]
                d = depts_map[code]
                for yr in [1, 2, 3, 4]:
                    ac_yr, sem, batch = academic_batches[yr]
                    for sec_name in ["A", "B", "C"]:
                        assignment = StaffClassAssignment(
                            user_id=u.id,
                            department_id=d.id,
                            year=yr,
                            academic_year=ac_yr,
                            semester=sem,
                            section_name=sec_name,
                            academic_batch=batch,
                            is_class_advisor=(sec_name == "A"),
                            status="Active"
                        )
                        db.add(assignment)
                db.flush()

        # 6. Seed Primary Test Student: Aarav Sharma (AIDS, Year 3, Section A)
        aids_prog = prog_map["AIDS"]
        aids_sec_3a = section_map[("AIDS", 3, "A")]

        aarav_data = {
            "register_number": "922521104001", "roll_number": "21AD001", "admission_number": "VSB2021001",
            "full_name": "Aarav Sharma", "dob": "2004-05-12", "gender": "Male", "blood_group": "O+",
            "email": "aarav.sharma@vsb.ac.in", "phone": "+91 98765 43210",
            "father_name": "Suresh Sharma", "mother_name": "Lakshmi Sharma", "guardian_name": "Suresh Sharma",
            "parent_phone": "+91 98765 00001", "parent_email": "suresh.sharma@gmail.com",
            "emergency_contact": "+91 98765 00001",
            "address_line": "42 Anna Nagar, Karur Road", "city": "Karur", "state": "Tamil Nadu",
            "nationality": "Indian", "religion": "Hindu", "community": "BC", "caste": "Nadars",
            "batch": "2021-2025", "academic_year": "2024-25",
            "scholarship_details": "Government First Graduate Scholarship",
            "scholarship": "Government First Graduate",
            "hosteller": True, "hostel_details": "VSB Boys Hostel Block-A, Room 204",
            "bus_route": "Route No. 4 (Karur Bus Stand)",
            "mentor": "Dr. K. Senthil Kumar", "class_advisor": "Prof. M. Rajesh",
            "counsellor": "Dr. R. Priya",
            "aadhaar_number": "XXXX XXXX 1234",
            "annual_income": 250000.0,
            "current_year": 3, "current_semester": 6,
            "cgpa": 8.92, "sgpa": 9.10, "department_rank": 2, "arrears_count": 1, "credits_earned": 156,
            "attendance_percentage": 95.4,
            "placement_status": "Placed in Tier-1 Company", "placed_company": "Zoho Corporation", "package_offered": "12.5 LPA",
            "student_password_hash": hash_password("student123"),
            "parent_password_hash": hash_password("parent123"),
            "first_login": False,
            "department_id": depts_map["AIDS"].id,
            "program_id": aids_prog.id,
            "section_id": aids_sec_3a.id,
            "section_name": "A"
        }

        st = Student(**aarav_data)
        db.add(st)
        db.flush()

        # Seed additional roster students for AIDS
        aids_students = [
            {"register_number": "922521104002", "roll_number": "21AD002", "admission_number": "VSB2021002", "full_name": "Ananya Patel", "dob": "2004-09-24", "gender": "Female", "blood_group": "A+", "email": "ananya.patel@vsb.ac.in", "phone": "+91 98765 43211", "current_year": 3, "current_semester": 6, "cgpa": 9.38, "sgpa": 9.50, "attendance_percentage": 97.2, "placement_status": "Placed in Tier-1 Company", "placed_company": "TCS Digital", "package_offered": "9.0 LPA", "department_id": depts_map["AIDS"].id, "program_id": aids_prog.id, "section_id": aids_sec_3a.id, "section_name": "A"},
            {"register_number": "922521104003", "roll_number": "21AD003", "admission_number": "VSB2021003", "full_name": "Rohan Verma", "dob": "2004-01-15", "gender": "Male", "blood_group": "B+", "email": "rohan.verma@vsb.ac.in", "phone": "+91 98765 43212", "current_year": 3, "current_semester": 6, "cgpa": 8.25, "sgpa": 8.40, "attendance_percentage": 92.1, "placement_status": "Eligible & Preparing", "placed_company": None, "package_offered": None, "department_id": depts_map["AIDS"].id, "program_id": aids_prog.id, "section_id": aids_sec_3a.id, "section_name": "A"}
        ]
        for os_data in aids_students:
            db.add(Student(**os_data))
        db.flush()

        # Seed students for EVERY other department and all 4 years & sections
        first_names_boys = ["Vignesh", "Karthik", "Santhosh", "Rahul", "Dinesh", "Gokul", "Praveen", "Suresh", "Manoj", "Ajith", "Naveen", "Hari"]
        first_names_girls = ["Pooja", "Deepika", "Kavya", "Sneha", "Divya", "Swetha", "Nandhini", "Abinaya", "Pavithra", "Harini", "Keerthana", "Shalini"]
        last_names = ["Kumar", "Rajan", "Murugan", "Sundaram", "Chandran", "Natarajan", "Selvam", "Mani", "Balan", "Pandian", "Moorthy"]

        dept_code_numbers = {
            "IT": 205, "CSE": 104, "AIDS": 243, "AIML": 244, "CSBS": 245,
            "CCE": 246, "ECE": 106, "EEE": 105, "MECH": 114, "CHEM": 203, "CIVIL": 103
        }

        name_idx = 0
        for code, _, _ in depts_data:
            dept_obj = depts_map[code]
            dept_p = prog_map[code]
            dept_num = dept_code_numbers.get(code, 100)

            for yr in [1, 2, 3, 4]:
                sem_active = yr * 2 - 1
                batch_str = academic_batches[yr][2]
                ac_yr_str = academic_batches[yr][0]
                yr_prefix = 25 - yr

                for sec_char in ["A", "B", "C"]:
                    # Ensure section exists in section_map
                    sec_obj = section_map.get((code, yr, sec_char))
                    sec_id = sec_obj.id if sec_obj else None

                    # If this is AIDS Year 3 Sec A, we already seeded students above
                    if code == "AIDS" and yr == 3 and sec_char == "A":
                        continue

                    # Seed 2 students per section so every section has active students
                    for s_idx in range(1, 3):
                        name_idx += 1
                        is_boy = (s_idx % 2 != 0)
                        fname = first_names_boys[(name_idx + s_idx) % len(first_names_boys)] if is_boy else first_names_girls[(name_idx + s_idx) % len(first_names_girls)]
                        lname = last_names[(name_idx * 3) % len(last_names)]
                        full_st_name = f"{fname} {lname}"

                        reg_num = f"9225{yr_prefix:02d}{dept_num:03d}{sec_char.lower()}{s_idx:02d}"
                        roll_num = f"{yr_prefix:02d}{code}{sec_char}{s_idx:02d}"
                        admiss_num = f"VSB{2020 + yr_prefix}{dept_num:03d}{sec_char}{s_idx:02d}"
                        
                        cgpa_val = round(7.5 + ((name_idx % 23) * 0.1), 2)
                        att_val = round(88.0 + ((name_idx % 12) * 0.9), 1)

                        student_obj = Student(
                            register_number=reg_num,
                            roll_number=roll_num,
                            admission_number=admiss_num,
                            full_name=full_st_name,
                            dob=f"{2006 - yr}:0{s_idx + 1}:15",
                            gender="Male" if is_boy else "Female",
                            blood_group="A+" if (name_idx % 2 == 0) else "O+",
                            email=f"{fname.lower()}.{lname.lower()}{name_idx}@vsb.ac.in",
                            phone=f"+91 98765 {40000 + (name_idx * 17) % 9999:05d}",
                            father_name=f"{lname} {last_names[(name_idx + 1) % len(last_names)]}",
                            mother_name=f"{first_names_girls[(name_idx) % len(first_names_girls)]} {lname}",
                            parent_phone=f"+91 98765 {50000 + (name_idx * 19) % 9999:05d}",
                            parent_email=f"{lname.lower()}.parent@gmail.com",
                            address_line=f"{10 + s_idx} College Road, Gandhi Nagar",
                            city="Karur",
                            state="Tamil Nadu",
                            nationality="Indian",
                            religion="Hindu",
                            community=["OC", "BC", "MBC", "SC", "ST"][(name_idx) % 5],
                            batch=batch_str,
                            academic_year=ac_yr_str,
                            scholarship="Merit Scholarship" if cgpa_val > 8.5 else "None",
                            hosteller=(s_idx == 1),
                            hostel_details=f"VSB Hostel Block-{sec_char}, Room {100 + s_idx}" if s_idx == 1 else None,
                            bus_route=f"Route No. {(name_idx % 10) + 1} (Karur)" if s_idx != 1 else None,
                            current_year=yr,
                            current_semester=sem_active,
                            cgpa=min(cgpa_val, 9.85),
                            sgpa=min(cgpa_val + 0.15, 10.0),
                            attendance_percentage=min(att_val, 99.5),
                            department_rank=(s_idx),
                            arrears_count=0 if cgpa_val > 8.0 else 1,
                            credits_earned=yr * 42,
                            placement_status="Placed" if (yr == 4 and cgpa_val > 8.0) else "Eligible & Preparing",
                            placed_company="Zoho Corporation" if (yr == 4 and cgpa_val > 8.0) else None,
                            package_offered="8.5 LPA" if (yr == 4 and cgpa_val > 8.0) else None,
                            student_password_hash=hash_password("student123"),
                            parent_password_hash=hash_password("parent123"),
                            first_login=False,
                            department_id=dept_obj.id,
                            program_id=dept_p.id,
                            section_id=sec_id,
                            section_name=sec_char
                        )
                        db.add(student_obj)
        db.flush()

        # 7. Seed Complete 6 Semesters Marks for Aarav Sharma
        semester_marks_seed = [
            # Semester 1
            (1, "HS3151", "Professional English - I", 3.0, 45, 88, 93, "O", 10.0, "Pass"),
            (1, "MA3151", "Matrices and Calculus", 4.0, 42, 80, 86, "A+", 9.0, "Pass"),
            (1, "PH3151", "Engineering Physics", 3.0, 44, 82, 88, "A+", 9.0, "Pass"),
            (1, "CY3151", "Engineering Chemistry", 3.0, 46, 85, 90, "O", 10.0, "Pass"),
            (1, "GE3151", "Problem Solving and Python Programming", 3.0, 48, 90, 95, "O", 10.0, "Pass"),
            (1, "GE3152", "Heritage of Tamils", 1.0, 45, 85, 90, "O", 10.0, "Pass"),
            (1, "GE3171", "Python Programming Laboratory", 2.0, 49, 95, 98, "O", 10.0, "Pass"),
            (1, "BS3171", "Physics and Chemistry Laboratory", 2.0, 48, 92, 96, "O", 10.0, "Pass"),
            (1, "GE3172", "English Laboratory", 1.0, 47, 90, 94, "O", 10.0, "Pass"),
            (1, "GE3173", "Engineering Practices Laboratory", 2.0, 48, 94, 96, "O", 10.0, "Pass"),

            # Semester 2
            (2, "HS3251", "Professional English - II", 3.0, 44, 84, 88, "A+", 9.0, "Pass"),
            (2, "MA3251", "Statistics and Numerical Methods", 4.0, 43, 82, 85, "A+", 9.0, "Pass"),
            (2, "PH3256", "Physics for Information Science", 3.0, 45, 85, 90, "O", 10.0, "Pass"),
            (2, "BE3251", "Basic Electrical and Electronics Engineering", 3.0, 41, 78, 82, "A", 8.0, "Pass"),
            (2, "GE3251", "Engineering Graphics", 4.0, 46, 88, 92, "O", 10.0, "Pass"),
            (2, "CS3251", "Programming in C", 3.0, 47, 89, 93, "O", 10.0, "Pass"),
            (2, "GE3271", "Engineering Graphics Laboratory", 2.0, 48, 92, 96, "O", 10.0, "Pass"),
            (2, "CS3271", "C Programming Laboratory", 2.0, 49, 95, 98, "O", 10.0, "Pass"),
            (2, "BE3271", "Basic Electrical and Electronics Lab", 2.0, 46, 90, 94, "O", 10.0, "Pass"),
            (2, "GE3272", "Communication Skills Laboratory", 1.0, 47, 91, 94, "O", 10.0, "Pass"),
            (2, "GE3273", "Environmental Science Lab", 1.0, 48, 92, 95, "O", 10.0, "Pass"),

            # Semester 3
            (3, "MA3354", "Discrete Mathematics", 4.0, 44, 84, 88, "A+", 9.0, "Pass"),
            (3, "CS3351", "Data Structures and Algorithms", 3.0, 30, 38, 68, "B", 6.0, "Pass"),
            (3, "CS3391", "Object Oriented Programming", 3.0, 46, 86, 90, "O", 10.0, "Pass"),
            (3, "AD3351", "Design and Analysis of Algorithms", 3.0, 45, 85, 89, "A+", 9.0, "Pass"),
            (3, "AD3391", "Database Design and Management", 3.0, 47, 88, 92, "O", 10.0, "Pass"),
            (3, "GE3351", "Environmental Sciences and Sustainability", 2.0, 45, 85, 90, "O", 10.0, "Pass"),
            (3, "CS3361", "Data Structures Laboratory", 2.0, 48, 94, 96, "O", 10.0, "Pass"),
            (3, "AD3381", "Database Design Laboratory", 2.0, 49, 95, 98, "O", 10.0, "Pass"),
            (3, "CS3381", "Object Oriented Programming Laboratory", 2.0, 47, 92, 95, "O", 10.0, "Pass"),
            (3, "GE3361", "Professional Development Laboratory", 1.0, 48, 93, 96, "O", 10.0, "Pass"),

            # Semester 4
            (4, "MA3451", "Probability and Statistics", 4.0, 45, 86, 90, "O", 10.0, "Pass"),
            (4, "CS3491", "Artificial Intelligence and Machine Learning", 3.0, 47, 90, 95, "O", 10.0, "Pass"),
            (4, "CS3451", "Operating Systems", 3.0, 44, 82, 86, "A+", 9.0, "Pass"),
            (4, "CS3492", "Database Management Systems", 3.0, 46, 87, 91, "O", 10.0, "Pass"),
            (4, "CS3401", "Algorithms Laboratory", 2.0, 48, 92, 95, "O", 10.0, "Pass"),
            (4, "CS3461", "Operating Systems Laboratory", 2.0, 49, 94, 97, "O", 10.0, "Pass"),
            (4, "AD3491", "Machine Learning Laboratory", 2.0, 49, 96, 99, "O", 10.0, "Pass"),
            (4, "GE3451", "Environmental Studies Lab", 1.0, 47, 90, 94, "O", 10.0, "Pass"),
            (4, "GE3452", "Mini Project Phase - I", 2.0, 50, 95, 99, "O", 10.0, "Pass"),

            # Semester 5
            (5, "AD3501", "Deep Learning and Neural Networks", 3.0, 20, 25, 45, "U", 0.0, "Fail"),
            (5, "AD3551", "Computer Vision Architecture", 3.0, 45, 85, 89, "A+", 9.0, "Pass"),
            (5, "AD3591", "Big Data Analytics", 3.0, 46, 88, 92, "O", 10.0, "Pass"),
            (5, "CS3591", "Computer Networks", 3.0, 44, 82, 86, "A+", 9.0, "Pass"),
            (5, "AD3511", "Deep Learning Laboratory", 2.0, 48, 92, 95, "O", 10.0, "Pass"),
            (5, "AD3581", "Big Data Laboratory", 2.0, 49, 95, 98, "O", 10.0, "Pass"),
            (5, "CS3581", "Computer Networks Laboratory", 2.0, 47, 90, 94, "O", 10.0, "Pass"),
            (5, "GE3561", "Technical Communication Lab", 1.0, 48, 93, 96, "O", 10.0, "Pass"),

            # Semester 6
            (6, "AD3651", "Generative AI and LLM Engineering", 4.0, 48, 90, 95, "O", 10.0, "Pass"),
            (6, "AD3691", "Natural Language Processing", 3.0, 46, 88, 92, "O", 10.0, "Pass"),
            (6, "AD3601", "Reinforcement Learning", 3.0, 45, 85, 89, "A+", 9.0, "Pass"),
            (6, "AD3611", "Generative AI Laboratory", 2.0, 50, 96, 99, "O", 10.0, "Pass"),
            (6, "AD3612", "NLP & Transformers Laboratory", 2.0, 49, 94, 98, "O", 10.0, "Pass"),
            (6, "GE3651", "Mini Project Phase - II", 2.0, 49, 95, 99, "O", 10.0, "Pass")
        ]

        for sem, scode, sname, cred, intm, extm, totm, grd, gpt, res in semester_marks_seed:
            db.add(SemesterMark(
                student_id=st.id,
                semester=sem,
                subject_code=scode,
                subject_name=sname,
                credits=cred,
                internal_mark=intm,
                semester_exam_mark=extm,
                total_mark=totm,
                grade=grd,
                grade_point=gpt,
                result=res
            ))

        # 8. Seed Arrear Records
        db.add(ArrearRecord(
            student_id=st.id,
            semester=3,
            subject_code="CS3351",
            subject_name="Data Structures and Algorithms",
            attempt_number=2,
            arrear_status="Cleared",
            cleared_date="2024-01-20"
        ))

        db.add(ArrearRecord(
            student_id=st.id,
            semester=5,
            subject_code="AD3501",
            subject_name="Deep Learning and Neural Networks",
            attempt_number=1,
            arrear_status="Pending"
        ))

        # 9. Seed Certificates, Internship, Hackathons
        db.add(CertificateItem(
            student_id=st.id,
            name="AWS Certified Solutions Architect - Associate",
            type="Cloud Computing",
            issued_by="Amazon Web Services (AWS)",
            issue_date="2024-03-15",
            description="AWS, EC2, S3, IAM, CloudFormation"
        ))

        db.add(CertificateItem(
            student_id=st.id,
            name="Deep Learning Specialization",
            type="Artificial Intelligence",
            issued_by="DeepLearning.AI / Coursera",
            issue_date="2024-08-20",
            description="PyTorch, CNN, RNN, Transformers"
        ))

        db.add(InternshipRecord(
            student_id=st.id,
            company_name="Zoho Corporation",
            role="AI / Machine Learning Engineering Intern",
            duration="6 Months",
            start_date="2024-06-01",
            end_date="2024-11-30",
            internship_type="Industrial",
            verification_status="Verified"
        ))

        db.add(HackathonRecord(
            student_id=st.id,
            hackathon_name="Smart India Hackathon (SIH 2024)",
            organizer="Ministry of Education & AICTE",
            date="2024-09-18",
            level="National",
            participation_status="Winner",
            position="1st Prize (Grand Winner)",
            prize="₹1,00,000 Cash Award",
            team_name="VSB Codecrafters",
            project_name="AI Campus Security & Facial Recognition"
        ))

        # 10. Seed Document Items
        docs_seed = [
            ("mark_10th", "10th_SSLC_Marksheet.pdf", "uploads/documents/10th_SSLC_Marksheet.pdf"),
            ("mark_12th", "12th_HSC_Marksheet.pdf", "uploads/documents/12th_HSC_Marksheet.pdf"),
            ("tc", "Transfer_Certificate.pdf", "uploads/documents/Transfer_Certificate.pdf"),
            ("community", "Community_Certificate.pdf", "uploads/documents/Community_Certificate.pdf"),
            ("income", "Income_Certificate.pdf", "uploads/documents/Income_Certificate.pdf"),
            ("bonafide", "First_Graduate_Bonafide.pdf", "uploads/documents/First_Graduate_Bonafide.pdf"),
            ("passport_photo", "Aarav_Passport_Photo.png", "uploads/documents/Aarav_Passport_Photo.png")
        ]

        for dtype, fname, fpath in docs_seed:
            db.add(StudentDocumentItem(
                student_id=st.id,
                document_type=dtype,
                file_name=fname,
                file_path=fpath,
                file_size_bytes=102400,
                uploaded_by="AIDS001"
            ))

        # 11. Seed Fee, Hostel, Bus
        db.add(Fee(
            student_id=st.id,
            admission_fee=15000.0,
            tuition_fee=85000.0,
            exam_fee=3500.0,
            hostel_fee=45000.0,
            bus_fee=18000.0,
            scholarship=25000.0,
            paid_amount=141500.0,
            balance=0.0,
            receipt_number="REC2025001928"
        ))

        db.add(Hostel(
            student_id=st.id,
            hostel="VSB Boys Hostel",
            block="Block A",
            room_number="204",
            mess_type="Non-Veg"
        ))

        db.add(Bus(
            student_id=st.id,
            bus_number="Route No. 4",
            route="Karur Bus Stand",
            driver="Murugan K",
            pickup_point="Karur Town Junction (07:45 AM)"
        ))

        # 12. Seed Scholarship, First Graduate, Nativity Details
        db.add(ScholarshipDetail(
            student_id=st.id,
            scholarship_name="Government First Graduate Tuition Fee Waiver",
            scholarship_type="Government First Graduate",
            scholarship_category="BC/MBC Welfare",
            scholarship_provider="Government of Tamil Nadu",
            academic_year="2024-2025",
            eligibility_status="Eligible",
            application_number="SCH202409821",
            application_date="2024-07-15",
            approval_date="2024-08-10",
            amount=25000.0,
            renewal_status="Renewed",
            application_status="Approved"
        ))

        db.add(FirstGraduateDetail(
            student_id=st.id,
            is_first_graduate=True,
            certificate_number="FG2021004921",
            issue_date="2021-06-15",
            eligibility_status="Eligible",
            verification_status="Verified",
            scholarship_name="First Graduate Tuition Fee Waiver",
            academic_year="2024-2025",
            amount=25000.0,
            approval_status="Approved"
        ))

        db.add(NativityDetail(
            student_id=st.id,
            native_state="Tamil Nadu",
            native_district="Karur",
            native_taluk="Karur",
            native_village="Thanthonimalai",
            native_city="Karur",
            native_pincode="639005",
            permanent_native_address="42 Anna Nagar, Thanthonimalai, Karur - 639005",
            nativity_status="Native of Tamil Nadu",
            certificate_number="NAT20209812",
            issue_date="2020-05-10",
            verification_status="Verified"
        ))

        db.commit()
        print("Database successfully re-seeded with comprehensive data for ALL 11 DEPARTMENTS (Years 1-4, Sections A, B, C)!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding VSB database: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
