import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.models import (
    Student, StudentFeeProfile, StudentFeeRecord, SemesterFeeRecord, FeeType, FeePayment,
    HostelRecord, TransportRecord, ScholarshipRecord, FirstGraduateRecord, IncomeCertificateRecord,
    NativityRecord, StudentBankDetail, FinancialAuditLog
)

router = APIRouter(prefix="/financial", tags=["Structured Financial, Hostel, Transport & Scholarship APIs"])

# ─── SCHEMAS ───────────────────────────────────────────────────────────────────

class QuotaProfileSchema(BaseModel):
    quota_category: str # Government Quota, Management Quota, Other / Special Category
    quota_details: Optional[str] = None
    approval_number: Optional[str] = None
    approval_date: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"
    reason: Optional[str] = "Updated student quota selection"

class YearFeeRecordSchema(BaseModel):
    year: int
    academic_year: str
    tuition_fee: float = 0.0
    admission_fee: float = 0.0
    university_fee: float = 0.0
    exam_fee: float = 0.0
    lab_fee: float = 0.0
    library_fee: float = 0.0
    development_fee: float = 0.0
    sports_fee: float = 0.0
    placement_fee: float = 0.0
    other_college_fee: float = 0.0
    bus_fee: float = 0.0
    hostel_fee: float = 0.0
    mess_fee: float = 0.0
    special_fee: float = 0.0
    scholarship_amount: float = 0.0
    waiver_amount: float = 0.0
    paid_amount: float = 0.0
    payment_status: str = "Pending"
    remarks: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"
    reason: Optional[str] = "Year fee record update"

class SemesterFeeSchema(BaseModel):
    semester: int
    academic_year: str
    fee_type: str = "Tuition Fee"
    amount: float = 0.0
    due_date: Optional[str] = None
    paid_amount: float = 0.0
    payment_status: str = "Pending"
    receipt_number: Optional[str] = None
    remarks: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"

class PaymentRecordSchema(BaseModel):
    academic_year: Optional[str] = "2024-2025"
    semester: Optional[int] = 6
    amount: float
    payment_date: str
    payment_mode: str # Cash, UPI, Bank Transfer, Online, Other
    transaction_number: Optional[str] = None
    receipt_number: str
    receipt_file: Optional[str] = None
    collected_by: Optional[str] = "Accounts Office"
    remarks: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"

class HostelRecordSchema(BaseModel):
    year: int
    academic_year: str
    is_hosteller: bool = True
    hostel_required: str = "Yes"
    hostel_name: str = "VSB Main Hostel"
    hostel_block: str = "A Block"
    floor: Optional[str] = "1st Floor"
    room_number: str = "101"
    bed_number: Optional[str] = "B1"
    mess_type: str = "Non-Veg"
    allocation_date: Optional[str] = None
    vacated_date: Optional[str] = None
    hostel_status: str = "Active"
    hostel_fee: float = 45000.0
    mess_fee: float = 35000.0
    other_hostel_fee: float = 0.0
    scholarship_waiver: float = 0.0
    paid_amount: float = 0.0
    payment_status: str = "Pending"
    receipt_number: Optional[str] = None
    remarks: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"

class TransportRecordSchema(BaseModel):
    year: int
    academic_year: str
    transport_required: str = "Yes"
    bus_number: str = "BUS-01"
    route_number: str = "R-01"
    route_name: str = "Karur Central Route"
    boarding_point: str = "Karur Bus Stand"
    pickup_point: str = "Point A"
    drop_point: str = "VSB Campus Gate"
    driver_name: Optional[str] = "Murugan K"
    driver_contact: Optional[str] = "9876543210"
    transport_status: str = "Active"
    transport_fee: float = 18000.0
    concession_amount: float = 0.0
    paid_amount: float = 0.0
    payment_status: str = "Pending"
    receipt_number: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"

class ScholarshipRecordSchema(BaseModel):
    year: int
    academic_year: str
    scholarship_applicable: str = "Yes"
    scholarship_type: str = "Government Scholarship"
    scholarship_name: str = "BC/MBC Welfare Scholarship"
    provider: str = "Government of Tamil Nadu"
    category_reason: Optional[str] = None
    eligibility_status: str = "Eligible"
    application_number: Optional[str] = None
    application_date: Optional[str] = None
    approval_date: Optional[str] = None
    disbursement_date: Optional[str] = None
    eligible_amount: float = 25000.0
    approved_amount: float = 25000.0
    disbursed_amount: float = 0.0
    status: str = "Approved"
    supporting_document: Optional[str] = None
    approved_by: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"

class FirstGraduateRecordSchema(BaseModel):
    year: int
    academic_year: str
    is_first_graduate: str = "Yes"
    certificate_number: Optional[str] = None
    issue_date: Optional[str] = None
    verification_status: str = "Verified"
    is_eligible: str = "Yes"
    government_benefit_amount: float = 25000.0
    application_number: Optional[str] = None
    approval_status: str = "Approved"
    supporting_document: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"

class NativityRecordSchema(BaseModel):
    native_state: str = "Tamil Nadu"
    native_district: str = "Karur"
    native_taluk: str = "Karur"
    native_village: str = "Thanthonimalai"
    native_city: str = "Karur"
    native_pincode: str = "639005"
    permanent_native_address: Optional[str] = None
    certificate_number: Optional[str] = None
    issue_date: Optional[str] = None
    verification_status: str = "Verified"
    certificate_document: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"

class IncomeCertificateSchema(BaseModel):
    annual_income: float = 150000.0
    certificate_number: Optional[str] = None
    issue_date: Optional[str] = None
    valid_until: Optional[str] = None
    certificate_document: Optional[str] = None
    verification_status: str = "Verified"
    updated_by: Optional[str] = "ADMIN001"

class BankDetailSchema(BaseModel):
    account_holder_name: str
    bank_name: str
    account_number: str
    ifsc_code: str
    branch_name: Optional[str] = None
    passbook_document: Optional[str] = None
    updated_by: Optional[str] = "ADMIN001"

# ─── HELPER FUNC ──────────────────────────────────────────────────────────────

def get_student(db: Session, student_id: str) -> Student:
    st = db.query(Student).filter((Student.id == student_id) | (Student.register_number == student_id)).first()
    if not st:
        raise HTTPException(status_code=404, detail="Student record not found")
    return st

# ─── ENDPOINTS ────────────────────────────────────────────────────────────────

@router.get("/students/{student_id}/summary")
def get_student_financial_summary(student_id: str, db: Session = Depends(get_db)):
    """Returns complete 4-Year financial, hostel, transport, scholarship, first graduate, nativity & bank profile."""
    st = get_student(db, student_id)

    # 1. Profile / Quota
    profile = db.query(StudentFeeProfile).filter(StudentFeeProfile.student_id == st.id).first()
    quota = profile.quota_category if profile else "Government Quota"

    # 2. Year Fee Records (1-4 Year)
    year_recs = db.query(StudentFeeRecord).filter(StudentFeeRecord.student_id == st.id).order_by(StudentFeeRecord.year.asc()).all()
    
    # 3. Semester Fee Records (1-8 Sem)
    sem_recs = db.query(SemesterFeeRecord).filter(SemesterFeeRecord.student_id == st.id).order_by(SemesterFeeRecord.semester.asc()).all()

    # 4. Payments Log
    payments = db.query(FeePayment).filter(FeePayment.student_id == st.id).order_by(FeePayment.created_at.desc()).all()

    # 5. Hostel Records (1-4 Year)
    hostel_recs = db.query(HostelRecord).filter(HostelRecord.student_id == st.id).order_by(HostelRecord.year.asc()).all()

    # 6. Transport Records (1-4 Year)
    transport_recs = db.query(TransportRecord).filter(TransportRecord.student_id == st.id).order_by(TransportRecord.year.asc()).all()

    # 7. Scholarship Schemes
    scholarships = db.query(ScholarshipRecord).filter(ScholarshipRecord.student_id == st.id).order_by(ScholarshipRecord.year.asc()).all()

    # 8. First Graduate Records
    fg_recs = db.query(FirstGraduateRecord).filter(FirstGraduateRecord.student_id == st.id).order_by(FirstGraduateRecord.year.asc()).all()

    # 9. Nativity & Income
    nativity = db.query(NativityRecord).filter(NativityRecord.student_id == st.id).first()
    income = db.query(IncomeCertificateRecord).filter(IncomeCertificateRecord.student_id == st.id).first()

    # 10. Bank Info
    bank = db.query(StudentBankDetail).filter(StudentBankDetail.student_id == st.id).first()

    # Calculate 4-Year Totals
    total_fee = sum(r.total_fee for r in year_recs) or (st.fee_record.tuition_fee + st.fee_record.bus_fee + st.fee_record.hostel_fee if st.fee_record else 148500.0)
    total_paid = sum(r.paid_amount for r in year_recs) or (st.fee_record.paid_amount if st.fee_record else 141500.0)
    total_scholarship = sum(r.scholarship_amount for r in year_recs) or (st.fee_record.scholarship if st.fee_record else 25000.0)
    total_waiver = sum(r.waiver_amount for r in year_recs) or 0.0
    
    # Formula: Balance = Total Fee - Scholarship/Waiver - Total Paid
    total_pending = max(0.0, total_fee - (total_scholarship + total_waiver) - total_paid)

    return {
        "student": {
            "id": st.id,
            "full_name": st.full_name,
            "register_number": st.register_number,
            "department": st.department.code if st.department else "AIDS",
            "current_year": st.current_year,
            "current_semester": st.current_semester,
            "batch": st.batch,
            "community": st.community,
        },
        "fee_profile": {
            "quota_category": quota,
            "quota_details": profile.quota_details if profile else None,
            "approval_number": profile.approval_number if profile else None,
            "approval_date": profile.approval_date if profile else None,
        },
        "financial_summary": {
            "total_fee": total_fee,
            "total_paid": total_paid,
            "total_scholarship": total_scholarship,
            "total_waiver": total_waiver,
            "total_pending": total_pending,
        },
        "year_fee_records": [{
            "id": r.id,
            "year": r.year,
            "academic_year": r.academic_year,
            "tuition_fee": r.tuition_fee,
            "admission_fee": r.admission_fee,
            "university_fee": r.university_fee,
            "exam_fee": r.exam_fee,
            "lab_fee": r.lab_fee,
            "library_fee": r.library_fee,
            "development_fee": r.development_fee,
            "sports_fee": r.sports_fee,
            "placement_fee": r.placement_fee,
            "other_college_fee": r.other_college_fee,
            "bus_fee": r.bus_fee,
            "hostel_fee": r.hostel_fee,
            "mess_fee": r.mess_fee,
            "scholarship_amount": r.scholarship_amount,
            "waiver_amount": r.waiver_amount,
            "total_fee": r.total_fee,
            "paid_amount": r.paid_amount,
            "pending_amount": r.pending_amount,
            "payment_status": r.payment_status,
        } for r in year_recs],
        "semester_fee_records": [{
            "id": r.id,
            "semester": r.semester,
            "academic_year": r.academic_year,
            "fee_type": r.fee_type,
            "amount": r.amount,
            "paid_amount": r.paid_amount,
            "balance": r.balance,
            "payment_status": r.payment_status,
            "due_date": r.due_date,
            "receipt_number": r.receipt_number,
        } for r in sem_recs],
        "payments": [{
            "id": p.id,
            "amount": p.amount,
            "payment_date": p.payment_date,
            "payment_mode": p.payment_mode,
            "transaction_number": p.transaction_number,
            "receipt_number": p.receipt_number,
            "collected_by": p.collected_by,
            "remarks": p.remarks,
        } for p in payments],
        "hostel_records": [{
            "id": h.id,
            "year": h.year,
            "academic_year": h.academic_year,
            "is_hosteller": h.is_hosteller,
            "hostel_required": h.hostel_required,
            "hostel_name": h.hostel_name,
            "hostel_block": h.hostel_block,
            "floor": h.floor,
            "room_number": h.room_number,
            "bed_number": h.bed_number,
            "mess_type": h.mess_type,
            "hostel_fee": h.hostel_fee,
            "mess_fee": h.mess_fee,
            "paid_amount": h.paid_amount,
            "pending_amount": h.pending_amount,
            "payment_status": h.payment_status,
            "hostel_status": h.hostel_status,
        } for h in hostel_recs],
        "transport_records": [{
            "id": t.id,
            "year": t.year,
            "academic_year": t.academic_year,
            "transport_required": t.transport_required,
            "bus_number": t.bus_number,
            "route_number": t.route_number,
            "route_name": t.route_name,
            "boarding_point": t.boarding_point,
            "pickup_point": t.pickup_point,
            "drop_point": t.drop_point,
            "driver_name": t.driver_name,
            "driver_contact": t.driver_contact,
            "transport_fee": t.transport_fee,
            "paid_amount": t.paid_amount,
            "pending_amount": t.pending_amount,
            "payment_status": t.payment_status,
            "transport_status": t.transport_status,
        } for t in transport_recs],
        "scholarship_records": [{
            "id": s.id,
            "year": s.year,
            "academic_year": s.academic_year,
            "scholarship_type": s.scholarship_type,
            "scholarship_name": s.scholarship_name,
            "provider": s.provider,
            "application_number": s.application_number,
            "approved_amount": s.approved_amount,
            "disbursed_amount": s.disbursed_amount,
            "status": s.status,
        } for s in scholarships],
        "first_graduate_records": [{
            "id": f.id,
            "year": f.year,
            "academic_year": f.academic_year,
            "is_first_graduate": f.is_first_graduate,
            "certificate_number": f.certificate_number,
            "government_benefit_amount": f.government_benefit_amount,
            "approval_status": f.approval_status,
        } for f in fg_recs],
        "nativity": {
            "native_state": nativity.native_state if nativity else "Tamil Nadu",
            "native_district": nativity.native_district if nativity else "Karur",
            "native_taluk": nativity.native_taluk if nativity else "Karur",
            "native_village": nativity.native_village if nativity else "Thanthonimalai",
            "native_city": nativity.native_city if nativity else "Karur",
            "native_pincode": nativity.native_pincode if nativity else "639005",
            "certificate_number": nativity.certificate_number if nativity else None,
            "verification_status": nativity.verification_status if nativity else "Verified",
        } if nativity else None,
        "bank_detail": {
            "account_holder_name": bank.account_holder_name if bank else None,
            "bank_name": bank.bank_name if bank else None,
            "masked_account_number": bank.masked_account_number if bank else None,
            "ifsc_code": bank.ifsc_code if bank else None,
            "verification_status": bank.verification_status if bank else "Verified",
        } if bank else None,
    }

# ─── SAVE QUOTA PROFILE ───────────────────────────────────────────────────────

@router.post("/students/{student_id}/fee-profile")
def save_fee_profile(student_id: str, payload: QuotaProfileSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)
    profile = db.query(StudentFeeProfile).filter(StudentFeeProfile.student_id == st.id).first()

    old_quota = profile.quota_category if profile else "Government Quota"

    if not profile:
        profile = StudentFeeProfile(
            student_id=st.id,
            quota_category=payload.quota_category,
            quota_details=payload.quota_details,
            approval_number=payload.approval_number,
            approval_date=payload.approval_date,
        )
        db.add(profile)
    else:
        profile.quota_category = payload.quota_category
        profile.quota_details = payload.quota_details
        profile.approval_number = payload.approval_number
        profile.approval_date = payload.approval_date

    # Log Financial Audit
    audit = FinancialAuditLog(
        student_id=st.id,
        module="Fees",
        field_name="quota_category",
        old_value=old_quota,
        new_value=payload.quota_category,
        updated_by=payload.updated_by or "ADMIN001",
        reason=payload.reason or "Quota category selection update",
    )
    db.add(audit)
    db.commit()

    return {"message": f"🎉 Admission Quota category saved as '{payload.quota_category}' for {st.full_name}!", "quota_category": payload.quota_category}

# ─── SAVE YEAR FEE RECORD ──────────────────────────────────────────────────────

@router.post("/students/{student_id}/year-fee-record")
def save_year_fee_record(student_id: str, payload: YearFeeRecordSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)
    
    # Calculate Total Fee
    t_fee = (
        payload.tuition_fee + payload.admission_fee + payload.university_fee +
        payload.exam_fee + payload.lab_fee + payload.library_fee +
        payload.development_fee + payload.sports_fee + payload.placement_fee +
        payload.other_college_fee + payload.bus_fee + payload.hostel_fee +
        payload.mess_fee + payload.special_fee
    )
    
    # Non-negative balance formula
    pending = max(0.0, t_fee - (payload.scholarship_amount + payload.waiver_amount) - payload.paid_amount)
    
    if pending == 0.0 and t_fee > 0:
        status_val = "Paid"
    elif payload.paid_amount > 0:
        status_val = "Partially Paid"
    elif payload.scholarship_amount >= t_fee and t_fee > 0:
        status_val = "Scholarship Covered"
    else:
        status_val = payload.payment_status or "Pending"

    rec = db.query(StudentFeeRecord).filter(
        StudentFeeRecord.student_id == st.id,
        StudentFeeRecord.year == payload.year
    ).first()

    if not rec:
        rec = StudentFeeRecord(
            student_id=st.id,
            year=payload.year,
            academic_year=payload.academic_year,
            tuition_fee=payload.tuition_fee,
            admission_fee=payload.admission_fee,
            university_fee=payload.university_fee,
            exam_fee=payload.exam_fee,
            lab_fee=payload.lab_fee,
            library_fee=payload.library_fee,
            development_fee=payload.development_fee,
            sports_fee=payload.sports_fee,
            placement_fee=payload.placement_fee,
            other_college_fee=payload.other_college_fee,
            bus_fee=payload.bus_fee,
            hostel_fee=payload.hostel_fee,
            mess_fee=payload.mess_fee,
            special_fee=payload.special_fee,
            scholarship_amount=payload.scholarship_amount,
            waiver_amount=payload.waiver_amount,
            total_fee=t_fee,
            paid_amount=payload.paid_amount,
            pending_amount=pending,
            payment_status=status_val,
            remarks=payload.remarks,
        )
        db.add(rec)
    else:
        rec.academic_year = payload.academic_year
        rec.tuition_fee = payload.tuition_fee
        rec.admission_fee = payload.admission_fee
        rec.university_fee = payload.university_fee
        rec.exam_fee = payload.exam_fee
        rec.lab_fee = payload.lab_fee
        rec.library_fee = payload.library_fee
        rec.development_fee = payload.development_fee
        rec.sports_fee = payload.sports_fee
        rec.placement_fee = payload.placement_fee
        rec.other_college_fee = payload.other_college_fee
        rec.bus_fee = payload.bus_fee
        rec.hostel_fee = payload.hostel_fee
        rec.mess_fee = payload.mess_fee
        rec.special_fee = payload.special_fee
        rec.scholarship_amount = payload.scholarship_amount
        rec.waiver_amount = payload.waiver_amount
        rec.total_fee = t_fee
        rec.paid_amount = payload.paid_amount
        rec.pending_amount = pending
        rec.payment_status = status_val
        rec.remarks = payload.remarks

    # Financial Audit Log
    audit = FinancialAuditLog(
        student_id=st.id,
        module="Fees",
        field_name=f"Year_{payload.year}_Fee_Record",
        old_value="Updated",
        new_value=f"Total: ₹{t_fee}, Paid: ₹{payload.paid_amount}, Pending: ₹{pending}",
        updated_by=payload.updated_by or "ADMIN001",
        reason=payload.reason or f"Updated Year {payload.year} fee structure",
    )
    db.add(audit)
    db.commit()

    return {
        "message": f"🎉 Year {payload.year} fee record saved! Total: ₹{t_fee:.2f}, Pending: ₹{pending:.2f}",
        "year": payload.year,
        "total_fee": t_fee,
        "pending_amount": pending,
        "payment_status": status_val
    }

# ─── RECORD PAYMENT ────────────────────────────────────────────────────────────

@router.post("/students/{student_id}/payments")
def record_fee_payment(student_id: str, payload: PaymentRecordSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)

    pmt = FeePayment(
        student_id=st.id,
        academic_year=payload.academic_year,
        semester=payload.semester,
        amount=payload.amount,
        payment_date=payload.payment_date,
        payment_mode=payload.payment_mode,
        transaction_number=payload.transaction_number,
        receipt_number=payload.receipt_number,
        receipt_file=payload.receipt_file,
        collected_by=payload.collected_by,
        remarks=payload.remarks,
    )
    db.add(pmt)

    # Update corresponding year fee record
    target_year = (payload.semester + 1) // 2 if payload.semester else st.current_year
    year_rec = db.query(StudentFeeRecord).filter(
        StudentFeeRecord.student_id == st.id,
        StudentFeeRecord.year == target_year
    ).first()

    if year_rec:
        year_rec.paid_amount += payload.amount
        year_rec.pending_amount = max(0.0, year_rec.total_fee - (year_rec.scholarship_amount + year_rec.waiver_amount) - year_rec.paid_amount)
        if year_rec.pending_amount == 0.0:
            year_rec.payment_status = "Paid"
        else:
            year_rec.payment_status = "Partially Paid"

    # Financial Audit
    audit = FinancialAuditLog(
        student_id=st.id,
        module="Fees",
        field_name="Fee_Payment",
        old_value="0.0",
        new_value=f"Paid ₹{payload.amount} via {payload.payment_mode}. Receipt: {payload.receipt_number}",
        updated_by=payload.updated_by or "Accounts",
        reason="Fee payment receipt entry",
        transaction_id=payload.transaction_number,
        receipt_number=payload.receipt_number
    )
    db.add(audit)
    db.commit()

    return {"message": f"💳 Payment of ₹{payload.amount:.2f} recorded! Receipt: {payload.receipt_number}", "receipt_number": payload.receipt_number}

# ─── SAVE HOSTEL RECORD ────────────────────────────────────────────────────────

@router.post("/students/{student_id}/hostel-record")
def save_hostel_record(student_id: str, payload: HostelRecordSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)
    
    st.hosteller = payload.is_hosteller
    st.day_scholar = not payload.is_hosteller
    if payload.is_hosteller:
        st.hostel_details = f"{payload.hostel_name}, {payload.hostel_block}, Room {payload.room_number}"

    rec = db.query(HostelRecord).filter(
        HostelRecord.student_id == st.id,
        HostelRecord.year == payload.year
    ).first()

    t_hostel = payload.hostel_fee + payload.mess_fee + payload.other_hostel_fee
    pending = max(0.0, t_hostel - payload.scholarship_waiver - payload.paid_amount)

    if not rec:
        rec = HostelRecord(
            student_id=st.id,
            year=payload.year,
            academic_year=payload.academic_year,
            is_hosteller=payload.is_hosteller,
            hostel_required=payload.hostel_required,
            hostel_name=payload.hostel_name,
            hostel_block=payload.hostel_block,
            floor=payload.floor,
            room_number=payload.room_number,
            bed_number=payload.bed_number,
            mess_type=payload.mess_type,
            allocation_date=payload.allocation_date,
            vacated_date=payload.vacated_date,
            hostel_status=payload.hostel_status,
            hostel_fee=payload.hostel_fee,
            mess_fee=payload.mess_fee,
            other_hostel_fee=payload.other_hostel_fee,
            scholarship_waiver=payload.scholarship_waiver,
            paid_amount=payload.paid_amount,
            pending_amount=pending,
            payment_status="Paid" if pending == 0 else ("Partially Paid" if payload.paid_amount > 0 else "Pending"),
            receipt_number=payload.receipt_number,
            remarks=payload.remarks,
        )
        db.add(rec)
    else:
        rec.academic_year = payload.academic_year
        rec.is_hosteller = payload.is_hosteller
        rec.hostel_required = payload.hostel_required
        rec.hostel_name = payload.hostel_name
        rec.hostel_block = payload.hostel_block
        rec.floor = payload.floor
        rec.room_number = payload.room_number
        rec.bed_number = payload.bed_number
        rec.mess_type = payload.mess_type
        rec.allocation_date = payload.allocation_date
        rec.vacated_date = payload.vacated_date
        rec.hostel_status = payload.hostel_status
        rec.hostel_fee = payload.hostel_fee
        rec.mess_fee = payload.mess_fee
        rec.other_hostel_fee = payload.other_hostel_fee
        rec.scholarship_waiver = payload.scholarship_waiver
        rec.paid_amount = payload.paid_amount
        rec.pending_amount = pending
        rec.payment_status = "Paid" if pending == 0 else ("Partially Paid" if payload.paid_amount > 0 else "Pending")
        rec.receipt_number = payload.receipt_number

    audit = FinancialAuditLog(
        student_id=st.id,
        module="Hostel",
        field_name=f"Year_{payload.year}_Hostel",
        old_value="Updated",
        new_value=f"{payload.hostel_name} Block {payload.hostel_block} Room {payload.room_number}",
        updated_by=payload.updated_by or "Warden",
        reason="Hostel allocation update",
    )
    db.add(audit)
    db.commit()

    return {"message": f"🏢 Year {payload.year} Hostel Record saved: {payload.hostel_name} Room {payload.room_number}!"}

# ─── SAVE TRANSPORT RECORD ─────────────────────────────────────────────────────

@router.post("/students/{student_id}/transport-record")
def save_transport_record(student_id: str, payload: TransportRecordSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)

    if payload.transport_required == "Yes":
        st.bus_route = f"{payload.bus_number} ({payload.route_name}): {payload.boarding_point}"

    rec = db.query(TransportRecord).filter(
        TransportRecord.student_id == st.id,
        TransportRecord.year == payload.year
    ).first()

    pending = max(0.0, payload.transport_fee - payload.concession_amount - payload.paid_amount)

    if not rec:
        rec = TransportRecord(
            student_id=st.id,
            year=payload.year,
            academic_year=payload.academic_year,
            transport_required=payload.transport_required,
            bus_number=payload.bus_number,
            route_number=payload.route_number,
            route_name=payload.route_name,
            boarding_point=payload.boarding_point,
            pickup_point=payload.pickup_point,
            drop_point=payload.drop_point,
            driver_name=payload.driver_name,
            driver_contact=payload.driver_contact,
            transport_status=payload.transport_status,
            transport_fee=payload.transport_fee,
            concession_amount=payload.concession_amount,
            paid_amount=payload.paid_amount,
            pending_amount=pending,
            payment_status="Paid" if pending == 0 else "Pending",
            receipt_number=payload.receipt_number,
        )
        db.add(rec)
    else:
        rec.academic_year = payload.academic_year
        rec.transport_required = payload.transport_required
        rec.bus_number = payload.bus_number
        rec.route_number = payload.route_number
        rec.route_name = payload.route_name
        rec.boarding_point = payload.boarding_point
        rec.pickup_point = payload.pickup_point
        rec.drop_point = payload.drop_point
        rec.driver_name = payload.driver_name
        rec.driver_contact = payload.driver_contact
        rec.transport_status = payload.transport_status
        rec.transport_fee = payload.transport_fee
        rec.concession_amount = payload.concession_amount
        rec.paid_amount = payload.paid_amount
        rec.pending_amount = pending
        rec.payment_status = "Paid" if pending == 0 else "Pending"
        rec.receipt_number = payload.receipt_number

    audit = FinancialAuditLog(
        student_id=st.id,
        module="Transport",
        field_name=f"Year_{payload.year}_Transport",
        old_value="Updated",
        new_value=f"Bus: {payload.bus_number}, Route: {payload.route_name}, Boarding: {payload.boarding_point}",
        updated_by=payload.updated_by or "Transport Incharge",
        reason="Transport allocation update",
    )
    db.add(audit)
    db.commit()

    return {"message": f"🚌 Year {payload.year} Transport record saved: Bus {payload.bus_number} ({payload.route_name})!"}

# ─── SAVE SCHOLARSHIP RECORD ───────────────────────────────────────────────────

@router.post("/students/{student_id}/scholarship-record")
def save_scholarship_record(student_id: str, payload: ScholarshipRecordSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)
    
    st.scholarship = payload.scholarship_name
    st.scholarship_details = f"{payload.scholarship_type} - {payload.provider} (₹{payload.approved_amount})"

    rec = db.query(ScholarshipRecord).filter(
        ScholarshipRecord.student_id == st.id,
        ScholarshipRecord.year == payload.year,
        ScholarshipRecord.scholarship_name == payload.scholarship_name
    ).first()

    if not rec:
        rec = ScholarshipRecord(
            student_id=st.id,
            year=payload.year,
            academic_year=payload.academic_year,
            scholarship_applicable=payload.scholarship_applicable,
            scholarship_type=payload.scholarship_type,
            scholarship_name=payload.scholarship_name,
            provider=payload.provider,
            category_reason=payload.category_reason,
            eligibility_status=payload.eligibility_status,
            application_number=payload.application_number,
            application_date=payload.application_date,
            approval_date=payload.approval_date,
            disbursement_date=payload.disbursement_date,
            eligible_amount=payload.eligible_amount,
            approved_amount=payload.approved_amount,
            disbursed_amount=payload.disbursed_amount,
            status=payload.status,
            supporting_document=payload.supporting_document,
            approved_by=payload.approved_by,
        )
        db.add(rec)
    else:
        rec.academic_year = payload.academic_year
        rec.scholarship_applicable = payload.scholarship_applicable
        rec.scholarship_type = payload.scholarship_type
        rec.provider = payload.provider
        rec.category_reason = payload.category_reason
        rec.eligibility_status = payload.eligibility_status
        rec.application_number = payload.application_number
        rec.application_date = payload.application_date
        rec.approval_date = payload.approval_date
        rec.disbursement_date = payload.disbursement_date
        rec.eligible_amount = payload.eligible_amount
        rec.approved_amount = payload.approved_amount
        rec.disbursed_amount = payload.disbursed_amount
        rec.status = payload.status
        rec.supporting_document = payload.supporting_document

    audit = FinancialAuditLog(
        student_id=st.id,
        module="Scholarship",
        field_name=f"Year_{payload.year}_Scholarship",
        old_value="Updated",
        new_value=f"{payload.scholarship_name} (₹{payload.approved_amount}) - Status: {payload.status}",
        updated_by=payload.updated_by or "Scholarship Office",
        reason="Scholarship scheme details update",
    )
    db.add(audit)
    db.commit()

    return {"message": f"📜 Scholarship '{payload.scholarship_name}' saved for Year {payload.year}! Approved: ₹{payload.approved_amount}"}

# ─── SAVE FIRST GRADUATE RECORD ───────────────────────────────────────────────

@router.post("/students/{student_id}/first-graduate-record")
def save_first_graduate_record(student_id: str, payload: FirstGraduateRecordSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)

    rec = db.query(FirstGraduateRecord).filter(
        FirstGraduateRecord.student_id == st.id,
        FirstGraduateRecord.year == payload.year
    ).first()

    if not rec:
        rec = FirstGraduateRecord(
            student_id=st.id,
            year=payload.year,
            academic_year=payload.academic_year,
            is_first_graduate=payload.is_first_graduate,
            certificate_number=payload.certificate_number,
            issue_date=payload.issue_date,
            verification_status=payload.verification_status,
            is_eligible=payload.is_eligible,
            government_benefit_amount=payload.government_benefit_amount,
            application_number=payload.application_number,
            approval_status=payload.approval_status,
            supporting_document=payload.supporting_document,
        )
        db.add(rec)
    else:
        rec.academic_year = payload.academic_year
        rec.is_first_graduate = payload.is_first_graduate
        rec.certificate_number = payload.certificate_number
        rec.issue_date = payload.issue_date
        rec.verification_status = payload.verification_status
        rec.is_eligible = payload.is_eligible
        rec.government_benefit_amount = payload.government_benefit_amount
        rec.application_number = payload.application_number
        rec.approval_status = payload.approval_status
        rec.supporting_document = payload.supporting_document

    audit = FinancialAuditLog(
        student_id=st.id,
        module="FirstGraduate",
        field_name=f"Year_{payload.year}_FirstGraduate",
        old_value="Updated",
        new_value=f"First Graduate: {payload.is_first_graduate}, Benefit: ₹{payload.government_benefit_amount}, Status: {payload.approval_status}",
        updated_by=payload.updated_by or "ADMIN001",
        reason="First Graduate record update",
    )
    db.add(audit)
    db.commit()

    return {"message": f"🎓 First Graduate record for Year {payload.year} saved! Benefit: ₹{payload.government_benefit_amount}"}

# ─── SAVE NATIVITY RECORD ─────────────────────────────────────────────────────

@router.post("/students/{student_id}/nativity-record")
def save_nativity_record(student_id: str, payload: NativityRecordSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)

    st.village = payload.native_village
    st.city = payload.native_city
    st.district = payload.native_district
    st.state = payload.native_state
    st.pincode = payload.native_pincode

    rec = db.query(NativityRecord).filter(NativityRecord.student_id == st.id).first()

    if not rec:
        rec = NativityRecord(
            student_id=st.id,
            native_state=payload.native_state,
            native_district=payload.native_district,
            native_taluk=payload.native_taluk,
            native_village=payload.native_village,
            native_city=payload.native_city,
            native_pincode=payload.native_pincode,
            permanent_native_address=payload.permanent_native_address,
            certificate_number=payload.certificate_number,
            issue_date=payload.issue_date,
            verification_status=payload.verification_status,
            certificate_document=payload.certificate_document,
        )
        db.add(rec)
    else:
        rec.native_state = payload.native_state
        rec.native_district = payload.native_district
        rec.native_taluk = payload.native_taluk
        rec.native_village = payload.native_village
        rec.native_city = payload.native_city
        rec.native_pincode = payload.native_pincode
        rec.permanent_native_address = payload.permanent_native_address
        rec.certificate_number = payload.certificate_number
        rec.issue_date = payload.issue_date
        rec.verification_status = payload.verification_status
        rec.certificate_document = payload.certificate_document

    audit = FinancialAuditLog(
        student_id=st.id,
        module="Nativity",
        field_name="Nativity_Details",
        old_value="Updated",
        new_value=f"Native: {payload.native_district}, {payload.native_state}. Cert: {payload.certificate_number}",
        updated_by=payload.updated_by or "ADMIN001",
        reason="Nativity details update",
    )
    db.add(audit)
    db.commit()

    return {"message": f"📍 Permanent Nativity record saved: {payload.native_city}, {payload.native_district}, {payload.native_state}!"}

# ─── SAVE BANK DETAILS (MASKED) ───────────────────────────────────────────────

@router.post("/students/{student_id}/bank-details")
def save_bank_details(student_id: str, payload: BankDetailSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)

    acc = payload.account_number.strip()
    masked = "•••• •••• " + acc[-4:] if len(acc) >= 4 else "•••• " + acc

    rec = db.query(StudentBankDetail).filter(StudentBankDetail.student_id == st.id).first()

    if not rec:
        rec = StudentBankDetail(
            student_id=st.id,
            account_holder_name=payload.account_holder_name,
            bank_name=payload.bank_name,
            encrypted_account_number=acc, # Simple store/encrypt abstraction
            masked_account_number=masked,
            ifsc_code=payload.ifsc_code,
            branch_name=payload.branch_name,
            passbook_document=payload.passbook_document,
            verification_status="Verified"
        )
        db.add(rec)
    else:
        rec.account_holder_name = payload.account_holder_name
        rec.bank_name = payload.bank_name
        rec.encrypted_account_number = acc
        rec.masked_account_number = masked
        rec.ifsc_code = payload.ifsc_code
        rec.branch_name = payload.branch_name
        rec.passbook_document = payload.passbook_document

    audit = FinancialAuditLog(
        student_id=st.id,
        module="Bank",
        field_name="Bank_Account",
        old_value="Updated",
        new_value=f"Bank: {payload.bank_name}, Masked Acc: {masked}, IFSC: {payload.ifsc_code}",
        updated_by=payload.updated_by or "ADMIN001",
        reason="Bank disbursement details update",
    )
    db.add(audit)
    db.commit()

    return {"message": f"🏦 Bank account details updated securely for {st.full_name}! Account: {masked}"}

# ─── SAVE SEMESTER FEE RECORD ──────────────────────────────────────────────────

@router.post("/students/{student_id}/semester-fee-record")
def save_semester_fee_record(student_id: str, payload: SemesterFeeSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)

    bal = max(0.0, payload.amount - payload.paid_amount)
    status_val = "Paid" if bal == 0 and payload.amount > 0 else ("Partially Paid" if payload.paid_amount > 0 else payload.payment_status or "Pending")

    rec = SemesterFeeRecord(
        student_id=st.id,
        semester=payload.semester,
        academic_year=payload.academic_year,
        fee_type=payload.fee_type,
        amount=payload.amount,
        due_date=payload.due_date,
        paid_amount=payload.paid_amount,
        balance=bal,
        payment_status=status_val,
        receipt_number=payload.receipt_number,
        remarks=payload.remarks
    )
    db.add(rec)

    audit = FinancialAuditLog(
        student_id=st.id,
        module="Fees",
        field_name=f"Semester_{payload.semester}_Fee",
        old_value="New Record",
        new_value=f"Type: {payload.fee_type}, Amount: ₹{payload.amount}, Paid: ₹{payload.paid_amount}, Bal: ₹{bal}",
        updated_by=payload.updated_by or "ADMIN001",
        reason="Semester fee record update"
    )
    db.add(audit)
    db.commit()

    return {"message": f"📊 Semester {payload.semester} Fee ({payload.fee_type}) saved! Amount: ₹{payload.amount:.2f}", "id": rec.id}

# ─── SAVE INCOME RECORD ────────────────────────────────────────────────────────

@router.post("/students/{student_id}/income-record")
def save_income_record(student_id: str, payload: IncomeCertificateSchema, db: Session = Depends(get_db)):
    st = get_student(db, student_id)

    rec = db.query(IncomeCertificateRecord).filter(IncomeCertificateRecord.student_id == st.id).first()
    if not rec:
        rec = IncomeCertificateRecord(
            student_id=st.id,
            annual_income=payload.annual_income,
            certificate_number=payload.certificate_number,
            issue_date=payload.issue_date,
            valid_until=payload.valid_until,
            certificate_document=payload.certificate_document,
            verification_status=payload.verification_status
        )
        db.add(rec)
    else:
        rec.annual_income = payload.annual_income
        rec.certificate_number = payload.certificate_number
        rec.issue_date = payload.issue_date
        rec.valid_until = payload.valid_until
        rec.certificate_document = payload.certificate_document
        rec.verification_status = payload.verification_status

    audit = FinancialAuditLog(
        student_id=st.id,
        module="Scholarship",
        field_name="Income_Certificate",
        old_value="Updated",
        new_value=f"Annual Income: ₹{payload.annual_income}, Cert: {payload.certificate_number}",
        updated_by=payload.updated_by or "ADMIN001",
        reason="Income certificate details update"
    )
    db.add(audit)
    db.commit()

    return {"message": f"💵 Income certificate record saved for {st.full_name}! Annual Income: ₹{payload.annual_income:,.2f}"}

# ─── CONFIGURABLE FEE TYPES ────────────────────────────────────────────────────

class FeeTypeSchema(BaseModel):
    code: str
    name: str
    category: Optional[str] = "Academic"
    default_amount: Optional[float] = 0.0
    description: Optional[str] = None
    is_active: Optional[bool] = True

@router.get("/fee-types")
def get_fee_types(db: Session = Depends(get_db)):
    types = db.query(FeeType).filter(FeeType.is_active == True).all()
    if not types:
        # Default standard fee types
        defaults = [
            ("TUITION", "Tuition Fee", "Academic", 85000.0),
            ("ADMISSION", "Admission Fee", "One-Time", 15000.0),
            ("UNIVERSITY", "University Fee", "Anna University", 5000.0),
            ("EXAM", "Exam Fee", "Academic", 3500.0),
            ("LAB", "Laboratory Fee", "Academic", 7500.0),
            ("LIBRARY", "Library Fee", "Academic", 2500.0),
            ("DEV", "Development Fee", "Infrastructure", 10000.0),
            ("SPORTS", "Sports Fee", "Co-curricular", 2000.0),
            ("PLACEMENT", "Placement Fee", "Career Development", 12000.0),
            ("TRANSPORT", "Transport Fee", "Logistics", 18000.0),
            ("HOSTEL", "Hostel Fee", "Accommodation", 45000.0),
            ("MESS", "Mess Fee", "Dining", 35000.0),
            ("OTHER_COLLEGE", "Other College Fee", "Miscellaneous", 5000.0),
            ("OTHER_APPROVED", "Other Approved Fee", "Approved Special", 3000.0),
        ]
        for code, name, cat, amt in defaults:
            ft = FeeType(code=code, name=name, category=cat, default_amount=amt, is_active=True)
            db.add(ft)
        db.commit()
        types = db.query(FeeType).all()

    return [{
        "id": t.id,
        "code": t.code,
        "name": t.name,
        "category": t.category,
        "default_amount": t.default_amount,
        "description": t.description,
        "is_active": t.is_active
    } for t in types]

@router.post("/fee-types")
def create_fee_type(payload: FeeTypeSchema, db: Session = Depends(get_db)):
    existing = db.query(FeeType).filter(FeeType.code == payload.code.upper()).first()
    if existing:
        existing.name = payload.name
        existing.category = payload.category
        existing.default_amount = payload.default_amount
        existing.description = payload.description
        existing.is_active = payload.is_active
        db.commit()
        return {"message": f"Updated fee type '{payload.name}'"}
    else:
        ft = FeeType(
            code=payload.code.upper(),
            name=payload.name,
            category=payload.category,
            default_amount=payload.default_amount,
            description=payload.description,
            is_active=payload.is_active
        )
        db.add(ft)
        db.commit()
        return {"message": f"Created new fee type '{payload.name}'"}

# ─── AUDIT LOGS ───────────────────────────────────────────────────────────────

@router.get("/students/{student_id}/audit-logs")
def get_student_audit_logs(student_id: str, db: Session = Depends(get_db)):
    st = get_student(db, student_id)
    logs = db.query(FinancialAuditLog).filter(FinancialAuditLog.student_id == st.id).order_by(FinancialAuditLog.created_at.desc()).all()
    return [{
        "id": l.id,
        "module": l.module,
        "field_name": l.field_name,
        "old_value": l.old_value,
        "new_value": l.new_value,
        "updated_by": l.updated_by,
        "role": l.role,
        "reason": l.reason,
        "transaction_id": l.transaction_id,
        "receipt_number": l.receipt_number,
        "timestamp": l.created_at.strftime("%Y-%m-%d %H:%M:%S")
    } for l in logs]

# ─── FINANCIAL REPORTS API ────────────────────────────────────────────────────

@router.get("/reports/summary")
def get_financial_reports_summary(db: Session = Depends(get_db)):
    total_students = db.query(Student).count()
    hostellers = db.query(Student).filter(Student.hosteller == True).count()
    bus_users = db.query(Student).filter(Student.bus_route.isnot(None), Student.bus_route != "None").count()
    
    total_year_recs = db.query(StudentFeeRecord).all()
    total_fee_collected = sum(r.paid_amount for r in total_year_recs)
    total_fee_pending = sum(r.pending_amount for r in total_year_recs)
    total_scholarship_given = sum(r.scholarship_amount for r in total_year_recs)
    
    fg_count = db.query(FirstGraduateRecord).filter(FirstGraduateRecord.is_first_graduate == "Yes").count()
    
    return {
        "total_students": total_students,
        "hostellers_count": hostellers,
        "transport_users_count": bus_users,
        "total_fee_collected": total_fee_collected,
        "total_fee_pending": total_fee_pending,
        "total_scholarship_disbursed": total_scholarship_given,
        "first_graduate_students": fg_count,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

