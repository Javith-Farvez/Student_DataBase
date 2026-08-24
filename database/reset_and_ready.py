import os
import sys
import hashlib

# Append backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.core.database import SessionLocal, engine, Base
from app.models.models import Role, Department, User, Program, Section, Student

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def prepare_clean_database():
    print("==================================================")
    print("  VSB SmartCampus -- Resetting for User Data Entry")
    print("==================================================")
    
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Seed 4 Staff Roles
        roles_data = [
            ("SUPER_ADMIN", "V.S.B System Administrator"),
            ("PRINCIPAL", "Principal Executive Portal"),
            ("HOD", "Head of Department Portal"),
            ("STAFF", "Faculty & Staff Portal")
        ]
        
        roles_map = {}
        for name, desc in roles_data:
            role = Role(name=name, description=desc, is_system_role=True)
            db.add(role)
            db.commit()
            db.refresh(role)
            roles_map[name] = role

        # 2. Seed V.S.B Engineering College Departments
        depts_data = [
            ("CSE", "Computer Science & Engineering"),
            ("AIDS", "Artificial Intelligence & Data Science"),
            ("ECE", "Electronics & Communication Engineering"),
            ("EEE", "Electrical & Electronics Engineering"),
            ("MECH", "Mechanical Engineering"),
            ("CIVIL", "Civil Engineering"),
            ("IT", "Information Technology")
        ]
        
        depts_map = {}
        for code, name in depts_data:
            dept = Department(code=code, name=name)
            db.add(dept)
            db.commit()
            db.refresh(dept)
            depts_map[code] = dept

            # Program & Section
            prog = Program(department_id=dept.id, name=f"B.E. {name}", duration_years=4)
            db.add(prog)
            db.commit()
            db.refresh(prog)

            sec = Section(program_id=prog.id, year=3, semester=6, name="A")
            db.add(sec)
            db.commit()

        # 3. Seed Authorized Staff Logins
        pass_hash = hash_password("pass123")
        admin_pass_hash = hash_password("admin123")

        users_data = [
            ("admin@vsb.ac.in", "ADMIN001", "Dr. V.S.B Administrator", roles_map["SUPER_ADMIN"].id, None, admin_pass_hash),
            ("principal@vsb.ac.in", "PRIN001", "Dr. V.S.B Principal", roles_map["PRINCIPAL"].id, None, pass_hash),
            ("hod.aids@vsb.ac.in", "HOD001", "Dr. K. Senthil Kumar (HOD AI&DS)", roles_map["HOD"].id, depts_map["AIDS"].id, pass_hash),
            ("staff.aids@vsb.ac.in", "STF001", "Prof. M. Rajesh (Faculty AI&DS)", roles_map["STAFF"].id, depts_map["AIDS"].id, pass_hash)
        ]

        for email, emp_id, name, role_id, dept_id, phash in users_data:
            u = User(email=email, employee_id=emp_id, full_name=name, role_id=role_id, department_id=dept_id, password_hash=phash, is_active=True)
            db.add(u)

        db.commit()
        print("[SUCCESS] Database is clean and ready for user student data entry!")

    except Exception as e:
        db.rollback()
        print("[ERROR] Error preparing clean database:", e)
    finally:
        db.close()

if __name__ == "__main__":
    prepare_clean_database()
