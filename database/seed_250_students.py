import os
import sys
import random
import hashlib
from datetime import datetime, date

# Append backend directory to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../backend')))

from app.core.database import SessionLocal, engine, Base
from app.models.models import Role, Department, User, Program, Section, Student, FaceRecognition

FIRST_NAMES = [
  "Aarav", "Priya", "Vikram", "Ananya", "Rohan", "Kavya", "Siddharth", "Divya", "Aditya", "Meera",
  "Karthik", "Sneha", "Rahul", "Pooja", "Arjun", "Deepika", "Varun", "Nithya", "Ganesh", "Swetha",
  "Harish", "Shruti", "Senthil", "Lakshmi", "Vijay", "Bhavana", "Dinesh", "Ramya", "Manoj", "Keerthana",
  "Prashanth", "Gayathri", "Ashok", "Pavithra", "Sanjay", "Janani", "Naveen", "Abinaya", "Surya", "Preethi"
]

LAST_NAMES = [
  "Sharma", "Ananth", "Chandran", "Raman", "Narayanan", "Subramanian", "Krishnan", "Venkatesh", "Balaji", "Sundaram",
  "Iyer", "Mudaliar", "Gounder", "Chettiar", "Pillai", "Naidu", "Reddy", "Menon", "Nair", "Verma"
]

CITIES = ["Karur", "Coimbatore", "Tiruchirappalli", "Salem", "Erode", "Madurai", "Chennai", "Namakkal", "Dindigul", "Thanjavur"]
COMMUNITIES = ["BC", "MBC", "OC", "SC", "ST"]
BLOOD_GROUPS = ["O+", "A+", "B+", "AB+", "O-", "A-", "B-"]
COMPANIES = ["Zoho Corporation", "Amazon AWS", "TCS Digital", "Infosys Power Programmer", "Cognizant GenC", "Accenture", "L&T Technology Services"]

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()

def seed_250_students():
    print("==================================================")
    print("  VSB SmartCampus -- 250 Student Records Seeder")
    print("==================================================")
    
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Ensure Roles
        roles_data = [
            ("SUPER_ADMIN", "V.S.B System Administrator"),
            ("PRINCIPAL", "Principal Executive Portal"),
            ("HOD", "Head of Department Portal"),
            ("STAFF", "Faculty & Staff Portal")
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

        # 2. Ensure Departments, Programs, and Sections
        depts_data = [
            ("CSE", "Computer Science & Engineering"),
            ("AIDS", "Artificial Intelligence & Data Science"),
            ("ECE", "Electronics & Communication Engineering"),
            ("EEE", "Electrical & Electronics Engineering"),
            ("MECH", "Mechanical Engineering"),
            ("CIVIL", "Civil Engineering"),
            ("IT", "Information Technology")
        ]
        
        depts_list = []
        progs_map = {}
        secs_map = {}

        for code, name in depts_data:
            dept = db.query(Department).filter(Department.code == code).first()
            if not dept:
                dept = Department(code=code, name=name)
                db.add(dept)
                db.commit()
                db.refresh(dept)
            depts_list.append(dept)

            # Ensure Program
            prog = db.query(Program).filter(Program.department_id == dept.id).first()
            if not prog:
                prog = Program(department_id=dept.id, name=f"B.E. {name}", duration_years=4)
                db.add(prog)
                db.commit()
                db.refresh(prog)
            progs_map[dept.id] = prog

            # Ensure Section
            sec = db.query(Section).filter(Section.program_id == prog.id, Section.year == 3).first()
            if not sec:
                sec = Section(program_id=prog.id, year=3, semester=6, name="A")
                db.add(sec)
                db.commit()
                db.refresh(sec)
            secs_map[dept.id] = sec

        # 3. Seed 250 Realistic Student Records
        start_reg_no = 922521104001
        created_count = 0

        for i in range(250):
            reg_str = str(start_reg_no + i)
            existing = db.query(Student).filter(Student.register_number == reg_str).first()
            if existing:
                continue

            fname = FIRST_NAMES[i % len(FIRST_NAMES)]
            lname = LAST_NAMES[(i * 3) % len(LAST_NAMES)]
            full_name = f"{fname} {lname}"
            
            dept = depts_list[i % len(depts_list)]
            prog = progs_map[dept.id]
            sec = secs_map[dept.id]

            roll_str = f"21{dept.code[:2]}{i+1:03d}"
            adm_str = f"VSB2021{i+1:03d}"
            
            gender = "Female" if i % 2 == 1 else "Male"
            blood = BLOOD_GROUPS[i % len(BLOOD_GROUPS)]
            city = CITIES[i % len(CITIES)]
            community = COMMUNITIES[i % len(COMMUNITIES)]
            
            # Realistic academic scores
            cgpa = round(random.uniform(7.5, 9.8), 2)
            att = round(random.uniform(85.0, 99.5), 1)
            placed = "Placed" if cgpa > 8.0 else "In Training"
            company = COMPANIES[i % len(COMPANIES)] if placed == "Placed" else None
            pkg = f"{round(random.uniform(4.5, 18.0), 1)} LPA" if placed == "Placed" else None
            
            st = Student(
                register_number=reg_str,
                roll_number=roll_str,
                admission_number=adm_str,
                full_name=full_name,
                dob=f"2004-{(i%12)+1:02d}-{(i%28)+1:02d}",
                gender=gender,
                blood_group=blood,
                email=f"{fname.lower()}.{lname.lower()}{i+1}@vsb.ac.in",
                phone=f"+91 98765 {i+1:05d}",
                department_id=dept.id,
                program_id=prog.id,
                section_id=sec.id,
                current_year=3,
                current_semester=6,
                batch="2021-2025",
                father_name=f"{LAST_NAMES[(i+2)%len(LAST_NAMES)]} {lname}",
                mother_name=f"Lakshmi {lname}",
                parent_phone=f"+91 98760 {i+1:05d}",
                address_line=f"{i+10} Main Street, {city} Road",
                city=city,
                state="Tamil Nadu",
                nationality="Indian",
                religion="Hindu",
                community=community,
                scholarship_details="First Graduate Scholarship" if i % 3 == 0 else "Merit Scholarship",
                hostel_details=f"VSB Hostel Block-{(i%3)+1}, Room {(i%40)+101}" if i % 2 == 0 else "Day Scholar",
                bus_route=f"Bus Route No. {(i%8)+1} ({city} Stand)" if i % 2 == 1 else "Hostel Stay",
                cgpa=cgpa,
                attendance_percentage=att,
                placement_status=placed,
                placed_company=company,
                package_offered=pkg,
                photo_url=f"https://ui-avatars.com/api/?name={fname}+{lname}&background=B22222&color=F4B400&size=180"
            )
            db.add(st)
            db.flush()

            # Seed 512-d Face embedding
            from app.services.face_service import generate_mock_face_embedding
            import json
            face_vec = generate_mock_face_embedding(st.register_number)
            face_rec = FaceRecognition(
                student_id=st.id,
                encrypted_face_embedding=json.dumps(face_vec),
                status="Active"
            )
            db.add(face_rec)

            created_count += 1
            if created_count % 50 == 0:
                db.commit()
                print(f"  ...Seeded {created_count} / 250 student profiles & AI face vectors")

        db.commit()
        print(f"[SUCCESS] Successfully seeded 250 student records into PostgreSQL database!")

    except Exception as e:
        db.rollback()
        print("[ERROR] Error seeding 250 students:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_250_students()
