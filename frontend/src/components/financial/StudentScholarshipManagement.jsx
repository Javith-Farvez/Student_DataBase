import React, { useState, useEffect } from 'react';

export default function StudentScholarshipManagement({ student, showToast }) {
  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState('scholarship_scheme'); // scholarship_scheme, govt_mgmt, first_graduate, nativity_income, bank_docs

  const [selectedYear, setSelectedYear] = useState(student?.current_year || 3);

  // 1. Scholarship Scheme Form State
  const [scholarshipApplicable, setScholarshipApplicable] = useState('Yes');
  const [scholarshipType, setScholarshipType] = useState('Government Scholarship');
  const [scholarshipName, setScholarshipName] = useState('BC/MBC Welfare Post-Matric Scholarship');
  const [provider, setProvider] = useState('Government of Tamil Nadu (BC/MBC Welfare Dept)');
  const [categoryReason, setCategoryReason] = useState('BC Welfare Scheme');
  const [eligibilityStatus, setEligibilityStatus] = useState('Eligible');
  const [applicationNumber, setApplicationNumber] = useState('TN-SCH-2024-98412');
  const [applicationDate, setApplicationDate] = useState('2024-08-10');
  const [approvalDate, setApprovalDate] = useState('2024-10-15');
  const [disbursementDate, setDisbursementDate] = useState('2024-11-20');
  const [eligibleAmount, setEligibleAmount] = useState(25000);
  const [approvedAmount, setApprovedAmount] = useState(25000);
  const [disbursedAmount, setDisbursedAmount] = useState(25000);
  const [status, setStatus] = useState('Disbursed'); // Not Applied, Applied, Under Verification, Approved, Rejected, Disbursed, Renewal Pending, Renewed, Cancelled
  const [approvedBy, setApprovedBy] = useState('District Welfare Officer, Karur');

  // 2. First Graduate State (1st, 2nd, 3rd, 4th Year history)
  const [isFirstGraduate, setIsFirstGraduate] = useState('Yes');
  const [fgCertNumber, setFgCertNumber] = useState('FG-TN-2021-987654');
  const [fgIssueDate, setFgIssueDate] = useState('2021-06-15');
  const [fgVerificationStatus, setFgVerificationStatus] = useState('Verified');
  const [fgIsEligible, setFgIsEligible] = useState('Yes');
  const [fgGovtBenefitAmount, setFgGovtBenefitAmount] = useState(25000);
  const [fgAppNumber, setFgAppNumber] = useState('FG-APP-2024-1102');
  const [fgApprovalStatus, setFgApprovalStatus] = useState('Renewed'); // Approved, Renewed, Pending, Rejected

  // 3. Community & Income State
  const [community, setCommunity] = useState(student?.community || 'BC');
  const [annualIncome, setAnnualIncome] = useState(150000);
  const [incomeCertNo, setIncomeCertNo] = useState('INC-TN-2024-5541');
  const [incomeIssueDate, setIncomeIssueDate] = useState('2024-05-10');
  const [incomeValidUntil, setIncomeValidUntil] = useState('2027-05-10');

  // 4. Native / Nativity State
  const [nativeState, setNativeState] = useState(student?.state || 'Tamil Nadu');
  const [nativeDistrict, setNativeDistrict] = useState(student?.district || 'Karur');
  const [nativeTaluk, setNativeTaluk] = useState('Karur Taluk');
  const [nativeVillage, setNativeVillage] = useState('Thanthonimalai');
  const [nativeCity, setNativeCity] = useState(student?.city || 'Karur');
  const [nativePincode, setNativePincode] = useState(student?.pincode || '639005');
  const [permanentAddress, setPermanentAddress] = useState(student?.address_line || '42 Anna Nagar, Thanthonimalai, Karur');
  const [nativityCertNo, setNativityCertNo] = useState('NAT-TN-2021-00941');

  // 5. Masked Bank Details State
  const [accountHolderName, setAccountHolderName] = useState(student?.full_name || 'Aarav Sharma');
  const [bankName, setBankName] = useState('State Bank of India (SBI)');
  const [accountNumber, setAccountNumber] = useState('987654321098');
  const [ifscCode, setIfscCode] = useState('SBIN0001234');
  const [branchName, setBranchName] = useState('Karur Main Branch');

  const studentId = student?.id || student?.register_number;

  const fetchSummary = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
        if (data.nativity) {
          setNativeState(data.nativity.native_state || 'Tamil Nadu');
          setNativeDistrict(data.nativity.native_district || 'Karur');
          setNativeTaluk(data.nativity.native_taluk || 'Karur Taluk');
          setNativeVillage(data.nativity.native_village || 'Thanthonimalai');
          setNativeCity(data.nativity.native_city || 'Karur');
          setNativePincode(data.nativity.native_pincode || '639005');
          if (data.nativity.certificate_number) setNativityCertNo(data.nativity.certificate_number);
        }
        if (data.bank_detail) {
          setAccountHolderName(data.bank_detail.account_holder_name || student?.full_name);
          setBankName(data.bank_detail.bank_name || 'SBI');
          if (data.bank_detail.ifsc_code) setIfscCode(data.bank_detail.ifsc_code);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [studentId]);

  // Sync Year-Specific Scholarship & First Graduate Data
  useEffect(() => {
    if (summaryData) {
      if (summaryData.scholarship_records?.length > 0) {
        const rec = summaryData.scholarship_records.find(r => r.year === selectedYear);
        if (rec) {
          setScholarshipType(rec.scholarship_type || 'Government Scholarship');
          setScholarshipName(rec.scholarship_name || 'BC/MBC Welfare Scholarship');
          setProvider(rec.provider || 'Government of Tamil Nadu');
          setApprovedAmount(rec.approved_amount || 25000);
          setDisbursedAmount(rec.disbursed_amount || 25000);
          setStatus(rec.status || 'Approved');
        }
      }
      if (summaryData.first_graduate_records?.length > 0) {
        const fgRec = summaryData.first_graduate_records.find(r => r.year === selectedYear);
        if (fgRec) {
          setIsFirstGraduate(fgRec.is_first_graduate || 'Yes');
          setFgGovtBenefitAmount(fgRec.government_benefit_amount || 25000);
          setFgApprovalStatus(fgRec.approval_status || 'Approved');
          if (fgRec.certificate_number) setFgCertNumber(fgRec.certificate_number);
        }
      }
    }
  }, [selectedYear, summaryData]);

  // Save Handlers
  const handleSaveScholarship = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/scholarship-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          academic_year: `${2021 + selectedYear - 1}-${2022 + selectedYear - 1}`,
          scholarship_applicable: scholarshipApplicable,
          scholarship_type: scholarshipType,
          scholarship_name: scholarshipName,
          provider: provider,
          category_reason: categoryReason,
          eligibility_status: eligibilityStatus,
          application_number: applicationNumber,
          application_date: applicationDate,
          approval_date: approvalDate,
          disbursement_date: disbursementDate,
          eligible_amount: Number(eligibleAmount),
          approved_amount: Number(approvedAmount),
          disbursed_amount: Number(disbursedAmount),
          status: status,
          approved_by: approvedBy,
          updated_by: 'STAFF_SCHOLARSHIP'
        })
      });
      if (res.ok) {
        if (showToast) showToast(`📜 Scholarship record saved for Year ${selectedYear}!`);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveFirstGraduate = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/first-graduate-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          academic_year: `${2021 + selectedYear - 1}-${2022 + selectedYear - 1}`,
          is_first_graduate: isFirstGraduate,
          certificate_number: fgCertNumber,
          issue_date: fgIssueDate,
          verification_status: fgVerificationStatus,
          is_eligible: fgIsEligible,
          government_benefit_amount: Number(fgGovtBenefitAmount),
          application_number: fgAppNumber,
          approval_status: fgApprovalStatus,
          updated_by: 'STAFF_SCHOLARSHIP'
        })
      });
      if (res.ok) {
        if (showToast) showToast(`🎓 First Graduate record for Year ${selectedYear} saved!`);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNativity = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/nativity-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          native_state: nativeState,
          native_district: nativeDistrict,
          native_taluk: nativeTaluk,
          native_village: nativeVillage,
          native_city: nativeCity,
          native_pincode: nativePincode,
          permanent_native_address: permanentAddress,
          certificate_number: nativityCertNo,
          issue_date: '2021-05-20',
          verification_status: 'Verified',
          updated_by: 'STAFF_ADMIN'
        })
      });
      if (res.ok) {
        if (showToast) showToast(`📍 Nativity & Permanent Address details saved!`);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveBankDetails = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/bank-details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_holder_name: accountHolderName,
          bank_name: bankName,
          account_number: accountNumber,
          ifsc_code: ifscCode,
          branch_name: branchName,
          updated_by: 'STAFF_ACCOUNTS'
        })
      });
      if (res.ok) {
        if (showToast) showToast(`🏦 Bank account details updated securely & masked!`);
        fetchSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* HEADER BANNER */}
      <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid #8B5CF6' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#8B5CF6', fontWeight: 700, textTransform: 'uppercase' }}>
              VSB SMARTCAMPUS — SCHOLARSHIP, FINANCIAL BENEFITS & FIRST GRADUATE MODULE
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: 4 }}>
              📜 Scholarship & Benefits: {student?.full_name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: 4 }}>
              Reg No: <strong style={{ color: '#F59E0B' }}>{student?.register_number}</strong> • Community: <strong style={{ color: '#FFF' }}>{community}</strong> • Quota: <strong style={{ color: '#8B5CF6' }}>{summaryData?.fee_profile?.quota_category || 'Government Quota'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'scholarship_scheme', label: '📜 Scholarship Schemes', icon: '📜' },
              { id: 'first_graduate', label: '🎓 First Graduate', icon: '🎓' },
              { id: 'nativity_income', label: '📍 Nativity & Income', icon: '📍' },
              { id: 'bank_docs', label: '🏦 Bank & Documents', icon: '🏦' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: 'none',
                  background: activeSubTab === tab.id ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' : 'rgba(255,255,255,0.05)',
                  color: activeSubTab === tab.id ? '#FFF' : '#9CA3AF',
                  fontWeight: activeSubTab === tab.id ? 800 : 500,
                  fontSize: '0.82rem',
                  cursor: 'pointer'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: SCHOLARSHIP SCHEMES (GOVT & MANAGEMENT) */}
      {activeSubTab === 'scholarship_scheme' && (
        <div className="glass-panel" style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8B5CF6' }}>
              📜 SCHOLARSHIP ELIGIBILITY & YEAR-WISE SCHEMES
            </h3>

            {/* Year Selector */}
            <div style={{ display: 'flex', gap: 6, background: '#0B1120', padding: 4, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
              {[1, 2, 3, 4].map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: selectedYear === y ? '#8B5CF6' : 'transparent',
                    color: selectedYear === y ? '#FFF' : '#9CA3AF',
                    fontWeight: selectedYear === y ? 800 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Year {y}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Scholarship Applicable?</label>
              <select className="input-field" value={scholarshipApplicable} onChange={e => setScholarshipApplicable(e.target.value)} style={{ width: '100%' }}>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Scholarship Category / Type</label>
              <select className="input-field" value={scholarshipType} onChange={e => setScholarshipType(e.target.value)} style={{ width: '100%' }}>
                <option value="Government Scholarship">Government Scholarship</option>
                <option value="Management Scholarship">Management Scholarship</option>
                <option value="Community Scholarship">Community-Based (BC/MBC/SC/ST)</option>
                <option value="Income Scholarship">Income-Based Scholarship</option>
                <option value="Merit Scholarship">Merit Scholarship</option>
                <option value="Sports Scholarship">Sports Scholarship</option>
                <option value="Institutional Support">Institutional Fee Concession</option>
                <option value="Private Scholarship">Private / Corporate Trust</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Scholarship Scheme Name</label>
              <input type="text" className="input-field" value={scholarshipName} onChange={e => setScholarshipName(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Provider / Authority</label>
              <input type="text" className="input-field" value={provider} onChange={e => setProvider(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Application Number</label>
              <input type="text" className="input-field" value={applicationNumber} onChange={e => setApplicationNumber(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Application Date</label>
              <input type="date" className="input-field" value={applicationDate} onChange={e => setApplicationDate(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Approval Date</label>
              <input type="date" className="input-field" value={approvalDate} onChange={e => setApprovalDate(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Disbursement Date</label>
              <input type="date" className="input-field" value={disbursementDate} onChange={e => setDisbursementDate(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Eligible Amount (₹)</label>
              <input type="number" className="input-field" value={eligibleAmount} onChange={e => setEligibleAmount(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#8B5CF6', marginBottom: 4, fontWeight: 700 }}>Approved Amount (₹)</label>
              <input type="number" className="input-field" value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#10B981', marginBottom: 4, fontWeight: 700 }}>Disbursed Amount (₹)</label>
              <input type="number" className="input-field" value={disbursedAmount} onChange={e => setDisbursedAmount(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Scholarship Status</label>
              <select className="input-field" value={status} onChange={e => setStatus(e.target.value)} style={{ width: '100%' }}>
                <option value="Not Applied">Not Applied</option>
                <option value="Applied">Applied</option>
                <option value="Under Verification">Under Verification</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Disbursed">Disbursed</option>
                <option value="Renewal Pending">Renewal Pending</option>
                <option value="Renewed">Renewed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleSaveScholarship}>
              + Add / Update Scholarship Record for Year {selectedYear}
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: DEDICATED FIRST GRADUATE SECTION */}
      {activeSubTab === 'first_graduate' && (
        <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>
                🎓 FIRST GRADUATE SCHOLARSHIP & YEAR-WISE HISTORY
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#9CA3AF', marginTop: 2 }}>
                Dedicated tracking for First Graduate benefit eligibility across 4 years connected to single student record.
              </p>
            </div>

            {/* Year Selector */}
            <div style={{ display: 'flex', gap: 6, background: '#0B1120', padding: 4, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
              {[1, 2, 3, 4].map(y => (
                <button
                  key={y}
                  onClick={() => setSelectedYear(y)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: selectedYear === y ? '#10B981' : 'transparent',
                    color: selectedYear === y ? '#FFF' : '#9CA3AF',
                    fontWeight: selectedYear === y ? 800 : 500,
                    fontSize: '0.8rem',
                    cursor: 'pointer'
                  }}
                >
                  Year {y}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>First Graduate Status?</label>
              <select className="input-field" value={isFirstGraduate} onChange={e => setIsFirstGraduate(e.target.value)} style={{ width: '100%' }}>
                <option value="Yes">Yes — First Graduate</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>First Graduate Certificate No</label>
              <input type="text" className="input-field" value={fgCertNumber} onChange={e => setFgCertNumber(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Certificate Issue Date</label>
              <input type="date" className="input-field" value={fgIssueDate} onChange={e => setFgIssueDate(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Verification Status</label>
              <select className="input-field" value={fgVerificationStatus} onChange={e => setFgVerificationStatus(e.target.value)} style={{ width: '100%' }}>
                <option value="Verified">Verified & Approved</option>
                <option value="Pending">Verification Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Eligible for Govt Benefit?</label>
              <select className="input-field" value={fgIsEligible} onChange={e => setFgIsEligible(e.target.value)} style={{ width: '100%' }}>
                <option value="Yes">Yes (Eligible for ₹25,000/yr)</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#10B981', marginBottom: 4, fontWeight: 700 }}>Government Benefit Amount (₹)</label>
              <input type="number" className="input-field" value={fgGovtBenefitAmount} onChange={e => setFgGovtBenefitAmount(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Application / Ref Number</label>
              <input type="text" className="input-field" value={fgAppNumber} onChange={e => setFgAppNumber(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Approval Status</label>
              <select className="input-field" value={fgApprovalStatus} onChange={e => setFgApprovalStatus(e.target.value)} style={{ width: '100%' }}>
                <option value="Approved">Approved</option>
                <option value="Renewed">Renewed for Year {selectedYear}</option>
                <option value="Pending">Renewal Pending</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={handleSaveFirstGraduate}>
              + Add / Update First Graduate Record for Year {selectedYear}
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: NATIVITY & INCOME DETAILS */}
      {activeSubTab === 'nativity_income' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* NATIVITY DETAILS */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B', marginBottom: 14 }}>
              📍 NATIVE & PERMANENT NATIVITY INFORMATION
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Native State</label>
                <input type="text" className="input-field" value={nativeState} onChange={e => setNativeState(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Native District</label>
                <input type="text" className="input-field" value={nativeDistrict} onChange={e => setNativeDistrict(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Native Taluk</label>
                <input type="text" className="input-field" value={nativeTaluk} onChange={e => setNativeTaluk(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Native Village / Town</label>
                <input type="text" className="input-field" value={nativeVillage} onChange={e => setNativeVillage(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Native City</label>
                <input type="text" className="input-field" value={nativeCity} onChange={e => setNativeCity(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Native Pincode</label>
                <input type="text" className="input-field" value={nativePincode} onChange={e => setNativePincode(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Nativity Certificate Number</label>
                <input type="text" className="input-field" value={nativityCertNo} onChange={e => setNativityCertNo(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div style={{ gridColumn: 'span 4' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Permanent Native Address</label>
                <textarea className="input-field" rows={2} value={permanentAddress} onChange={e => setPermanentAddress(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSaveNativity}>
                💾 Save Permanent Nativity Record
              </button>
            </div>
          </div>

          {/* INCOME CERTIFICATE DETAILS */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#3B82F6', marginBottom: 14 }}>
              💵 COMMUNITY & PARENTAL INCOME CERTIFICATE
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Community</label>
                <select className="input-field" value={community} onChange={e => setCommunity(e.target.value)} style={{ width: '100%' }}>
                  <option value="BC">BC (Backward Class)</option>
                  <option value="MBC">MBC / DNC</option>
                  <option value="SC">SC (Scheduled Caste)</option>
                  <option value="ST">ST (Scheduled Tribe)</option>
                  <option value="OC">OC / General</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Annual Parental Income (₹)</label>
                <input type="number" className="input-field" value={annualIncome} onChange={e => setAnnualIncome(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Income Certificate Number</label>
                <input type="text" className="input-field" value={incomeCertNo} onChange={e => setIncomeCertNo(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Valid Until Date</label>
                <input type="date" className="input-field" value={incomeValidUntil} onChange={e => setIncomeValidUntil(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BANK & DOCUMENTS */}
      {activeSubTab === 'bank_docs' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* MASKED BANK DETAILS */}
          <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid #F59E0B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B' }}>
                  🔒 RESTRICTED & MASKED BANK DISBURSEMENT DETAILS
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
                  Account number is automatically encrypted and masked for security compliance.
                </p>
              </div>
              <span className="badge badge-emerald">🔒 Encrypted Storage</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Account Holder Name</label>
                <input type="text" className="input-field" value={accountHolderName} onChange={e => setAccountHolderName(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Bank Name</label>
                <input type="text" className="input-field" value={bankName} onChange={e => setBankName(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Bank Account Number</label>
                <input type="password" className="input-field" placeholder="Full Account Number" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} style={{ width: '100%' }} />
                <span style={{ fontSize: '0.72rem', color: '#10B981', marginTop: 2, display: 'block' }}>
                  Masked Preview: •••• •••• {accountNumber.slice(-4)}
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>IFSC Code</label>
                <input type="text" className="input-field" value={ifscCode} onChange={e => setIfscCode(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Branch Name</label>
                <input type="text" className="input-field" value={branchName} onChange={e => setBranchName(e.target.value)} style={{ width: '100%' }} />
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-primary" onClick={handleSaveBankDetails}>
                🔒 Save & Encrypt Bank Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
