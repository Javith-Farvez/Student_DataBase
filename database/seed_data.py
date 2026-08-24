import os
import sys
import hashlib
from datetime import datetime
from sqlalchemy import or_

# Append backend app directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.core.database import SessionLocal, engine, Base
from app.models.models import Role, Department, User, Program, Section, Student, StaffClassAssignment

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def seed_vsb_database():
    print("==================================================")
    print("  V.S.B ENGINEERING COLLEGE - Enterprise Database Seeder")
    print("==================================================")
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed Roles (Admin, Principal, HOD, Staff)
        roles_data = [
            ("SUPER_ADMIN", "V.S.B System Administrator - Complete ERP Control"),
            ("PRINCIPAL", "Principal Executive Portal - Institutional Analytics & Approvals"),
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

        # 2. Seed ALL 11 Official V.S.B. Engineering College UG Departments
        depts_data = [
            ("IT", "Information Technology", "Dr. A. Murugan (HOD IT)"),
            ("CSE", "Computer Science and Engineering", "Dr. S. Kanthasamy (HOD CSE)"),
            ("AIDS", "Artificial Intelligence and Data Science", "Dr. K. Senthil Kumar (HOD AI&DS)"),
            ("AIML", "Artificial Intelligence and Machine Learning", "Dr. R. Kavitha (HOD AI&ML)"),
            ("CSBS", "Computer Science and Business System", "Dr. P. Ramesh (HOD CSBS)"),
            ("CCE", "Computer and Communication Engineering", "Dr. M. Suresh (HOD CCE)"),
            ("ECE", "Electronics and Communication Engineering", "Dr. N. Vijay (HOD ECE)"),
            ("EEE", "Electrical and Electronics Engineering", "Dr. T. Karthik (HOD EEE)"),
            ("MECH", "Mechanical Engineering", "Dr. G. Baskaran (HOD MECH)"),
            ("CHEM", "Chemical Engineering", "Dr. S. Priya (HOD CHEM)"),
            ("CIVIL", "Civil Engineering", "Dr. K. Balaji (HOD CIVIL)")
        ]
        
        depts_map = {}
        for code, name, hod_name in depts_data:
            dept = db.query(Department).filter(Department.code == code).first()
            if not dept:
                dept = Department(code=code, name=name, hod=hod_name, status="Active")
                db.add(dept)
                db.commit()
                db.refresh(dept)
            else:
                dept.name = name
                dept.hod = hod_name
                db.commit()
            depts_map[code] = dept

        # 3. Seed Authorized Staff Accounts
        pass_hash = hash_password("pass123")
        admin_pass_hash = hash_password("admin123")

        users_data = [
            # 1. ADMIN
            {
                "email": "admin@vsb.ac.in",
                "employee_id": "ADMIN001",
                "full_name": "Dr. V.S.B Administrator",
                "role_id": roles_map["SUPER_ADMIN"].id,
                "dept_id": None,
                "password_hash": admin_pass_hash
            },
            # 2. PRINCIPAL
            {
                "email": "principal@vsb.ac.in",
                "employee_id": "PRIN001",
                "full_name": "Dr. V.S.B Principal",
                "role_id": roles_map["PRINCIPAL"].id,
                "dept_id": None,
                "password_hash": pass_hash
            },
            # 3. HODs for each Department
            {
                "email": "hod.aids@vsb.ac.in",
                "employee_id": "AIDS_HOD_001",
                "full_name": "Dr. K. Senthil Kumar (HOD AI&DS)",
                "role_id": roles_map["HOD"].id,
                "dept_id": depts_map["AIDS"].id,
                "password_hash": pass_hash
            },
            {
                "email": "hod.it@vsb.ac.in",
                "employee_id": "IT_HOD_001",
                "full_name": "Dr. A. Murugan (HOD IT)",
                "role_id": roles_map["HOD"].id,
                "dept_id": depts_map["IT"].id,
                "password_hash": pass_hash
            },
            {
                "email": "hod.cse@vsb.ac.in",
                "employee_id": "CSE_HOD_001",
                "full_name": "Dr. S. Kanthasamy (HOD CSE)",
                "role_id": roles_map["HOD"].id,
                "dept_id": depts_map["CSE"].id,
                "password_hash": pass_hash
            },
            # 4. STAFF Members
            {
                "email": "staff.aids@vsb.ac.in",
                "employee_id": "STAFF_AIDS_001",
                "full_name": "Prof. M. Rajesh (Faculty AI&DS)",
                "role_id": roles_map["STAFF"].id,
                "dept_id": depts_map["AIDS"].id,
                "password_hash": pass_hash
            },
            {
                "email": "staff.it@vsb.ac.in",
                "employee_id": "STAFF_IT_001",
                "full_name": "Prof. S. Divya (Faculty IT)",
                "role_id": roles_map["STAFF"].id,
                "dept_id": depts_map["IT"].id,
                "password_hash": pass_hash
            }
        ]

        users_map = {}
        for u in users_data:
            user = db.query(User).filter(
                or_(User.email == u["email"], User.employee_id == u["employee_id"])
            ).first()
            if not user:
                user = User(
                    email=u["email"],
                    employee_id=u["employee_id"],
                    full_name=u["full_name"],
                    role_id=u["role_id"],
                    department_id=u["dept_id"],
                    password_hash=u["password_hash"],
                    is_active=True
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            else:
                user.employee_id = u["employee_id"]
                user.department_id = u["dept_id"]
                user.password_hash = u["password_hash"]
                db.commit()
            users_map[u["employee_id"]] = user

        # 4. Seed Staff Class Assignments
        staff_aids = users_map.get("STAFF_AIDS_001")
        if staff_aids:
            assignments = [
                {"year": 1, "sec": "A", "sem": 1},
                {"year": 2, "sec": "C", "sem": 3},
                {"year": 3, "sec": "B", "sem": 5}
            ]
            for assign in assignments:
                existing = db.query(StaffClassAssignment).filter(
                    StaffClassAssignment.user_id == staff_aids.id,
                    StaffClassAssignment.department_id == depts_map["AIDS"].id,
                    StaffClassAssignment.year == assign["year"],
                    StaffClassAssignment.section_name == assign["sec"]
                ).first()
                if not existing:
                    new_assign = StaffClassAssignment(
                        user_id=staff_aids.id,
                        department_id=depts_map["AIDS"].id,
                        year=assign["year"],
                        section_name=assign["sec"],
                        is_class_advisor=True
                    )
                    db.add(new_assign)
            db.commit()

        # 5. Seed Programs & Sections for all 11 departments
        for code, dept in depts_map.items():
            prog = db.query(Program).filter(Program.department_id == dept.id).first()
            if not prog:
                prog = Program(department_id=dept.id, name=f"B.Tech {dept.name}")
                db.add(prog)
                db.commit()
                db.refresh(prog)

            for yr in range(1, 5):
                for sec_name in ["A", "B", "C", "D"]:
                    sec = db.query(Section).filter(
                        Section.program_id == prog.id,
                        Section.year == yr,
                        Section.name == sec_name
                    ).first()
                    if not sec:
                        sec = Section(program_id=prog.id, year=yr, semester=(yr * 2 - 1), name=sec_name)
                        db.add(sec)
            db.commit()

        # 6. Seed Sample Students for each department
        sample_students_data = [
            ("IT", "922521205001", "21IT001", "Kavya Ramesh", "2004-03-15", "Female", 8.85, 96.0, "Cognizant", "6.5 LPA"),
            ("CSE", "922521104001", "21CS001", "Vikas Kumar", "2004-06-10", "Male", 9.10, 97.5, "TCS Digital", "7.5 LPA"),
            ("AIDS", "922521104002", "21AD001", "Aarav Sharma", "2004-05-12", "Male", 8.92, 95.4, "Zoho Corp", "12.5 LPA"),
            ("AIDS", "922521104003", "21AD002", "Priya Ananth", "2004-08-22", "Female", 9.45, 98.2, "Amazon AWS", "28.0 LPA"),
            ("AIML", "922521104004", "21ML001", "Rohan Gupta", "2004-09-18", "Male", 9.05, 96.8, "Microsoft", "24.0 LPA"),
            ("CSBS", "922521104005", "21CB001", "Ananya Reddy", "2004-01-25", "Female", 8.70, 94.2, "TCS CB", "7.0 LPA"),
            ("ECE", "922521106001", "21EC001", "Sanjay Nathan", "2004-11-05", "Male", 8.60, 93.0, "Qualcomm", "16.0 LPA"),
            ("EEE", "922521105001", "21EE001", "Meera Krishnan", "2004-04-12", "Female", 8.40, 92.5, "L&T Electrical", "8.0 LPA"),
            ("MECH", "922521114001", "21ME001", "Arun Prakash", "2004-07-30", "Male", 8.20, 91.0, "TATA Motors", "9.5 LPA"),
            ("CIVIL", "922521103001", "21CE001", "Deepak Sundar", "2004-02-14", "Male", 8.10, 90.0, "L&T Construction", "8.5 LPA")
        ]

        for dept_code, reg, roll, name, dob, gender, cgpa, att, company, pkg in sample_students_data:
            dept = depts_map[dept_code]
            st = db.query(Student).filter(Student.register_number == reg).first()
            if not st:
                st = Student(
                    register_number=reg,
                    roll_number=roll,
                    admission_number=f"VSB{roll}",
                    full_name=name,
                    dob=dob,
                    gender=gender,
                    blood_group="O+",
                    email=f"{roll.lower()}@vsb.ac.in",
                    phone="+91 98765 43210",
                    department_id=dept.id,
                    current_year=3,
                    current_semester=6,
                    section_name="A",
                    batch="2021-2025",
                    father_name="Father " + name,
                    mother_name="Mother " + name,
                    parent_phone="+91 98765 00001",
                    cgpa=cgpa,
                    attendance_percentage=att,
                    placed_company=company,
                    package_offered=pkg,
                    photo_url=f"https://ui-avatars.com/api/?name={name.replace(' ', '+')}&background=B22222&color=F4B400&size=180"
                )
                db.add(st)
        db.commit()

        print("Database successfully seeded with ALL 11 V.S.B ENGINEERING COLLEGE UG Departments!")

    except Exception as e:
        db.rollback()
        print("Error during database seeding:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_vsb_database()
