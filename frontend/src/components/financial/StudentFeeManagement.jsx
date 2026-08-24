import React, { useState, useEffect } from 'react';

export default function StudentFeeManagement({ student, onRefresh, showToast }) {
  const [loading, setLoading] = useState(false);
  const [financialData, setFinancialData] = useState(null);
  
  // Quota Profile State
  const [quotaCategory, setQuotaCategory] = useState('Government Quota');
  const [quotaDetails, setQuotaDetails] = useState('');
  const [approvalNumber, setApprovalNumber] = useState('');

  // Selected Year for Fee Record Editing (1, 2, 3, 4)
  const [selectedYear, setSelectedYear] = useState(student?.current_year || 3);
  
  // Year Fee Form State
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [tuitionFee, setTuitionFee] = useState(85000);
  const [admissionFee, setAdmissionFee] = useState(15000);
  const [universityFee, setUniversityFee] = useState(5000);
  const [examFee, setExamFee] = useState(3500);
  const [labFee, setLabFee] = useState(7500);
  const [libraryFee, setLibraryFee] = useState(2500);
  const [developmentFee, setDevelopmentFee] = useState(10000);
  const [sportsFee, setSportsFee] = useState(2000);
  const [placementFee, setPlacementFee] = useState(12000);
  const [otherCollegeFee, setOtherCollegeFee] = useState(5000);
  const [busFee, setBusFee] = useState(0);
  const [hostelFee, setHostelFee] = useState(45000);
  const [messFee, setMessFee] = useState(35000);
  const [specialFee, setSpecialFee] = useState(0);
  const [scholarshipAmount, setScholarshipAmount] = useState(25000);
  const [waiverAmount, setWaiverAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(140000);
  const [paymentStatus, setPaymentStatus] = useState('Partially Paid');
  const [feeRemarks, setFeeRemarks] = useState('');

  // Semester Fee State (Sem 1 to 8)
  const [selectedSem, setSelectedSem] = useState(6);
  const [semFeeType, setSemFeeType] = useState('Tuition Fee');
  const [semAmount, setSemAmount] = useState(42500);
  const [semDueDate, setSemDueDate] = useState('2026-09-15');
  const [semPaidAmount, setSemPaidAmount] = useState(42500);
  const [semStatus, setSemStatus] = useState('Paid');
  const [semReceiptNo, setSemReceiptNo] = useState('REC-2026-0891');

  // Payment Recording Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pmtAmount, setPmtAmount] = useState(25000);
  const [pmtDate, setPmtDate] = useState(new Date().toISOString().split('T')[0]);
  const [pmtMode, setPmtMode] = useState('Online'); // Cash, UPI, Bank Transfer, Online, Other
  const [pmtTxnNo, setPmtTxnNo] = useState('TXN987654321');
  const [pmtReceiptNo, setPmtReceiptNo] = useState(`REC-${Math.floor(100000 + Math.random() * 900000)}`);
  const [pmtCollectedBy, setPmtCollectedBy] = useState('Accounts Office (VSB)');

  // Configurable Fee Types State
  const [feeTypes, setFeeTypes] = useState([]);
  const [showAddTypeModal, setShowAddTypeModal] = useState(false);
  const [newTypeCode, setNewTypeCode] = useState('');
  const [newTypeName, setNewTypeName] = useState('');
  const [newTypeCat, setNewTypeCat] = useState('Academic');
  const [newTypeAmt, setNewTypeAmt] = useState(5000);

  const studentId = student?.id || student?.register_number;

  // 1. Fetch Financial Summary & Fee Types on load
  const fetchSummary = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setFinancialData(data);
        if (data.fee_profile?.quota_category) {
          setQuotaCategory(data.fee_profile.quota_category);
          setQuotaDetails(data.fee_profile.quota_details || '');
          setApprovalNumber(data.fee_profile.approval_number || '');
        }
      }
      const resTypes = await fetch(`http://127.0.0.1:8000/api/v1/financial/fee-types`);
      if (resTypes.ok) {
        const typesData = await resTypes.json();
        setFeeTypes(typesData);
      }
    } catch (err) {
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [studentId]);

  // Sync Year Fee Form when selectedYear changes or data is loaded
  useEffect(() => {
    if (financialData?.year_fee_records) {
      const rec = financialData.year_fee_records.find(r => r.year === selectedYear);
      if (rec) {
        setAcademicYear(rec.academic_year || '2024-2025');
        setTuitionFee(rec.tuition_fee || 0);
        setAdmissionFee(rec.admission_fee || 0);
        setUniversityFee(rec.university_fee || 0);
        setExamFee(rec.exam_fee || 0);
        setLabFee(rec.lab_fee || 0);
        setLibraryFee(rec.library_fee || 0);
        setDevelopmentFee(rec.development_fee || 0);
        setSportsFee(rec.sports_fee || 0);
        setPlacementFee(rec.placement_fee || 0);
        setOtherCollegeFee(rec.other_college_fee || 0);
        setBusFee(rec.bus_fee || 0);
        setHostelFee(rec.hostel_fee || 0);
        setMessFee(rec.mess_fee || 0);
        setScholarshipAmount(rec.scholarship_amount || 0);
        setWaiverAmount(rec.waiver_amount || 0);
        setPaidAmount(rec.paid_amount || 0);
        setPaymentStatus(rec.payment_status || 'Pending');
      }
    }
  }, [selectedYear, financialData]);

  // Live Auto Calculations
  const calculatedTotalFee = (
    Number(tuitionFee) + Number(admissionFee) + Number(universityFee) +
    Number(examFee) + Number(labFee) + Number(libraryFee) +
    Number(developmentFee) + Number(sportsFee) + Number(placementFee) +
    Number(otherCollegeFee) + Number(busFee) + Number(hostelFee) +
    Number(messFee) + Number(specialFee)
  );

  const calculatedBalance = Math.max(0, calculatedTotalFee - (Number(scholarshipAmount) + Number(waiverAmount)) - Number(paidAmount));

  // Handle Save Quota Profile
  const handleSaveQuota = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/fee-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          quota_category: quotaCategory,
          quota_details: quotaDetails,
          approval_number: approvalNumber,
          updated_by: 'STAFF_ACCOUNTS'
        })
      });
      if (res.ok) {
        if (showToast) showToast(`🎉 Quota Profile saved as '${quotaCategory}' in PostgreSQL!`);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Save Year Fee Record
  const handleSaveYearFee = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/year-fee-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          academic_year: academicYear,
          tuition_fee: Number(tuitionFee),
          admission_fee: Number(admissionFee),
          university_fee: Number(universityFee),
          exam_fee: Number(examFee),
          lab_fee: Number(labFee),
          library_fee: Number(libraryFee),
          development_fee: Number(developmentFee),
          sports_fee: Number(sportsFee),
          placement_fee: Number(placementFee),
          other_college_fee: Number(otherCollegeFee),
          bus_fee: Number(busFee),
          hostel_fee: Number(hostelFee),
          mess_fee: Number(messFee),
          special_fee: Number(specialFee),
          scholarship_amount: Number(scholarshipAmount),
          waiver_amount: Number(waiverAmount),
          paid_amount: Number(paidAmount),
          payment_status: paymentStatus,
          remarks: feeRemarks,
          updated_by: 'STAFF_ACCOUNTS'
        })
      });
      if (res.ok) {
        if (showToast) showToast(`🎉 Year ${selectedYear} Fee Record updated cleanly in database!`);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Save Semester Fee Record
  const handleSaveSemFee = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/semester-fee-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          semester: selectedSem,
          academic_year: academicYear,
          fee_type: semFeeType,
          amount: Number(semAmount),
          due_date: semDueDate,
          paid_amount: Number(semPaidAmount),
          payment_status: semStatus,
          receipt_number: semReceiptNo,
          updated_by: 'STAFF_ACCOUNTS'
        })
      });
      if (res.ok) {
        if (showToast) showToast(`🎉 Semester ${selectedSem} Fee Record saved!`);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Record Payment
  const handleRecordPayment = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          academic_year: academicYear,
          semester: selectedSem,
          amount: Number(pmtAmount),
          payment_date: pmtDate,
          payment_mode: pmtMode,
          transaction_number: pmtTxnNo,
          receipt_number: pmtReceiptNo,
          collected_by: pmtCollectedBy,
          remarks: `Fee payment collection`,
          updated_by: 'STAFF_ACCOUNTS'
        })
      });
      if (res.ok) {
        setShowPaymentModal(false);
        if (showToast) showToast(`💳 Fee Payment of ₹${pmtAmount} recorded! Receipt: ${pmtReceiptNo}`);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Create Configurable Fee Type
  const handleCreateFeeType = async () => {
    if (!newTypeCode || !newTypeName) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/fee-types`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newTypeCode,
          name: newTypeName,
          category: newTypeCat,
          default_amount: Number(newTypeAmt)
        })
      });
      if (res.ok) {
        setShowAddTypeModal(false);
        setNewTypeCode('');
        setNewTypeName('');
        if (showToast) showToast(`✨ Configured fee type '${newTypeName}' added!`);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const overall = financialData?.financial_summary || {
    total_fee: calculatedTotalFee * 4,
    total_paid: paidAmount,
    total_scholarship: scholarshipAmount * 4,
    total_waiver: waiverAmount * 4,
    total_pending: (calculatedTotalFee * 4) - (scholarshipAmount * 4) - paidAmount
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* 1. STUDENT IDENTITY & QUOTA PROFILE BANNER */}
      <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid #B91C1C' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              VSB SMARTCAMPUS — STRUCTURED FEE & PAYMENTS MANAGEMENT
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: 4 }}>
              {student?.full_name || 'Student Name'} <span style={{ fontSize: '0.95rem', color: '#9CA3AF', fontWeight: 400 }}>({student?.register_number || 'REG-NO'})</span>
            </h2>
            <div style={{ display: 'flex', gap: 16, marginTop: 6, fontSize: '0.85rem', color: '#D1D5DB' }}>
              <span>Dept: <strong style={{ color: '#F59E0B' }}>{student?.department_name || student?.department || 'AI & DS'}</strong></span>
              <span>Course: <strong style={{ color: '#FFF' }}>B.Tech</strong></span>
              <span>Current Year: <strong style={{ color: '#FFF' }}>Year {student?.current_year || 3}</strong></span>
              <span>Current Sem: <strong style={{ color: '#FFF' }}>Sem {student?.current_semester || 6}</strong></span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-gold" onClick={() => setShowPaymentModal(true)}>
              💳 + Add Payment
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddTypeModal(true)}>
              ⚙️ Manage Fee Types
            </button>
          </div>
        </div>

        {/* ADMISSION / QUOTA CATEGORY SELECTION */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 14, alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4, fontWeight: 600 }}>
              ADMISSION / QUOTA CATEGORY
            </label>
            <select
              className="input-field"
              value={quotaCategory}
              onChange={e => setQuotaCategory(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0B1120', border: '1px solid rgba(245,158,11,0.4)', color: '#FFF', borderRadius: 8, fontWeight: 700 }}
            >
              <option value="Government Quota">Government Quota (Counseling)</option>
              <option value="Management Quota">Management Quota (Institutional)</option>
              <option value="Other / Special Category">Other / Special Quota Category</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4, fontWeight: 600 }}>
              QUOTA DETAILS / COUNSELING ALLOTMENT NO
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. TNEA-2024-AD-8941"
              value={quotaDetails}
              onChange={e => setQuotaDetails(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: 8 }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4, fontWeight: 600 }}>
              APPROVAL / SANCTION NO
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. DOTE/APPROV/2024/771"
              value={approvalNumber}
              onChange={e => setApprovalNumber(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', background: '#0B1120', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', borderRadius: 8 }}
            />
          </div>

          <button className="btn btn-primary" onClick={handleSaveQuota} style={{ height: 38 }}>
            💾 Save Quota Category
          </button>
        </div>
      </div>

      {/* 2. OVERALL FOUR-YEAR FINANCIAL SUMMARY CARDS */}
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          📊 4-YEAR FINANCIAL SUMMARY & BALANCE MATRIX
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
          <div className="card-ai" style={{ padding: 16, borderLeft: '4px solid #720F0F', background: '#FAF7F0' }}>
            <div style={{ fontSize: '0.75rem', color: '#5C5750', fontWeight: 600 }}>TOTAL 4-YEAR FEES</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#720F0F', marginTop: 4 }}>
              ₹{Number(overall.total_fee || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#777168', marginTop: 2 }}>Configured course fee</div>
          </div>

          <div className="card-ai" style={{ padding: 16, borderLeft: '4px solid #10B981' }}>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>TOTAL PAID</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10B981', marginTop: 4 }}>
              ₹{Number(overall.total_paid || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2 }}>Verified receipts</div>
          </div>

          <div className="card-ai" style={{ padding: 16, borderLeft: '4px solid #F59E0B' }}>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>SCHOLARSHIP</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#F59E0B', marginTop: 4 }}>
              ₹{Number(overall.total_scholarship || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2 }}>Govt & Institution</div>
          </div>

          <div className="card-ai" style={{ padding: 16, borderLeft: '4px solid #8B5CF6' }}>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>FEES WAIVER</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#8B5CF6', marginTop: 4 }}>
              ₹{Number(overall.total_waiver || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2 }}>Approved concessions</div>
          </div>

          <div className="card-ai" style={{ padding: 16, borderLeft: `4px solid ${overall.total_pending > 0 ? '#EF4444' : '#10B981'}` }}>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>OUTSTANDING BALANCE</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: overall.total_pending > 0 ? '#EF4444' : '#10B981', marginTop: 4 }}>
              ₹{Number(overall.total_pending || 0).toLocaleString()}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280', marginTop: 2 }}>No negative balance</div>
          </div>
        </div>
      </div>

      {/* 3. YEAR-WISE FEE RECORD ENTRY & BREAKDOWN (1st, 2nd, 3rd, 4th Year) */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: 8 }}>
            📅 YEAR-WISE STRUCTURED FEE RECORD
          </h3>
          
          {/* Year Switcher Buttons */}
          <div style={{ display: 'flex', gap: 6, background: '#0B1120', padding: 4, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
            {[1, 2, 3, 4].map(y => (
              <button
                key={y}
                onClick={() => setSelectedYear(y)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: selectedYear === y ? 'linear-gradient(135deg, #B91C1C, #991B1B)' : 'transparent',
                  color: selectedYear === y ? '#FFF' : '#9CA3AF',
                  fontWeight: selectedYear === y ? 800 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {y === 1 ? '1st Year' : y === 2 ? '2nd Year' : y === 3 ? '3rd Year' : '4th Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Structured Fee Amounts Form Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Tuition Fee (₹)</label>
            <input type="number" className="input-field" value={tuitionFee} onChange={e => setTuitionFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Admission Fee (₹)</label>
            <input type="number" className="input-field" value={admissionFee} onChange={e => setAdmissionFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>University Fee (₹)</label>
            <input type="number" className="input-field" value={universityFee} onChange={e => setUniversityFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Exam Fee (₹)</label>
            <input type="number" className="input-field" value={examFee} onChange={e => setExamFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Laboratory Fee (₹)</label>
            <input type="number" className="input-field" value={labFee} onChange={e => setLabFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Library Fee (₹)</label>
            <input type="number" className="input-field" value={libraryFee} onChange={e => setLibraryFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Development Fee (₹)</label>
            <input type="number" className="input-field" value={developmentFee} onChange={e => setDevelopmentFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Sports & Cultural Fee (₹)</label>
            <input type="number" className="input-field" value={sportsFee} onChange={e => setSportsFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Placement Training Fee (₹)</label>
            <input type="number" className="input-field" value={placementFee} onChange={e => setPlacementFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Hostel Fee (₹)</label>
            <input type="number" className="input-field" value={hostelFee} onChange={e => setHostelFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Mess Fee (₹)</label>
            <input type="number" className="input-field" value={messFee} onChange={e => setMessFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Bus / Transport Fee (₹)</label>
            <input type="number" className="input-field" value={busFee} onChange={e => setBusFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Other College Approved Fee (₹)</label>
            <input type="number" className="input-field" value={otherCollegeFee} onChange={e => setOtherCollegeFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#F59E0B', marginBottom: 4, fontWeight: 700 }}>Scholarship Amount (₹)</label>
            <input type="number" className="input-field" value={scholarshipAmount} onChange={e => setScholarshipAmount(e.target.value)} style={{ width: '100%', borderColor: '#F59E0B' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#8B5CF6', marginBottom: 4, fontWeight: 700 }}>Fee Waiver / Concession (₹)</label>
            <input type="number" className="input-field" value={waiverAmount} onChange={e => setWaiverAmount(e.target.value)} style={{ width: '100%', borderColor: '#8B5CF6' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#10B981', marginBottom: 4, fontWeight: 700 }}>Paid Amount (₹)</label>
            <input type="number" className="input-field" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} style={{ width: '100%', borderColor: '#10B981' }} />
          </div>
        </div>

        {/* Live Calculation Footer Banner */}
        <div style={{ marginTop: 18, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', gap: 20, fontSize: '0.9rem' }}>
            <span>Total Year Fee: <strong style={{ color: '#720F0F' }}>₹{calculatedTotalFee.toLocaleString()}</strong></span>
            <span>Scholarship/Waiver: <strong style={{ color: '#D69A18' }}>-₹{(Number(scholarshipAmount) + Number(waiverAmount)).toLocaleString()}</strong></span>
            <span>Paid: <strong style={{ color: '#24733E' }}>₹{Number(paidAmount).toLocaleString()}</strong></span>
            <span>Pending Balance: <strong style={{ color: calculatedBalance > 0 ? '#A52A24' : '#24733E' }}>₹{calculatedBalance.toLocaleString()}</strong></span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <select
              className="input-field"
              value={paymentStatus}
              onChange={e => setPaymentStatus(e.target.value)}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              <option value="Not Due">Not Due</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Paid">Paid</option>
              <option value="Waived">Waived</option>
              <option value="Scholarship Covered">Scholarship Covered</option>
              <option value="Refunded">Refunded</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <button className="btn btn-primary" onClick={handleSaveYearFee}>
              + Add / Update Year {selectedYear} Fee Record
            </button>
          </div>
        </div>
      </div>

      {/* 4. SEMESTER-WISE FEE RECORD ENTRY (Sem 1 to 8) */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>
            📚 SEMESTER-WISE FEE BREAKDOWN (Sem 1 – Sem 8)
          </h3>

          <div style={{ display: 'flex', gap: 4, background: '#0B1120', padding: 4, borderRadius: 8, border: '1px solid rgba(255,255,255,0.08)' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
              <button
                key={s}
                onClick={() => setSelectedSem(s)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: selectedSem === s ? '#F59E0B' : 'transparent',
                  color: selectedSem === s ? '#000' : '#9CA3AF',
                  fontWeight: selectedSem === s ? 800 : 500,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                Sem {s}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Fee Type</label>
            <select className="input-field" value={semFeeType} onChange={e => setSemFeeType(e.target.value)} style={{ width: '100%' }}>
              {feeTypes.length > 0 ? (
                feeTypes.map(t => <option key={t.id} value={t.name}>{t.name}</option>)
              ) : (
                <>
                  <option value="Tuition Fee">Tuition Fee</option>
                  <option value="Admission Fee">Admission Fee</option>
                  <option value="University Fee">University Fee</option>
                  <option value="Exam Fee">Exam Fee</option>
                  <option value="Laboratory Fee">Laboratory Fee</option>
                  <option value="Library Fee">Library Fee</option>
                  <option value="Development Fee">Development Fee</option>
                  <option value="Sports Fee">Sports Fee</option>
                  <option value="Placement Fee">Placement Fee</option>
                  <option value="Transport Fee">Transport Fee</option>
                  <option value="Hostel Fee">Hostel Fee</option>
                  <option value="Mess Fee">Mess Fee</option>
                  <option value="Other College Fee">Other College Fee</option>
                </>
              )}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Amount (₹)</label>
            <input type="number" className="input-field" value={semAmount} onChange={e => setSemAmount(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Due Date</label>
            <input type="date" className="input-field" value={semDueDate} onChange={e => setSemDueDate(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Paid Amount (₹)</label>
            <input type="number" className="input-field" value={semPaidAmount} onChange={e => setSemPaidAmount(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={handleSaveSemFee}>
            + Add Semester {selectedSem} Fee Record
          </button>
        </div>
      </div>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: 500, padding: 24, borderRadius: 16 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B', marginBottom: 16 }}>
              💳 RECORD NEW FEE PAYMENT RECEIPT
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Payment Amount (₹)</label>
                <input type="number" className="input-field" value={pmtAmount} onChange={e => setPmtAmount(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Payment Mode</label>
                <select className="input-field" value={pmtMode} onChange={e => setPmtMode(e.target.value)} style={{ width: '100%' }}>
                  <option value="Cash">Cash</option>
                  <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS)</option>
                  <option value="Online">Online Portal / Credit/Debit Card</option>
                  <option value="Other">Other Approved Mode</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Transaction Ref Number</label>
                <input type="text" className="input-field" value={pmtTxnNo} onChange={e => setPmtTxnNo(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Receipt Number</label>
                <input type="text" className="input-field" value={pmtReceiptNo} onChange={e => setPmtReceiptNo(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Collected By / Cashier</label>
                <input type="text" className="input-field" value={pmtCollectedBy} onChange={e => setPmtCollectedBy(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleRecordPayment}>💾 Record & Print Receipt</button>
            </div>
          </div>
        </div>
      )}

      {/* FEE TYPES CONFIGURATION MODAL */}
      {showAddTypeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel" style={{ width: 480, padding: 24, borderRadius: 16 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F59E0B', marginBottom: 16 }}>
              ⚙️ ADD / CONFIGURAL FEE TYPE
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Fee Type Code</label>
                <input type="text" className="input-field" placeholder="e.g. SPECIAL_LAB" value={newTypeCode} onChange={e => setNewTypeCode(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Fee Type Name</label>
                <input type="text" className="input-field" placeholder="e.g. Special AI Lab & Cloud Fee" value={newTypeName} onChange={e => setNewTypeName(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Category</label>
                <input type="text" className="input-field" placeholder="e.g. Academic / Co-curricular" value={newTypeCat} onChange={e => setNewTypeCat(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: 4 }}>Default Amount (₹)</label>
                <input type="number" className="input-field" value={newTypeAmt} onChange={e => setNewTypeAmt(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => setShowAddTypeModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreateFeeType}>💾 Add Fee Type</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
