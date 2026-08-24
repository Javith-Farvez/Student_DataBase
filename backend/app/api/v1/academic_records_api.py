from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from app.core.database import get_db
from app.models.models import (
    Student, SemesterMark, InternalMark, AssignmentMark, LabMark,
    ArrearRecord, ArrearAttempt, CertificateItem, InternshipRecord,
    HackathonRecord, AcademicAuditLog, AuditLog,
    InternalAssessmentEntry, AssignmentAssessmentEntry, LabMarkEntry, AssessmentConfiguration,
    Internal1Mark, Internal2Mark, AssignmentDetailMark, SemesterTheorySubjectMark,
    Assignment1Mark, Assignment2Mark, SubjectResult, SemesterResult, SGPAResult, CGPAResult,
    SGPARecord, CGPARecord
)
from app.services.academic_calculator import calculate_sgpa, calculate_cgpa
from app.services.audit_service import log_audit_event

router = APIRouter(prefix="", tags=["Complete Academic & Arrear Management APIs"])

# --- SCHEMAS ---
class SemesterMarkEntrySchema(BaseModel):
    student_id: str
    semester: int
    subject_code: str
    subject_name: str
    subject_type: Optional[str] = "Theory"  # Theory, Lab, Practical, Project, Elective
    credits: float = 3.0
    internal_mark: float = 45.0
    semester_exam_mark: float = 85.0
    updated_by: Optional[str] = "AIDS001"
    role: Optional[str] = "STAFF"
    reason: str

class ArrearAttemptSchema(BaseModel):
    arrear_id: str
    student_id: str
    attempt_number: int
    exam_date: str
    mark_obtained: float
    updated_by: Optional[str] = "AIDS001"
    reason: str

class InternshipCreateSchema(BaseModel):
    student_id: str
    company_name: str
    role: str
    internship_type: Optional[str] = "Industrial"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    duration: Optional[str] = "1 Month"
    technology: Optional[str] = "Python, FastAPI, React"
    description: Optional[str] = None
    certificate_file: Optional[str] = None
    updated_by: Optional[str] = "AIDS001"

class HackathonCreateSchema(BaseModel):
    student_id: str
    hackathon_name: str
    organizer: str
    date: Optional[str] = None
    level: Optional[str] = "National"  # College, District, State, National, International
    participation_status: Optional[str] = "Winner"  # Participation, Winner, Runner-up
    position: Optional[str] = "1st Place"
    prize: Optional[str] = "₹25,000"
    team_name: Optional[str] = "VSB Innovators"
    project_name: Optional[str] = "Smart Campus AI System"
    certificate_file: Optional[str] = None
    updated_by: Optional[str] = "AIDS001"


# --- 1. FULL ACADEMIC RECORD FETCH ENDPOINT ---
@router.get("/student/{student_id}/full-academic-record")
def get_full_academic_record(student_id: str, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    cur_sem = st.current_semester or 6

    # Fetch marks
    sem_marks = db.query(SemesterMark).filter(SemesterMark.student_id == st.id).all()
    
    # Fetch Arrears & Attempts
    arrears = db.query(ArrearRecord).filter(ArrearRecord.student_id == st.id).all()
    arrear_list = []
    for arr in arrears:
        attempts = db.query(ArrearAttempt).filter(ArrearAttempt.arrear_id == arr.id).all()
        arrear_list.append({
            "id": arr.id,
            "semester": arr.semester,
            "subject_code": arr.subject_code,
            "subject_name": arr.subject_name,
            "subject_type": arr.subject_type,
            "credits": arr.credits,
            "original_mark": arr.original_mark,
            "grade": arr.grade,
            "attempt_number": arr.attempt_number,
            "arrear_status": arr.arrear_status,
            "cleared_date": arr.cleared_date,
            "cleared_mark": arr.cleared_mark,
            "cleared_grade": arr.cleared_grade,
            "attempts": [{
                "attempt_number": att.attempt_number,
                "exam_date": att.exam_date,
                "mark_obtained": att.mark_obtained,
                "grade": att.grade,
                "result": att.result
            } for att in attempts]
        })

    # Fetch Certificates, Internships, Hackathons
    certs = db.query(CertificateItem).filter(CertificateItem.student_id == st.id).all()
    internships = db.query(InternshipRecord).filter(InternshipRecord.student_id == st.id).all()
    hackathons = db.query(HackathonRecord).filter(HackathonRecord.student_id == st.id).all()
    academic_logs = db.query(AcademicAuditLog).filter(AcademicAuditLog.student_id == st.id).all()

    # Build 8 Semesters Breakdown
    semesters_data = []
    for sem in range(1, 9):
        marks_in_sem = [m for m in sem_marks if m.semester == sem]
        is_completed = sem <= cur_sem
        sem_status = "Not Yet Completed" if not is_completed else ("Arrear Pending" if any(m.result == "Fail" or m.grade == "U" for m in marks_in_sem) else "Completed")

        sgpa = calculate_sgpa(marks_in_sem) if is_completed and marks_in_sem else 0.0

        semesters_data.append({
            "semester": sem,
            "year": (sem + 1) // 2,
            "status": sem_status,
            "is_completed": is_completed,
            "sgpa": sgpa,
            "subject_count": len(marks_in_sem),
            "passed_count": len([m for m in marks_in_sem if m.result == "Pass" and m.grade != "U"]),
            "failed_count": len([m for m in marks_in_sem if m.result == "Fail" or m.grade == "U"]),
            "credits_earned": sum(m.credits for m in marks_in_sem if m.result == "Pass" and m.grade != "U"),
            "subjects": [{
                "subject_code": m.subject_code,
                "subject_name": m.subject_name,
                "credits": m.credits,
                "internal_mark": m.internal_mark,
                "semester_exam_mark": m.semester_exam_mark,
                "total_mark": m.total_mark,
                "grade": m.grade,
                "grade_point": m.grade_point,
                "result": m.result
            } for m in marks_in_sem]
        })

    # Summary Math
    completed_marks = [m for m in sem_marks if m.semester <= cur_sem]
    cgpa = calculate_cgpa(completed_marks)
    total_arrears_ever = len(arrears)
    pending_arrears = len([a for a in arrears if a.arrear_status == "Pending"])
    cleared_arrears = len([a for a in arrears if a.arrear_status == "Cleared"])

    return {
        "student": {
            "id": st.id,
            "register_number": st.register_number,
            "full_name": st.full_name,
            "department_code": st.department.code if st.department else "AIDS",
            "department_name": st.department.name if st.department else "Artificial Intelligence & Data Science",
            "current_year": st.current_year,
            "current_semester": cur_sem,
            "cgpa": cgpa,
            "sgpa": st.sgpa,
            "total_arrears_ever": total_arrears_ever,
            "pending_arrears": pending_arrears,
            "cleared_arrears": cleared_arrears,
            "academic_status": "Eligible / Good Standing" if pending_arrears == 0 else f"{pending_arrears} Arrear Pending"
        },
        "semesters": semesters_data,
        "arrears": arrear_list,
        "certificates": [{
            "id": c.id, "name": c.name, "type": c.type, "issued_by": c.issued_by, "issue_date": c.issue_date, "achievement": c.achievement, "notes": c.notes
        } for c in certs],
        "internships": [{
            "id": i.id, "company_name": i.company_name, "role": i.role, "internship_type": i.internship_type, "duration": i.duration, "technology": i.technology
        } for i in internships],
        "hackathons": [{
            "id": h.id, "hackathon_name": h.hackathon_name, "organizer": h.organizer, "level": h.level, "participation_status": h.participation_status, "prize": h.prize
        } for h in hackathons],
        "academic_audit_logs": [{
            "module": log.module, "semester": log.semester, "subject_code": log.subject_code, "old_value": log.old_value, "new_value": log.new_value, "updated_by": log.updated_by, "reason": log.reason, "date": log.created_at.isoformat()
        } for log in academic_logs]
    }


# --- 2. UPDATE SEMESTER MARK WITH AUTOMATIC PASS/FAIL & ARREAR RECORDING ---
@router.post("/student/{student_id}/semester-mark")
def update_semester_mark(student_id: str, payload: SemesterMarkEntrySchema, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    cur_sem = st.current_semester or 6

    # Lock Future Semesters
    if payload.semester > cur_sem:
        raise HTTPException(status_code=400, detail=f"Future Semester Locked: Student is currently in Semester {cur_sem}. Semester {payload.semester} is 'Not Yet Completed'.")

    if not payload.reason.strip():
        raise HTTPException(status_code=400, detail="Audit Policy: Reason for change is mandatory for mark updates!")

    # Calculate Total, Grade, Grade Point, Result
    total_mark = payload.internal_mark + payload.semester_exam_mark
    
    if total_mark >= 90:
        grade, grade_point, result = "O", 10.0, "Pass"
    elif total_mark >= 80:
        grade, grade_point, result = "A+", 9.0, "Pass"
    elif total_mark >= 70:
        grade, grade_point, result = "A", 8.0, "Pass"
    elif total_mark >= 60:
        grade, grade_point, result = "B+", 7.0, "Pass"
    elif total_mark >= 50:
        grade, grade_point, result = "B", 6.0, "Pass"
    else:
        grade, grade_point, result = "U", 0.0, "Fail"

    # Query existing mark record
    rec = db.query(SemesterMark).filter(
        SemesterMark.student_id == st.id,
        SemesterMark.semester == payload.semester,
        SemesterMark.subject_code == payload.subject_code
    ).first()

    old_val = f"Total: {rec.total_mark}, Grade: {rec.grade}" if rec else "N/A"

    if not rec:
        rec = SemesterMark(
            student_id=st.id,
            semester=payload.semester,
            subject_code=payload.subject_code,
            subject_name=payload.subject_name,
            credits=payload.credits,
            internal_mark=payload.internal_mark,
            semester_exam_mark=payload.semester_exam_mark,
            total_mark=total_mark,
            grade=grade,
            grade_point=grade_point,
            result=result
        )
        db.add(rec)
    else:
        rec.internal_mark = payload.internal_mark
        rec.semester_exam_mark = payload.semester_exam_mark
        rec.total_mark = total_mark
        rec.grade = grade
        rec.grade_point = grade_point
        rec.result = result

    # --- ARREAR MANAGEMENT LOGIC ---
    existing_arrear = db.query(ArrearRecord).filter(
        ArrearRecord.student_id == st.id,
        ArrearRecord.subject_code == payload.subject_code
    ).first()

    if result == "Fail":
        if not existing_arrear:
            existing_arrear = ArrearRecord(
                student_id=st.id,
                semester=payload.semester,
                subject_code=payload.subject_code,
                subject_name=payload.subject_name,
                subject_type=payload.subject_type,
                credits=payload.credits,
                original_mark=total_mark,
                grade=grade,
                failure_reason="Scored below minimum passing threshold (50 marks)",
                attempt_number=1,
                arrear_status="Pending"
            )
            db.add(existing_arrear)
        else:
            existing_arrear.arrear_status = "Pending"
    elif result == "Pass" and existing_arrear and existing_arrear.arrear_status == "Pending":
        # Student cleared arrear!
        existing_arrear.arrear_status = "Cleared"
        existing_arrear.cleared_mark = total_mark
        existing_arrear.cleared_grade = grade
        existing_arrear.cleared_date = "2026-02-15"

    # Recalculate SGPA & CGPA
    all_completed = db.query(SemesterMark).filter(
        SemesterMark.student_id == st.id,
        SemesterMark.semester <= cur_sem
    ).all()

    sem_marks_list = [m for m in all_completed if m.semester == payload.semester] or [rec]
    st.sgpa = calculate_sgpa(sem_marks_list)
    st.cgpa = calculate_cgpa(all_completed)
    st.arrears_count = db.query(ArrearRecord).filter(
        ArrearRecord.student_id == st.id,
        ArrearRecord.arrear_status == "Pending"
    ).count()

    # Log Academic Audit Event
    audit_log = AcademicAuditLog(
        student_id=st.id,
        module="SEMESTER_MARKS",
        semester=payload.semester,
        subject_code=payload.subject_code,
        old_value=old_val,
        new_value=f"Total: {total_mark}, Grade: {grade}, Result: {result}",
        updated_by=payload.updated_by or "AIDS001",
        role=payload.role or "STAFF",
        reason=payload.reason
    )
    db.add(audit_log)

    db.commit()

    return {
        "message": f"🎉 Marks updated for {payload.subject_code} ({payload.subject_name})! Result: {result}, Grade: {grade}. Recalculated SGPA: {st.sgpa}, CGPA: {st.cgpa}.",
        "student_id": st.id,
        "sgpa": st.sgpa,
        "cgpa": st.cgpa,
        "result": result,
        "grade": grade,
        "pending_arrears": st.arrears_count
    }


# --- 3. ARREAR ATTEMPT ENTRY ENDPOINT ---
@router.post("/arrears/attempt")
def record_arrear_attempt(payload: ArrearAttemptSchema, db: Session = Depends(get_db)):
    arr = db.query(ArrearRecord).filter(ArrearRecord.id == payload.arrear_id).first()
    if not arr:
        raise HTTPException(status_code=404, detail="Arrear record not found")

    st = db.query(Student).filter(Student.id == arr.student_id).first()

    # Calculate result for attempt
    if payload.mark_obtained >= 50:
        att_grade, att_res = "B", "Pass"
    else:
        att_grade, att_res = "U", "Fail"

    att = ArrearAttempt(
        arrear_id=arr.id,
        student_id=arr.student_id,
        attempt_number=payload.attempt_number,
        exam_date=payload.exam_date,
        mark_obtained=payload.mark_obtained,
        grade=att_grade,
        result=att_res
    )
    db.add(att)

    arr.attempt_number = payload.attempt_number

    if att_res == "Pass":
        arr.arrear_status = "Cleared"
        arr.cleared_mark = payload.mark_obtained
        arr.cleared_grade = att_grade
        arr.cleared_date = payload.exam_date

    # Recalculate pending arrears count
    st.arrears_count = db.query(ArrearRecord).filter(
        ArrearRecord.student_id == st.id,
        ArrearRecord.arrear_status == "Pending"
    ).count()

    db.commit()

    return {
        "message": f"🎉 Arrear Attempt {payload.attempt_number} recorded for {arr.subject_code}! Status: {arr.arrear_status}",
        "arrear_status": arr.arrear_status,
        "pending_arrears": st.arrears_count
    }


# --- 4. INTERNSHIP & HACKATHON CREATION ENDPOINTS ---
@router.post("/internships", status_code=status.HTTP_201_CREATED)
def add_internship_record(payload: InternshipCreateSchema, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == payload.student_id) | (Student.register_number == payload.student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student digital profile not found")

    rec = InternshipRecord(
        student_id=st.id,
        company_name=payload.company_name,
        role=payload.role,
        internship_type=payload.internship_type,
        start_date=payload.start_date,
        end_date=payload.end_date,
        duration=payload.duration,
        technology=payload.technology,
        description=payload.description,
        certificate_file=payload.certificate_file
    )
    db.add(rec)
    db.commit()
    return {"message": f"🎉 Internship record at '{payload.company_name}' saved for {st.full_name}!", "internship_id": rec.id}

@router.post("/hackathons", status_code=status.HTTP_201_CREATED)
def add_hackathon_record(payload: HackathonCreateSchema, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == payload.student_id) | (Student.register_number == payload.student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student digital profile not found")

    rec = HackathonRecord(
        student_id=st.id,
        hackathon_name=payload.hackathon_name,
        organizer=payload.organizer,
        date=payload.date,
        level=payload.level,
        participation_status=payload.participation_status,
        position=payload.position,
        prize=payload.prize,
        team_name=payload.team_name,
        project_name=payload.project_name,
        certificate_file=payload.certificate_file
    )
    db.add(rec)
    db.commit()
    return {"message": f"🎉 Hackathon record '{payload.hackathon_name}' saved for {st.full_name}!", "hackathon_id": rec.id}


# --- 5. DYNAMIC ASSESSMENT MARK ENTRY ENDPOINTS ---
class DynamicInternalEntrySchema(BaseModel):
    student_id: str
    semester: int
    assessment_type: str  # Internal_1, Internal_2
    subject_code: str
    subject_name: str
    maximum_mark: float = 50.0
    obtained_mark: float = 0.0
    exam_date: Optional[str] = None
    faculty_name: Optional[str] = "Prof. M. Rajesh"
    remarks: Optional[str] = "Standard Internal Assessment"

class DynamicAssignmentEntrySchema(BaseModel):
    student_id: str
    semester: int
    assessment_type: str  # Assignment_1, Assignment_2
    subject_code: str
    subject_name: str
    maximum_mark: float = 100.0
    obtained_mark: float = 0.0
    submission_date: Optional[str] = None
    faculty_name: Optional[str] = "Prof. M. Rajesh"
    remarks: Optional[str] = "Assignment Submission"

class DynamicLabEntrySchema(BaseModel):
    student_id: str
    semester: int
    lab_code: str
    lab_name: str
    credits: float = 2.0
    internal_practical_mark: float = 40.0
    record_observation_mark: float = 10.0
    practical_exam_mark: float = 40.0
    viva_mark: float = 10.0
    assignment_mark: float = 0.0
    maximum_mark: float = 100.0
    obtained_mark: float = 90.0

@router.post("/internal-assessment-entry", status_code=status.HTTP_201_CREATED)
def add_dynamic_internal_mark(payload: DynamicInternalEntrySchema, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == payload.student_id) | (Student.register_number == payload.student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student digital profile not found")

    # Dynamic 50 -> 100 Conversion Math Formula
    converted = (payload.obtained_mark / payload.maximum_mark * 100.0) if payload.maximum_mark > 0 else 0.0

    entry = db.query(InternalAssessmentEntry).filter(
        InternalAssessmentEntry.student_id == st.id,
        InternalAssessmentEntry.semester == payload.semester,
        InternalAssessmentEntry.assessment_type == payload.assessment_type,
        InternalAssessmentEntry.subject_code == payload.subject_code
    ).first()

    if not entry:
        entry = InternalAssessmentEntry(
            student_id=st.id,
            semester=payload.semester,
            assessment_type=payload.assessment_type,
            subject_code=payload.subject_code,
            subject_name=payload.subject_name,
            maximum_mark=payload.maximum_mark,
            obtained_mark=payload.obtained_mark,
            converted_mark=converted,
            exam_date=payload.exam_date,
            faculty_name=payload.faculty_name,
            remarks=payload.remarks
        )
        db.add(entry)
    else:
        entry.maximum_mark = payload.maximum_mark
        entry.obtained_mark = payload.obtained_mark
        entry.converted_mark = converted
        entry.exam_date = payload.exam_date
        entry.faculty_name = payload.faculty_name
        entry.remarks = payload.remarks

    # Write Audit Log
    db.add(AcademicAuditLog(
        student_id=st.id,
        module=payload.assessment_type,
        semester=payload.semester,
        subject_code=payload.subject_code,
        old_value="Previous Entry",
        new_value=f"{payload.obtained_mark}/{payload.maximum_mark} (Converted: {converted:.1f}/100)",
        updated_by="AIDS001",
        role="STAFF",
        reason=f"Recorded {payload.assessment_type} mark for {payload.subject_code}"
    ))

    db.commit()
    return {
        "message": f"🎉 Saved {payload.assessment_type} for {payload.subject_code}: {payload.obtained_mark}/{payload.maximum_mark} (Converted: {converted:.1f}/100)!",
        "converted_mark": converted,
        "entry_id": entry.id
    }

@router.post("/assignment-entry", status_code=status.HTTP_201_CREATED)
def add_dynamic_assignment_mark(payload: DynamicAssignmentEntrySchema, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == payload.student_id) | (Student.register_number == payload.student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student digital profile not found")

    entry = db.query(AssignmentAssessmentEntry).filter(
        AssignmentAssessmentEntry.student_id == st.id,
        AssignmentAssessmentEntry.semester == payload.semester,
        AssignmentAssessmentEntry.assessment_type == payload.assessment_type,
        AssignmentAssessmentEntry.subject_code == payload.subject_code
    ).first()

    if not entry:
        entry = AssignmentAssessmentEntry(
            student_id=st.id,
            semester=payload.semester,
            assessment_type=payload.assessment_type,
            subject_code=payload.subject_code,
            subject_name=payload.subject_name,
            maximum_mark=payload.maximum_mark,
            obtained_mark=payload.obtained_mark,
            submission_date=payload.submission_date,
            faculty_name=payload.faculty_name,
            remarks=payload.remarks
        )
        db.add(entry)
    else:
        entry.maximum_mark = payload.maximum_mark
        entry.obtained_mark = payload.obtained_mark
        entry.submission_date = payload.submission_date
        entry.faculty_name = payload.faculty_name
        entry.remarks = payload.remarks

    db.commit()
    return {
        "message": f"🎉 Saved {payload.assessment_type} for {payload.subject_code}: {payload.obtained_mark}/{payload.maximum_mark}!",
        "entry_id": entry.id
    }

@router.post("/lab-entry", status_code=status.HTTP_201_CREATED)
def add_dynamic_lab_mark(payload: DynamicLabEntrySchema, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == payload.student_id) | (Student.register_number == payload.student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student digital profile not found")

    tot = payload.obtained_mark
    if tot >= 90:
        grd, gp, res = "O", 10.0, "Pass"
    elif tot >= 80:
        grd, gp, res = "A+", 9.0, "Pass"
    elif tot >= 70:
        grd, gp, res = "A", 8.0, "Pass"
    elif tot >= 60:
        grd, gp, res = "B+", 7.0, "Pass"
    elif tot >= 50:
        grd, gp, res = "B", 6.0, "Pass"
    else:
        grd, gp, res = "U", 0.0, "Fail"

    entry = db.query(LabMarkEntry).filter(
        LabMarkEntry.student_id == st.id,
        LabMarkEntry.semester == payload.semester,
        LabMarkEntry.lab_code == payload.lab_code
    ).first()

    if not entry:
        entry = LabMarkEntry(
            student_id=st.id,
            semester=payload.semester,
            lab_code=payload.lab_code,
            lab_name=payload.lab_name,
            credits=payload.credits,
            internal_practical_mark=payload.internal_practical_mark,
            record_observation_mark=payload.record_observation_mark,
            practical_exam_mark=payload.practical_exam_mark,
            viva_mark=payload.viva_mark,
            assignment_mark=payload.assignment_mark,
            maximum_mark=payload.maximum_mark,
            obtained_mark=payload.obtained_mark,
            total_mark=tot,
            grade=grd,
            grade_point=gp,
            result=res,
            arrear_status="None" if res == "Pass" else "Pending"
        )
        db.add(entry)
    else:
        entry.credits = payload.credits
        entry.internal_practical_mark = payload.internal_practical_mark
        entry.record_observation_mark = payload.record_observation_mark
        entry.practical_exam_mark = payload.practical_exam_mark
        entry.viva_mark = payload.viva_mark
        entry.obtained_mark = payload.obtained_mark
        entry.total_mark = tot
        entry.grade = grd
        entry.grade_point = gp
        entry.result = res
        entry.arrear_status = "None" if res == "Pass" else "Pending"

    db.commit()
    return {
        "message": f"🎉 Saved Lab '{payload.lab_code}' ({payload.lab_name}): Total {tot}/100, Grade {grd}, Result: {res}!",
        "total_mark": tot,
        "grade": grd,
        "grade_point": gp,
        "result": res,
        "entry_id": entry.id
    }


# --- SCHEMAS FOR 4 COMPONENT MARK MODULES ---

class Internal1SubjectItem(BaseModel):
    subject_code: str
    subject_name: str
    maximum_mark: float = 50.0
    obtained_mark: float = 0.0
    exam_date: Optional[str] = None
    faculty_name: Optional[str] = "Prof. M. Rajesh"
    remarks: Optional[str] = None

class Internal1SavePayload(BaseModel):
    semester: int
    subjects: List[Internal1SubjectItem]
    updated_by: Optional[str] = "AIDS001"
    role: Optional[str] = "STAFF"
    reason: Optional[str] = "Internal 1 assessment marks entry"

class Internal2SubjectItem(BaseModel):
    subject_code: str
    subject_name: str
    maximum_mark: float = 50.0
    obtained_mark: float = 0.0
    exam_date: Optional[str] = None
    faculty_name: Optional[str] = "Prof. M. Rajesh"
    remarks: Optional[str] = None

class Internal2SavePayload(BaseModel):
    semester: int
    subjects: List[Internal2SubjectItem]
    updated_by: Optional[str] = "AIDS001"
    role: Optional[str] = "STAFF"
    reason: Optional[str] = "Internal 2 assessment marks entry"

class AssignmentSubjectItem(BaseModel):
    subject_code: str
    subject_name: str
    assignment_1_max: float = 100.0
    assignment_1_obtained: float = 0.0
    assignment_2_max: float = 100.0
    assignment_2_obtained: float = 0.0
    submission_date: Optional[str] = None
    faculty_name: Optional[str] = "Prof. M. Rajesh"
    remarks: Optional[str] = None

class AssignmentSavePayload(BaseModel):
    semester: int
    subjects: List[AssignmentSubjectItem]
    updated_by: Optional[str] = "AIDS001"
    role: Optional[str] = "STAFF"
    reason: Optional[str] = "Assignment marks entry"

class SemesterTheorySubjectPayloadItem(BaseModel):
    subject_code: str
    subject_name: str
    credits: float = 3.0
    internal_mark: float = 0.0
    semester_exam_mark: float = 0.0
    maximum_semester_mark: float = 100.0

class SemesterLabSubjectPayloadItem(BaseModel):
    lab_code: str
    lab_name: str
    credits: float = 2.0
    internal_practical_mark: float = 0.0
    practical_exam_mark: float = 0.0
    viva_mark: float = 0.0
    record_observation_mark: float = 0.0
    maximum_mark: float = 100.0
    obtained_mark: float = 0.0

class SemesterMarksSavePayload(BaseModel):
    semester: int
    theory_subjects: List[SemesterTheorySubjectPayloadItem] = []
    lab_subjects: List[SemesterLabSubjectPayloadItem] = []
    updated_by: Optional[str] = "AIDS001"
    role: Optional[str] = "STAFF"
    reason: Optional[str] = "Semester marks entry"


# --- 1. INTERNAL MARKS 1 ENDPOINTS ---

@router.post("/students/{student_id}/academic/internal-1", status_code=status.HTTP_200_OK)
@router.post("/student/{student_id}/academic/internal-1", status_code=status.HTTP_200_OK)
def save_internal_1_marks(student_id: str, payload: Internal1SavePayload, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    cur_sem = st.current_semester or 6
    if payload.semester > cur_sem:
        raise HTTPException(status_code=400, detail=f"Future Semester Locked: Student is currently in Semester {cur_sem}.")

    saved_records = []
    for sub in payload.subjects:
        max_m = sub.maximum_mark if sub.maximum_mark > 0 else 50.0
        conv = (sub.obtained_mark / max_m) * 100.0

        rec = db.query(Internal1Mark).filter(
            Internal1Mark.student_id == st.id,
            Internal1Mark.semester == payload.semester,
            Internal1Mark.subject_code == sub.subject_code
        ).first()

        old_val = f"{rec.obtained_mark}/{rec.maximum_mark} (Converted: {rec.converted_mark})" if rec else "N/A"

        if not rec:
            rec = Internal1Mark(
                student_id=st.id,
                semester=payload.semester,
                subject_code=sub.subject_code,
                subject_name=sub.subject_name,
                maximum_mark=max_m,
                obtained_mark=sub.obtained_mark,
                converted_mark=conv,
                exam_date=sub.exam_date,
                faculty_name=sub.faculty_name,
                remarks=sub.remarks
            )
            db.add(rec)
        else:
            rec.maximum_mark = max_m
            rec.obtained_mark = sub.obtained_mark
            rec.converted_mark = conv
            rec.exam_date = sub.exam_date
            rec.faculty_name = sub.faculty_name
            rec.remarks = sub.remarks

        # Audit Log
        db.add(AcademicAuditLog(
            student_id=st.id,
            module="INTERNAL_MARKS_1",
            semester=payload.semester,
            subject_code=sub.subject_code,
            old_value=old_val,
            new_value=f"{sub.obtained_mark}/{max_m} (Converted: {conv:.1f}/100)",
            updated_by=payload.updated_by or "AIDS001",
            role=payload.role or "STAFF",
            reason=payload.reason or "Saved Internal 1 Marks"
        ))

        saved_records.append({
            "subject_code": sub.subject_code,
            "subject_name": sub.subject_name,
            "maximum_mark": max_m,
            "obtained_mark": sub.obtained_mark,
            "converted_mark": round(conv, 2)
        })

    db.commit()
    return {
        "message": f"🎉 Internal 1 Marks successfully saved for {st.full_name} (Semester {payload.semester})!",
        "student_id": st.id,
        "semester": payload.semester,
        "count": len(saved_records),
        "records": saved_records
    }

@router.get("/students/{student_id}/academic/internal-1")
@router.get("/student/{student_id}/academic/internal-1")
def get_internal_1_marks(student_id: str, semester: Optional[int] = None, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    query = db.query(Internal1Mark).filter(Internal1Mark.student_id == st.id)
    if semester:
        query = query.filter(Internal1Mark.semester == semester)
    
    records = query.all()
    return {
        "student_id": st.id,
        "register_number": st.register_number,
        "full_name": st.full_name,
        "semester": semester,
        "records": [{
            "id": r.id,
            "semester": r.semester,
            "subject_code": r.subject_code,
            "subject_name": r.subject_name,
            "maximum_mark": r.maximum_mark,
            "obtained_mark": r.obtained_mark,
            "converted_mark": round(r.converted_mark, 2),
            "exam_date": r.exam_date,
            "faculty_name": r.faculty_name,
            "remarks": r.remarks
        } for r in records]
    }

@router.put("/students/{student_id}/academic/internal-1/{record_id}")
@router.put("/student/{student_id}/academic/internal-1/{record_id}")
def update_internal_1_single(student_id: str, record_id: str, payload: Internal1SubjectItem, db: Session = Depends(get_db)):
    rec = db.query(Internal1Mark).filter(Internal1Mark.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Internal 1 record not found")

    max_m = payload.maximum_mark if payload.maximum_mark > 0 else 50.0
    conv = (payload.obtained_mark / max_m) * 100.0

    rec.subject_code = payload.subject_code
    rec.subject_name = payload.subject_name
    rec.maximum_mark = max_m
    rec.obtained_mark = payload.obtained_mark
    rec.converted_mark = conv
    rec.exam_date = payload.exam_date
    rec.faculty_name = payload.faculty_name
    rec.remarks = payload.remarks

    db.commit()
    return {"message": "Internal 1 mark record updated successfully!", "record_id": rec.id, "converted_mark": round(conv, 2)}

@router.delete("/students/{student_id}/academic/internal-1/{record_id}")
@router.delete("/student/{student_id}/academic/internal-1/{record_id}")
def delete_internal_1_single(student_id: str, record_id: str, db: Session = Depends(get_db)):
    rec = db.query(Internal1Mark).filter(Internal1Mark.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Internal 1 record not found")

    db.delete(rec)
    db.commit()
    return {"message": "Internal 1 subject mark deleted successfully!"}


# --- 2. INTERNAL MARKS 2 ENDPOINTS ---

@router.post("/students/{student_id}/academic/internal-2", status_code=status.HTTP_200_OK)
@router.post("/student/{student_id}/academic/internal-2", status_code=status.HTTP_200_OK)
def save_internal_2_marks(student_id: str, payload: Internal2SavePayload, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    cur_sem = st.current_semester or 6
    if payload.semester > cur_sem:
        raise HTTPException(status_code=400, detail=f"Future Semester Locked: Student is currently in Semester {cur_sem}.")

    saved_records = []
    for sub in payload.subjects:
        max_m = sub.maximum_mark if sub.maximum_mark > 0 else 50.0
        conv = (sub.obtained_mark / max_m) * 100.0

        rec = db.query(Internal2Mark).filter(
            Internal2Mark.student_id == st.id,
            Internal2Mark.semester == payload.semester,
            Internal2Mark.subject_code == sub.subject_code
        ).first()

        old_val = f"{rec.obtained_mark}/{rec.maximum_mark} (Converted: {rec.converted_mark})" if rec else "N/A"

        if not rec:
            rec = Internal2Mark(
                student_id=st.id,
                semester=payload.semester,
                subject_code=sub.subject_code,
                subject_name=sub.subject_name,
                maximum_mark=max_m,
                obtained_mark=sub.obtained_mark,
                converted_mark=conv,
                exam_date=sub.exam_date,
                faculty_name=sub.faculty_name,
                remarks=sub.remarks
            )
            db.add(rec)
        else:
            rec.maximum_mark = max_m
            rec.obtained_mark = sub.obtained_mark
            rec.converted_mark = conv
            rec.exam_date = sub.exam_date
            rec.faculty_name = sub.faculty_name
            rec.remarks = sub.remarks

        # Audit Log
        db.add(AcademicAuditLog(
            student_id=st.id,
            module="INTERNAL_MARKS_2",
            semester=payload.semester,
            subject_code=sub.subject_code,
            old_value=old_val,
            new_value=f"{sub.obtained_mark}/{max_m} (Converted: {conv:.1f}/100)",
            updated_by=payload.updated_by or "AIDS001",
            role=payload.role or "STAFF",
            reason=payload.reason or "Saved Internal 2 Marks"
        ))

        saved_records.append({
            "subject_code": sub.subject_code,
            "subject_name": sub.subject_name,
            "maximum_mark": max_m,
            "obtained_mark": sub.obtained_mark,
            "converted_mark": round(conv, 2)
        })

    db.commit()
    return {
        "message": f"🎉 Internal 2 Marks successfully saved for {st.full_name} (Semester {payload.semester})!",
        "student_id": st.id,
        "semester": payload.semester,
        "count": len(saved_records),
        "records": saved_records
    }

@router.get("/students/{student_id}/academic/internal-2")
@router.get("/student/{student_id}/academic/internal-2")
def get_internal_2_marks(student_id: str, semester: Optional[int] = None, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    query = db.query(Internal2Mark).filter(Internal2Mark.student_id == st.id)
    if semester:
        query = query.filter(Internal2Mark.semester == semester)
    
    records = query.all()
    return {
        "student_id": st.id,
        "register_number": st.register_number,
        "full_name": st.full_name,
        "semester": semester,
        "records": [{
            "id": r.id,
            "semester": r.semester,
            "subject_code": r.subject_code,
            "subject_name": r.subject_name,
            "maximum_mark": r.maximum_mark,
            "obtained_mark": r.obtained_mark,
            "converted_mark": round(r.converted_mark, 2),
            "exam_date": r.exam_date,
            "faculty_name": r.faculty_name,
            "remarks": r.remarks
        } for r in records]
    }

@router.put("/students/{student_id}/academic/internal-2/{record_id}")
@router.put("/student/{student_id}/academic/internal-2/{record_id}")
def update_internal_2_single(student_id: str, record_id: str, payload: Internal2SubjectItem, db: Session = Depends(get_db)):
    rec = db.query(Internal2Mark).filter(Internal2Mark.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Internal 2 record not found")

    max_m = payload.maximum_mark if payload.maximum_mark > 0 else 50.0
    conv = (payload.obtained_mark / max_m) * 100.0

    rec.subject_code = payload.subject_code
    rec.subject_name = payload.subject_name
    rec.maximum_mark = max_m
    rec.obtained_mark = payload.obtained_mark
    rec.converted_mark = conv
    rec.exam_date = payload.exam_date
    rec.faculty_name = payload.faculty_name
    rec.remarks = payload.remarks

    db.commit()
    return {"message": "Internal 2 mark record updated successfully!", "record_id": rec.id, "converted_mark": round(conv, 2)}

@router.delete("/students/{student_id}/academic/internal-2/{record_id}")
@router.delete("/student/{student_id}/academic/internal-2/{record_id}")
def delete_internal_2_single(student_id: str, record_id: str, db: Session = Depends(get_db)):
    rec = db.query(Internal2Mark).filter(Internal2Mark.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Internal 2 record not found")

    db.delete(rec)
    db.commit()
    return {"message": "Internal 2 subject mark deleted successfully!"}


# --- 3. ASSIGNMENT MARKS ENDPOINTS ---

@router.post("/students/{student_id}/academic/assignments", status_code=status.HTTP_200_OK)
@router.post("/student/{student_id}/academic/assignments", status_code=status.HTTP_200_OK)
def save_assignment_marks(student_id: str, payload: AssignmentSavePayload, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    cur_sem = st.current_semester or 6
    if payload.semester > cur_sem:
        raise HTTPException(status_code=400, detail=f"Future Semester Locked: Student is currently in Semester {cur_sem}.")

    saved_records = []
    for sub in payload.subjects:
        avg = (sub.assignment_1_obtained + sub.assignment_2_obtained) / 2.0

        # Detailed combined record
        rec = db.query(AssignmentDetailMark).filter(
            AssignmentDetailMark.student_id == st.id,
            AssignmentDetailMark.semester == payload.semester,
            AssignmentDetailMark.subject_code == sub.subject_code
        ).first()

        old_val = f"Assg1: {rec.assignment_1_obtained}, Assg2: {rec.assignment_2_obtained}, Avg: {rec.assignment_average}" if rec else "N/A"

        if not rec:
            rec = AssignmentDetailMark(
                student_id=st.id,
                semester=payload.semester,
                subject_code=sub.subject_code,
                subject_name=sub.subject_name,
                maximum_mark=max(sub.assignment_1_max, sub.assignment_2_max, 100.0),
                assignment_1_obtained=sub.assignment_1_obtained,
                assignment_2_obtained=sub.assignment_2_obtained,
                assignment_average=avg,
                submission_date=sub.submission_date,
                faculty_name=sub.faculty_name,
                remarks=sub.remarks
            )
            db.add(rec)
        else:
            rec.assignment_1_obtained = sub.assignment_1_obtained
            rec.assignment_2_obtained = sub.assignment_2_obtained
            rec.assignment_average = avg
            rec.submission_date = sub.submission_date
            rec.faculty_name = sub.faculty_name
            rec.remarks = sub.remarks

        # Populate assignment_1_marks table
        a1 = db.query(Assignment1Mark).filter(
            Assignment1Mark.student_id == st.id,
            Assignment1Mark.semester == payload.semester,
            Assignment1Mark.subject_code == sub.subject_code
        ).first()
        if not a1:
            a1 = Assignment1Mark(
                student_id=st.id, semester=payload.semester, subject_code=sub.subject_code, subject_name=sub.subject_name,
                maximum_mark=sub.assignment_1_max, obtained_mark=sub.assignment_1_obtained, submission_date=sub.submission_date,
                faculty_name=sub.faculty_name, remarks=sub.remarks
            )
            db.add(a1)
        else:
            a1.obtained_mark = sub.assignment_1_obtained

        # Populate assignment_2_marks table
        a2 = db.query(Assignment2Mark).filter(
            Assignment2Mark.student_id == st.id,
            Assignment2Mark.semester == payload.semester,
            Assignment2Mark.subject_code == sub.subject_code
        ).first()
        if not a2:
            a2 = Assignment2Mark(
                student_id=st.id, semester=payload.semester, subject_code=sub.subject_code, subject_name=sub.subject_name,
                maximum_mark=sub.assignment_2_max, obtained_mark=sub.assignment_2_obtained, submission_date=sub.submission_date,
                faculty_name=sub.faculty_name, remarks=sub.remarks
            )
            db.add(a2)
        else:
            a2.obtained_mark = sub.assignment_2_obtained

        # Audit log
        db.add(AcademicAuditLog(
            student_id=st.id,
            module="ASSIGNMENT_MARKS",
            semester=payload.semester,
            subject_code=sub.subject_code,
            old_value=old_val,
            new_value=f"Assg1: {sub.assignment_1_obtained}, Assg2: {sub.assignment_2_obtained}, Avg: {avg:.1f}",
            updated_by=payload.updated_by or "AIDS001",
            role=payload.role or "STAFF",
            reason=payload.reason or "Saved Assignment Marks"
        ))

        saved_records.append({
            "subject_code": sub.subject_code,
            "subject_name": sub.subject_name,
            "assignment_1_obtained": sub.assignment_1_obtained,
            "assignment_2_obtained": sub.assignment_2_obtained,
            "assignment_average": round(avg, 2)
        })

    db.commit()
    return {
        "message": f"🎉 Assignment Marks successfully saved for {st.full_name} (Semester {payload.semester})!",
        "student_id": st.id,
        "semester": payload.semester,
        "count": len(saved_records),
        "records": saved_records
    }

@router.get("/students/{student_id}/academic/assignments")
@router.get("/student/{student_id}/academic/assignments")
def get_assignment_marks(student_id: str, semester: Optional[int] = None, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    query = db.query(AssignmentDetailMark).filter(AssignmentDetailMark.student_id == st.id)
    if semester:
        query = query.filter(AssignmentDetailMark.semester == semester)
    
    records = query.all()
    return {
        "student_id": st.id,
        "register_number": st.register_number,
        "full_name": st.full_name,
        "semester": semester,
        "records": [{
            "id": r.id,
            "semester": r.semester,
            "subject_code": r.subject_code,
            "subject_name": r.subject_name,
            "assignment_1_obtained": r.assignment_1_obtained,
            "assignment_2_obtained": r.assignment_2_obtained,
            "assignment_average": round(r.assignment_average, 2),
            "submission_date": r.submission_date,
            "faculty_name": r.faculty_name,
            "remarks": r.remarks
        } for r in records]
    }

@router.put("/students/{student_id}/academic/assignments/{record_id}")
@router.put("/student/{student_id}/academic/assignments/{record_id}")
def update_assignment_single(student_id: str, record_id: str, payload: AssignmentSubjectItem, db: Session = Depends(get_db)):
    rec = db.query(AssignmentDetailMark).filter(AssignmentDetailMark.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Assignment record not found")

    avg = (payload.assignment_1_obtained + payload.assignment_2_obtained) / 2.0
    rec.subject_code = payload.subject_code
    rec.subject_name = payload.subject_name
    rec.assignment_1_obtained = payload.assignment_1_obtained
    rec.assignment_2_obtained = payload.assignment_2_obtained
    rec.assignment_average = avg
    rec.submission_date = payload.submission_date
    rec.faculty_name = payload.faculty_name
    rec.remarks = payload.remarks

    db.commit()
    return {"message": "Assignment mark record updated successfully!", "record_id": rec.id, "assignment_average": round(avg, 2)}

@router.delete("/students/{student_id}/academic/assignments/{record_id}")
@router.delete("/student/{student_id}/academic/assignments/{record_id}")
def delete_assignment_single(student_id: str, record_id: str, db: Session = Depends(get_db)):
    rec = db.query(AssignmentDetailMark).filter(AssignmentDetailMark.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=404, detail="Assignment record not found")

    db.delete(rec)
    db.commit()
    return {"message": "Assignment subject record deleted successfully!"}


# --- 4. SEMESTER MARKS ENDPOINTS (THEORY & LAB SUBJECTS + AUTOMATIC SGPA/CGPA/ARREARS) ---

@router.post("/students/{student_id}/academic/semester-marks", status_code=status.HTTP_200_OK)
@router.post("/student/{student_id}/academic/semester-marks", status_code=status.HTTP_200_OK)
def save_semester_marks(student_id: str, payload: SemesterMarksSavePayload, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    cur_sem = st.current_semester or 6
    if payload.semester > cur_sem:
        raise HTTPException(status_code=400, detail=f"Future Semester Locked: Student is currently in Semester {cur_sem}.")

    saved_theory = []
    saved_labs = []

    # 1. Process Theory Subjects
    for t_sub in payload.theory_subjects:
        tot = t_sub.internal_mark + t_sub.semester_exam_mark
        
        if tot >= 90: grd, gp, res = "O", 10.0, "Pass"
        elif tot >= 80: grd, gp, res = "A+", 9.0, "Pass"
        elif tot >= 70: grd, gp, res = "A", 8.0, "Pass"
        elif tot >= 60: grd, gp, res = "B+", 7.0, "Pass"
        elif tot >= 50: grd, gp, res = "B", 6.0, "Pass"
        else: grd, gp, res = "U", 0.0, "Fail"

        # Theory record in semester_subject_marks
        rec = db.query(SemesterTheorySubjectMark).filter(
            SemesterTheorySubjectMark.student_id == st.id,
            SemesterTheorySubjectMark.semester == payload.semester,
            SemesterTheorySubjectMark.subject_code == t_sub.subject_code
        ).first()

        arr_status = "None" if res == "Pass" else "Pending"

        if not rec:
            rec = SemesterTheorySubjectMark(
                student_id=st.id,
                semester=payload.semester,
                subject_code=t_sub.subject_code,
                subject_name=t_sub.subject_name,
                credits=t_sub.credits,
                internal_mark=t_sub.internal_mark,
                semester_exam_mark=t_sub.semester_exam_mark,
                maximum_semester_mark=t_sub.maximum_semester_mark,
                total_mark=tot,
                grade=grd,
                grade_point=gp,
                result=res,
                arrear_status=arr_status
            )
            db.add(rec)
        else:
            rec.credits = t_sub.credits
            rec.internal_mark = t_sub.internal_mark
            rec.semester_exam_mark = t_sub.semester_exam_mark
            rec.total_mark = tot
            rec.grade = grd
            rec.grade_point = gp
            rec.result = res
            rec.arrear_status = arr_status

        # Also store in SemesterMark (for full transcript compatibility)
        sm = db.query(SemesterMark).filter(
            SemesterMark.student_id == st.id,
            SemesterMark.semester == payload.semester,
            SemesterMark.subject_code == t_sub.subject_code
        ).first()
        if not sm:
            db.add(SemesterMark(
                student_id=st.id, semester=payload.semester, subject_code=t_sub.subject_code, subject_name=t_sub.subject_name,
                credits=t_sub.credits, internal_mark=t_sub.internal_mark, semester_exam_mark=t_sub.semester_exam_mark,
                total_mark=tot, grade=grd, grade_point=gp, result=res
            ))
        else:
            sm.internal_mark = t_sub.internal_mark
            sm.semester_exam_mark = t_sub.semester_exam_mark
            sm.total_mark = tot
            sm.grade = grd
            sm.grade_point = gp
            sm.result = res

        # Also store in subject_results table
        sr = db.query(SubjectResult).filter(
            SubjectResult.student_id == st.id,
            SubjectResult.semester == payload.semester,
            SubjectResult.subject_code == t_sub.subject_code
        ).first()
        if not sr:
            db.add(SubjectResult(
                student_id=st.id, semester=payload.semester, subject_code=t_sub.subject_code, subject_name=t_sub.subject_name,
                subject_type="Theory", credits=t_sub.credits, internal_mark=t_sub.internal_mark, exam_mark=t_sub.semester_exam_mark,
                total_mark=tot, grade=grd, grade_point=gp, result=res, arrear_status=arr_status
            ))
        else:
            sr.total_mark = tot
            sr.grade = grd
            sr.grade_point = gp
            sr.result = res
            sr.arrear_status = arr_status

        # Automatic Arrear Management
        existing_arr = db.query(ArrearRecord).filter(
            ArrearRecord.student_id == st.id,
            ArrearRecord.subject_code == t_sub.subject_code
        ).first()

        if res == "Fail":
            if not existing_arr:
                db.add(ArrearRecord(
                    student_id=st.id,
                    semester=payload.semester,
                    subject_code=t_sub.subject_code,
                    subject_name=t_sub.subject_name,
                    subject_type="Theory",
                    credits=t_sub.credits,
                    original_mark=tot,
                    grade=grd,
                    failure_reason="Scored below minimum passing threshold (50 marks)",
                    attempt_number=1,
                    arrear_status="Pending"
                ))
            else:
                existing_arr.arrear_status = "Pending"
        elif res == "Pass" and existing_arr and existing_arr.arrear_status == "Pending":
            existing_arr.arrear_status = "Cleared"
            existing_arr.cleared_mark = tot
            existing_arr.cleared_grade = grd
            existing_arr.cleared_date = "2026-02-15"

        saved_theory.append({
            "subject_code": t_sub.subject_code, "subject_name": t_sub.subject_name, "credits": t_sub.credits,
            "total_mark": tot, "grade": grd, "grade_point": gp, "result": res
        })

    # 2. Process Lab Subjects
    for l_sub in payload.lab_subjects:
        tot = l_sub.obtained_mark if l_sub.obtained_mark > 0 else (l_sub.internal_practical_mark + l_sub.practical_exam_mark + l_sub.viva_mark + l_sub.record_observation_mark)
        
        if tot >= 90: grd, gp, res = "O", 10.0, "Pass"
        elif tot >= 80: grd, gp, res = "A+", 9.0, "Pass"
        elif tot >= 70: grd, gp, res = "A", 8.0, "Pass"
        elif tot >= 60: grd, gp, res = "B+", 7.0, "Pass"
        elif tot >= 50: grd, gp, res = "B", 6.0, "Pass"
        else: grd, gp, res = "U", 0.0, "Fail"

        arr_status = "None" if res == "Pass" else "Pending"

        lab_rec = db.query(LabMarkEntry).filter(
            LabMarkEntry.student_id == st.id,
            LabMarkEntry.semester == payload.semester,
            LabMarkEntry.lab_code == l_sub.lab_code
        ).first()

        if not lab_rec:
            lab_rec = LabMarkEntry(
                student_id=st.id,
                semester=payload.semester,
                lab_code=l_sub.lab_code,
                lab_name=l_sub.lab_name,
                credits=l_sub.credits,
                internal_practical_mark=l_sub.internal_practical_mark,
                record_observation_mark=l_sub.record_observation_mark,
                practical_exam_mark=l_sub.practical_exam_mark,
                viva_mark=l_sub.viva_mark,
                maximum_mark=l_sub.maximum_mark,
                obtained_mark=tot,
                total_mark=tot,
                grade=grd,
                grade_point=gp,
                result=res,
                arrear_status=arr_status
            )
            db.add(lab_rec)
        else:
            lab_rec.credits = l_sub.credits
            lab_rec.internal_practical_mark = l_sub.internal_practical_mark
            lab_rec.record_observation_mark = l_sub.record_observation_mark
            lab_rec.practical_exam_mark = l_sub.practical_exam_mark
            lab_rec.viva_mark = l_sub.viva_mark
            lab_rec.obtained_mark = tot
            lab_rec.total_mark = tot
            lab_rec.grade = grd
            lab_rec.grade_point = gp
            lab_rec.result = res
            lab_rec.arrear_status = arr_status

        # Also store in subject_results
        sr = db.query(SubjectResult).filter(
            SubjectResult.student_id == st.id,
            SubjectResult.semester == payload.semester,
            SubjectResult.subject_code == l_sub.lab_code
        ).first()
        if not sr:
            db.add(SubjectResult(
                student_id=st.id, semester=payload.semester, subject_code=l_sub.lab_code, subject_name=l_sub.lab_name,
                subject_type="Lab", credits=l_sub.credits, internal_mark=l_sub.internal_practical_mark, exam_mark=l_sub.practical_exam_mark,
                total_mark=tot, grade=grd, grade_point=gp, result=res, arrear_status=arr_status
            ))
        else:
            sr.total_mark = tot
            sr.grade = grd
            sr.grade_point = gp
            sr.result = res
            sr.arrear_status = arr_status

        saved_labs.append({
            "lab_code": l_sub.lab_code, "lab_name": l_sub.lab_name, "credits": l_sub.credits,
            "total_mark": tot, "grade": grd, "grade_point": gp, "result": res
        })

    # 3. Calculate SGPA & CGPA Math
    all_theory = db.query(SemesterTheorySubjectMark).filter(SemesterTheorySubjectMark.student_id == st.id).all()
    all_labs = db.query(LabMarkEntry).filter(LabMarkEntry.student_id == st.id).all()

    sem_theory = [t for t in all_theory if t.semester == payload.semester]
    sem_labs = [l for l in all_labs if l.semester == payload.semester]

    sem_credits = sum(t.credits for t in sem_theory) + sum(l.credits for l in sem_labs)
    sem_earned = sum(t.credits for t in sem_theory if t.result == "Pass") + sum(l.credits for l in sem_labs if l.result == "Pass")
    
    weighted_sum = sum(t.credits * t.grade_point for t in sem_theory) + sum(l.credits * l.grade_point for l in sem_labs)
    calculated_sgpa = round(weighted_sum / sem_credits, 2) if sem_credits > 0 else 0.0

    # Cumulative CGPA across completed semesters <= cur_sem
    completed_theory = [t for t in all_theory if t.semester <= cur_sem]
    completed_labs = [l for l in all_labs if l.semester <= cur_sem]
    
    tot_credits = sum(t.credits for t in completed_theory) + sum(l.credits for l in completed_labs)
    tot_weighted = sum(t.credits * t.grade_point for t in completed_theory) + sum(l.credits * l.grade_point for l in completed_labs)
    calculated_cgpa = round(tot_weighted / tot_credits, 2) if tot_credits > 0 else calculated_sgpa

    # Update Student Model
    st.sgpa = calculated_sgpa
    st.cgpa = calculated_cgpa
    st.arrears_count = db.query(ArrearRecord).filter(ArrearRecord.student_id == st.id, ArrearRecord.arrear_status == "Pending").count()

    # Store SGPAResult & CGPAResult
    sg_res = db.query(SGPAResult).filter(SGPAResult.student_id == st.id, SGPAResult.semester == payload.semester).first()
    if not sg_res:
        db.add(SGPAResult(student_id=st.id, semester=payload.semester, sgpa=calculated_sgpa, total_credits=sem_credits, credits_earned=sem_earned))
    else:
        sg_res.sgpa = calculated_sgpa
        sg_res.total_credits = sem_credits
        sg_res.credits_earned = sem_earned

    cg_res = db.query(CGPAResult).filter(CGPAResult.student_id == st.id).first()
    if not cg_res:
        db.add(CGPAResult(student_id=st.id, cgpa=calculated_cgpa, completed_semesters=cur_sem, total_credits_earned=tot_credits))
    else:
        cg_res.cgpa = calculated_cgpa
        cg_res.completed_semesters = cur_sem
        cg_res.total_credits_earned = tot_credits

    # Write Audit Log
    db.add(AcademicAuditLog(
        student_id=st.id,
        module="SEMESTER_MARKS",
        semester=payload.semester,
        old_value="Previous Semester Marks",
        new_value=f"Saved {len(saved_theory)} theory & {len(saved_labs)} lab subjects. Calculated SGPA: {calculated_sgpa}, CGPA: {calculated_cgpa}",
        updated_by=payload.updated_by or "AIDS001",
        role=payload.role or "STAFF",
        reason=payload.reason or "Semester Marks Submission"
    ))

    db.commit()

    passed_count = len([t for t in saved_theory if t["result"] == "Pass"]) + len([l for l in saved_labs if l["result"] == "Pass"])
    failed_count = len([t for t in saved_theory if t["result"] == "Fail"]) + len([l for l in saved_labs if l["result"] == "Fail"])

    return {
        "message": f"🎉 Semester {payload.semester} Marks saved! SGPA: {calculated_sgpa}, CGPA: {calculated_cgpa}.",
        "student_id": st.id,
        "semester": payload.semester,
        "sgpa": calculated_sgpa,
        "cgpa": calculated_cgpa,
        "total_subjects": len(saved_theory) + len(saved_labs),
        "theory_count": len(saved_theory),
        "lab_count": len(saved_labs),
        "passed_count": passed_count,
        "failed_count": failed_count,
        "pending_arrears": st.arrears_count,
        "theory_subjects": saved_theory,
        "lab_subjects": saved_labs
    }

@router.get("/students/{student_id}/academic/semester-marks")
@router.get("/student/{student_id}/academic/semester-marks")
def get_semester_marks(student_id: str, semester: Optional[int] = None, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    target_sem = semester or st.current_semester or 6

    theory_recs = db.query(SemesterTheorySubjectMark).filter(
        SemesterTheorySubjectMark.student_id == st.id,
        SemesterTheorySubjectMark.semester == target_sem
    ).all()

    lab_recs = db.query(LabMarkEntry).filter(
        LabMarkEntry.student_id == st.id,
        LabMarkEntry.semester == target_sem
    ).all()

    tot_credits = sum(r.credits for r in theory_recs) + sum(r.credits for r in lab_recs)
    earned_credits = sum(r.credits for r in theory_recs if r.result == "Pass") + sum(r.credits for r in lab_recs if r.result == "Pass")

    return {
        "student_id": st.id,
        "register_number": st.register_number,
        "full_name": st.full_name,
        "semester": target_sem,
        "sgpa": st.sgpa,
        "cgpa": st.cgpa,
        "summary": {
            "total_subjects": len(theory_recs) + len(lab_recs),
            "theory_subjects": len(theory_recs),
            "lab_subjects": len(lab_recs),
            "total_credits": tot_credits,
            "credits_earned": earned_credits,
            "passed_count": len([r for r in theory_recs if r.result == "Pass"]) + len([r for r in lab_recs if r.result == "Pass"]),
            "failed_count": len([r for r in theory_recs if r.result == "Fail"]) + len([r for r in lab_recs if r.result == "Fail"]),
            "pending_arrears": st.arrears_count
        },
        "theory_subjects": [{
            "id": r.id, "subject_code": r.subject_code, "subject_name": r.subject_name, "credits": r.credits,
            "internal_mark": r.internal_mark, "semester_exam_mark": r.semester_exam_mark, "maximum_semester_mark": r.maximum_semester_mark,
            "total_mark": r.total_mark, "grade": r.grade, "grade_point": r.grade_point, "result": r.result, "arrear_status": r.arrear_status
        } for r in theory_recs],
        "lab_subjects": [{
            "id": r.id, "lab_code": r.lab_code, "lab_name": r.lab_name, "credits": r.credits,
            "internal_practical_mark": r.internal_practical_mark, "practical_exam_mark": r.practical_exam_mark,
            "viva_mark": r.viva_mark, "record_observation_mark": r.record_observation_mark,
            "maximum_mark": r.maximum_mark, "obtained_mark": r.obtained_mark, "total_mark": r.total_mark,
            "grade": r.grade, "grade_point": r.grade_point, "result": r.result, "arrear_status": r.arrear_status
        } for r in lab_recs]
    }


# --- 5. SGPA, CGPA, ARREARS & OVERVIEW FETCH ENDPOINTS ---

@router.get("/students/{student_id}/academic/sgpa")
@router.get("/student/{student_id}/academic/sgpa")
def get_sgpa_endpoint(student_id: str, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    sg_recs = db.query(SGPAResult).filter(SGPAResult.student_id == st.id).all()
    return {
        "student_id": st.id,
        "current_sgpa": st.sgpa,
        "semesters": [{
            "semester": r.semester, "sgpa": r.sgpa, "total_credits": r.total_credits, "credits_earned": r.credits_earned
        } for r in sg_recs]
    }

@router.get("/students/{student_id}/academic/cgpa")
@router.get("/student/{student_id}/academic/cgpa")
def get_cgpa_endpoint(student_id: str, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    cg_res = db.query(CGPAResult).filter(CGPAResult.student_id == st.id).first()
    return {
        "student_id": st.id,
        "cgpa": st.cgpa,
        "completed_semesters": cg_res.completed_semesters if cg_res else (st.current_semester or 6),
        "total_credits_earned": cg_res.total_credits_earned if cg_res else st.credits_earned
    }

@router.get("/students/{student_id}/academic/arrears")
@router.get("/student/{student_id}/academic/arrears")
def get_arrears_endpoint(student_id: str, db: Session = Depends(get_db)):
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")

    arrears = db.query(ArrearRecord).filter(ArrearRecord.student_id == st.id).all()
    return {
        "student_id": st.id,
        "total_arrears": len(arrears),
        "pending_arrears": len([a for a in arrears if a.arrear_status == "Pending"]),
        "cleared_arrears": len([a for a in arrears if a.arrear_status == "Cleared"]),
        "records": [{
            "id": a.id, "semester": a.semester, "subject_code": a.subject_code, "subject_name": a.subject_name,
            "subject_type": a.subject_type, "credits": a.credits, "original_mark": a.original_mark, "grade": a.grade,
            "attempt_number": a.attempt_number, "arrear_status": a.arrear_status, "cleared_date": a.cleared_date,
            "cleared_mark": a.cleared_mark, "cleared_grade": a.cleared_grade
        } for a in arrears]
    }

