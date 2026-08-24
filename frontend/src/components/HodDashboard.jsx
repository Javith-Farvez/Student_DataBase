import React, { useState, useEffect } from 'react';
import VSBLogo from './VSBLogo.jsx';
import VSBStudentProfile from './VSBStudentProfile.jsx';
import StaffMarkEntryModal from './StaffMarkEntryModal.jsx';
import AddStudentWizard from './AddStudentWizard.jsx';
import VSBDepartmentDetail from './VSBDepartmentDetail.jsx';
import { getStudentsByClass } from '../api/studentService.js';

export default function HodDashboard({ userSession = {}, students = [], onBack }) {
  // HOD's Assigned Department (Locked to own department)
  const hodDept = userSession?.department || {
    id: 'dept-aids',
    code: 'AIDS',
    name: 'Artificial Intelligence & Data Science',
    count: 480,
    hodName: 'Dr. K. Senthil Kumar'
  };

  const hodName = userSession?.userName || 'Dr. K. Senthil Kumar (HOD AI & DS)';
  const employeeId = userSession?.employeeId || 'HOD001';

  // Navigation Drilldown State: selectedYear (null or 1..4) -> selectedSection (null or 'A'..'C') -> selectedStudent
  const [selectedYear, setSelectedYear] = useState(null); // null shows Year cards grid like the image!
  const [selectedSection, setSelectedSection] = useState(null); // null shows Section cards grid
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAddStudentWizard, setShowAddStudentWizard] = useState(false);
  const [showDeptDetail, setShowDeptDetail] = useState(false);

  // Live students list
  const [liveStudents, setLiveStudents] = useState(Array.isArray(students) && students.length > 0 ? students : []);

  useEffect(() => {
    const loadDeptStudents = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/api/v1/students?department_code=${hodDept.code}&limit=500`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setLiveStudents(data);
          }
        }
      } catch (err) {
        console.warn('Live HOD students fetch fallback:', err);
      }
    };
    loadDeptStudents();
  }, [hodDept.code]);

  // Sorting & Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');
  const [arrearFilter, setArrearFilter] = useState('ALL');

  // Modals & Toast State
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markTargetStudent, setMarkTargetStudent] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filter & Sort Students strictly for HOD's department
  const activeStudentList = liveStudents.length > 0 ? liveStudents : students;
  let deptStudents = activeStudentList.filter(s => {
    // 1. Lock to own department ONLY
    const sDept = s.department_code || (s.department && s.department.code) || s.department_name || '';
    if (sDept && !sDept.toLowerCase().includes(hodDept.code.toLowerCase()) && !hodDept.code.toLowerCase().includes(sDept.toLowerCase())) {
      return false;
    }
    // 2. Filter by Year if selected
    if (selectedYear && (s.current_year || 1) !== selectedYear) return false;

    // 3. Filter by Section if selected
    if (selectedSection && (s.section_name || 'A') !== selectedSection) {
      return false;
    }

    // 4. Filter by Fee Status
    if (feeStatusFilter === 'PAID' && s.fee_balance > 0) return false;
    if (feeStatusFilter === 'PENDING' && (!s.fee_balance || s.fee_balance === 0)) return false;

    // 5. Filter by Arrear Status
    if (arrearFilter === 'NO_ARREARS' && s.arrears > 0) return false;
    if (arrearFilter === 'HAS_ARREARS' && (!s.arrears || s.arrears === 0)) return false;

    // 6. Search by Name or Register Number
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (s.full_name && s.full_name.toLowerCase().includes(q)) ||
        (s.register_number && s.register_number.toLowerCase().includes(q)) ||
        (s.roll_number && s.roll_number.toLowerCase().includes(q));
    }
    return true;
  });

  // Apply Sorting
  if (sortBy === 'CGPA_DESC') {
    deptStudents.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
  } else if (sortBy === 'CGPA_ASC') {
    deptStudents.sort((a, b) => (a.cgpa || 0) - (b.cgpa || 0));
  } else if (sortBy === 'ATTENDANCE_DESC') {
    deptStudents.sort((a, b) => (b.attendance_percentage || 0) - (a.attendance_percentage || 0));
  } else if (sortBy === 'ATTENDANCE_ASC') {
    deptStudents.sort((a, b) => (a.attendance_percentage || 0) - (b.attendance_percentage || 0));
  }

  const exportExcel = () => {
    triggerToast(`📊 Exported ${deptStudents.length} ${hodDept.code} student records to Excel (.xlsx)!`);
  };

  const exportPdf = () => {
    triggerToast(`📄 Exported ${hodDept.code} Department PDF Report!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8,
          background: '#720F0F', color: '#FFFFFF', fontWeight: 600, boxShadow: '0 4px 16px rgba(114,15,15,0.25)', zIndex: 5000,
          border: '1px solid #D69A18'
        }}>
          ✨ {toastMsg}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: '#F4EFE6',
        border: '1px solid #D8CEBE',
        borderLeft: '4px solid #D69A18',
        borderRadius: 11,
        padding: '22px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 16,
        boxShadow: '0 2px 8px rgba(70, 45, 20, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <VSBLogo size={44} showTitle={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-gold" style={{ fontSize: '12px', fontWeight: 600 }}>👔 HOD PORTAL — {hodDept.code}</span>
              <span className="badge badge-vsb" style={{ fontSize: '12px', fontWeight: 600 }}>STRICT DEPARTMENT SCOPE PROTECTION</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#5A0A0A', lineHeight: 1.25, fontFamily: "var(--font-college)" }}>
              Department of {hodDept.name} — HOD Executive Portal
            </h1>
            <p style={{ fontSize: '13px', color: '#5C5750', marginTop: 3 }}>
              HOD: <strong style={{ color: '#720F0F', fontWeight: 700 }}>{hodName}</strong> • Department Scope: <strong style={{ color: '#8A5D00', fontWeight: 700 }}>{hodDept.code}</strong> • Staff ID: {employeeId}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => setShowDeptDetail(true)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: 6,
              cursor: 'pointer',
              background: '#FAF7F0',
              border: '1px solid #720F0F',
              color: '#720F0F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 200ms ease'
            }}
          >
            🏛️ View Department Details
          </button>
          <button
            onClick={exportExcel}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: 6,
              cursor: 'pointer',
              background: '#FAF7F0',
              border: '1px solid #D8CEBE',
              color: '#720F0F',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 200ms ease'
            }}
          >
            📊 Export Excel
          </button>
          <button
            onClick={exportPdf}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: 6,
              cursor: 'pointer',
              background: '#720F0F',
              border: '1px solid #4B0909',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(114, 15, 15, 0.20)',
              transition: 'all 200ms ease'
            }}
          >
            📄 Print Class Reports
          </button>
          {onBack && (
            <button
              onClick={onBack}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: 6,
                cursor: 'pointer',
                background: '#FAF7F0',
                border: '1px solid #D8CEBE',
                color: '#720F0F',
                transition: 'all 200ms ease'
              }}
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* DEPARTMENT DETAIL OVERLAY VIEW */}
      {showDeptDetail ? (
        <VSBDepartmentDetail
          department={hodDept}
          userSession={userSession}
          onBack={() => setShowDeptDetail(false)}
          onNavigateToRoster={() => setShowDeptDetail(false)}
        />
      ) : null}


      {/* BREADCRUMB TRAIL */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: '#F1EBE0',
        padding: '11px 18px',
        borderRadius: 8,
        border: '1px solid #D8CEBE',
        fontSize: '13.5px'
      }}>
        <span
          style={{ cursor: 'pointer', color: !selectedYear ? '#5A0A0A' : '#5C5750', fontWeight: !selectedYear ? 700 : 500 }}
          onClick={() => { setSelectedYear(null); setSelectedSection(null); setSelectedStudent(null); }}
        >
          🏛️ {hodDept.code} Department Home
        </span>

        {selectedYear && (
          <>
            <span style={{ color: '#777168' }}>➔</span>
            <span
              style={{ cursor: 'pointer', color: !selectedSection ? '#5A0A0A' : '#5C5750', fontWeight: !selectedSection ? 700 : 500 }}
              onClick={() => { setSelectedSection(null); setSelectedStudent(null); }}
            >
              Academic Year {selectedYear}
            </span>
          </>
        )}

        {selectedSection && (
          <>
            <span style={{ color: '#777168' }}>➔</span>
            <span style={{ color: '#5A0A0A', fontWeight: 700 }}>
              Section {selectedSection} Roster
            </span>
          </>
        )}
      </div>

      {/* HOD DEPARTMENT ANALYTICS METRICS (7 KPI CARDS) — ONLY ON ROOT OVERVIEW */}
      {!selectedYear && !selectedSection && !selectedStudent && !showAddStudentWizard && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{
            background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #D69A18',
            borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)'
          }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>1. Department Students</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#5A0A0A', margin: '4px 0' }}>480 Students</div>
            <span style={{ fontSize: '11px', color: '#24733E', fontWeight: 600 }}>Locked to {hodDept.code}</span>
          </div>

          <div style={{
            background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #720F0F',
            borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)'
          }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>2. Faculty Members</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#720F0F', margin: '4px 0' }}>24 Staff</div>
            <span style={{ fontSize: '11px', color: '#777168', fontWeight: 500 }}>12 Class Sections</span>
          </div>

          <div style={{
            background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #24733E',
            borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)'
          }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>3. Pass Percentage</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#24733E', margin: '4px 0' }}>97.2%</div>
            <span style={{ fontSize: '11px', color: '#24733E', fontWeight: 600 }}>Univ Exam Results</span>
          </div>

          <div style={{
            background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #A96E00',
            borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)'
          }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>4. Placement Rate</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#A96E00', margin: '4px 0' }}>96.5%</div>
            <span style={{ fontSize: '11px', color: '#A96E00', fontWeight: 600 }}>Highest 28.0 LPA</span>
          </div>

          <div style={{
            background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #24733E',
            borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)'
          }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>5. Department Attendance</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#24733E', margin: '4px 0' }}>96.8%</div>
            <span style={{ fontSize: '11px', color: '#24733E', fontWeight: 600 }}>Daily Verified</span>
          </div>

          <div style={{
            background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #A52A24',
            borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)'
          }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>6. Pending Arrear Count</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#A52A24', margin: '4px 0' }}>8 Arrears</div>
            <span style={{ fontSize: '11px', color: '#777168', fontWeight: 500 }}>Low Arrear Rate</span>
          </div>

          <div style={{
            background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #D69A18',
            borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)'
          }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>7. Fee Collection Status</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#5A0A0A', margin: '4px 0' }}>94.2% Paid</div>
            <span style={{ fontSize: '11px', color: '#777168', fontWeight: 500 }}>₹ 3.50 L Dues</span>
          </div>
        </div>
      )}

      {/* VIEW 0: IF ADD STUDENT WIZARD IS OPEN */}
      {showAddStudentWizard ? (
        <AddStudentWizard
          onBack={() => setShowAddStudentWizard(false)}
          onSaveSuccess={(msg) => {
            triggerToast(msg || '🎉 New Student Successfully Registered!');
            setShowAddStudentWizard(false);
          }}
        />
      ) : selectedStudent ? (
        <VSBStudentProfile
          student={selectedStudent}
          allStudents={students}
          readOnly={true}
          userSession={{ ...userSession, role: 'HOD' }}
          onSelectStudent={setSelectedStudent}
          onBack={() => setSelectedStudent(null)}
        />
      ) : selectedYear === null ? (
        /* VIEW B: YEAR CARDS GRID (EXACT STYLING LIKE THE USER'S SCREENSHOT!) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#5A0A0A', lineHeight: 1.3 }}>
                My Department Years (4 Academic Years)
              </h2>
              <p style={{ fontSize: '13.5px', color: '#5C5750', fontWeight: 400, marginTop: 4 }}>
                Select an academic year to view sections and student records.
              </p>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: 9999,
                background: '#F9EED4',
                border: '1px solid #D69A18',
                color: '#720F0F',
                letterSpacing: '0.02em'
              }}
            >
              DEPT SCOPE: {hodDept.code} ONLY
            </span>
          </div>

          {/* 3 Boxes per row, remaining box wraps to next row below */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {[
              { year: 1, label: '1st Year', title: `1st Year — ${hodDept.code}`, sem: 'Semester 1 & 2', code: 'BATCH 24-28', subject: 'Problem Solving & Python' },
              { year: 2, label: '2nd Year', title: `2nd Year — ${hodDept.code}`, sem: 'Semester 3 & 4', code: 'BATCH 23-27', subject: 'Data Structures & ML' },
              { year: 3, label: '3rd Year', title: `3rd Year — ${hodDept.code}`, sem: 'Semester 5 & 6', code: 'BATCH 22-26', subject: 'Deep Learning & NLP' },
              { year: 4, label: '4th Year', title: `4th Year — ${hodDept.code}`, sem: 'Semester 7 & 8', code: 'BATCH 21-25', subject: 'Capstone Project Phase II' }
            ].map(yr => (
              <div
                key={yr.year}
                className="glass-panel group"
                style={{
                  padding: '24px 24px 22px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 18,
                  minHeight: 245,
                  borderLeft: '5px solid #D49A17',
                  background: '#FAF7F2',
                  border: '1px solid #D8CEBE',
                  borderRadius: 12,
                  boxShadow: '0 4px 14px rgba(70, 45, 20, 0.08)',
                  transition: 'all 0.25s ease'
                }}
                onClick={() => setSelectedYear(yr.year)}
                onMouseOver={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(110, 15, 15, 0.12)';
                  e.currentTarget.style.borderColor = '#D49A17';
                }}
                onMouseOut={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(70, 45, 20, 0.08)';
                  e.currentTarget.style.borderColor = '#D8CEBE';
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: '6px',
                        background: '#FDF6E2',
                        border: '1px solid #D49A17',
                        color: '#8A5D00',
                        letterSpacing: '0.04em'
                      }}
                    >
                      {yr.code}
                    </span>
                    <span
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        color: '#1E7039',
                        letterSpacing: '0.01em'
                      }}
                    >
                      {yr.label}
                    </span>
                  </div>

                  <h3
                    style={{
                      fontSize: '1.3rem',
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontWeight: 700,
                      color: '#6E0F0F',
                      lineHeight: 1.28,
                      marginBottom: 10
                    }}
                  >
                    {yr.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.92rem',
                      color: '#555555',
                      lineHeight: 1.5,
                      marginBottom: 10
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#333333' }}>Focus:</span>{' '}
                    <strong style={{ color: '#1B1B1B', fontWeight: 600 }}>{yr.subject}</strong>
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '8px 12px',
                      fontSize: '0.84rem',
                      color: '#555555',
                      padding: '8px 12px',
                      background: 'rgba(255, 255, 255, 0.75)',
                      borderRadius: '8px',
                      border: '1px solid #E5DDCF'
                    }}
                  >
                    <span>📅 {yr.sem}</span>
                    <span style={{ color: '#D49A17' }}>•</span>
                    <span>👥 Enrolled: <strong style={{ color: '#6E0F0F', fontWeight: 700 }}>120</strong> students</span>
                  </div>
                </div>

                <div style={{ marginTop: 8 }}>
                  <button
                    style={{
                      width: '100%',
                      height: 44,
                      fontSize: '0.92rem',
                      fontWeight: 700,
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: '0.02em',
                      borderRadius: 8,
                      background: '#6E0F0F',
                      color: '#FFFFFF',
                      border: 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 2px 6px rgba(110, 15, 15, 0.2)',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.background = '#4B0808';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(110, 15, 15, 0.3)';
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.background = '#6E0F0F';
                      e.currentTarget.style.boxShadow = '0 2px 6px rgba(110, 15, 15, 0.2)';
                    }}
                  >
                    Select Year & Query Sections →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : selectedSection === null ? (
        /* VIEW C: SECTION CARDS GRID FOR SELECTED YEAR */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <button
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    background: '#FAF7F0',
                    border: '1px solid #720F0F',
                    color: '#720F0F',
                    transition: 'all 200ms ease'
                  }}
                  onClick={() => setSelectedYear(null)}
                >
                  ← All Academic Years
                </button>
                <span className="badge badge-gold" style={{ fontSize: '12px', fontWeight: 600 }}>Academic Year {selectedYear}</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#5A0A0A', lineHeight: 1.3 }}>
                Year {selectedYear} Class Sections (3 Sections)
              </h2>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: 9999,
                background: '#F9EED4',
                border: '1px solid #D69A18',
                color: '#720F0F',
                letterSpacing: '0.02em'
              }}
            >
              DEPT SCOPE: {hodDept.code} ONLY
            </span>
          </div>

          {/* 3 Gold-Bordered Section Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
            {['A', 'B', 'C'].map(sec => (
              <div
                key={sec}
                className="glass-panel"
                style={{
                  padding: 24,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  minHeight: 220,
                  borderLeft: '4px solid #D69A18',
                  background: '#FAF7F0',
                  border: '1px solid #D8CEBE',
                  borderRadius: 11,
                  boxShadow: '0 2px 8px rgba(70, 45, 20, 0.10)'
                }}
                onClick={() => setSelectedSection(sec)}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span className="badge badge-gold" style={{ fontSize: '12px', fontWeight: 600 }}>SECTION {sec}</span>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#24733E' }}>40 Students</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#5A0A0A', lineHeight: 1.3 }}>
                    {selectedYear === 1 ? 'I' : selectedYear === 2 ? 'II' : selectedYear === 3 ? 'III' : 'IV'} {hodDept.code} – Section {sec}
                  </h3>

                  <p style={{ fontSize: '13.5px', color: '#5C5750', marginTop: 6 }}>
                    Class Advisor: <strong style={{ color: '#2B2926', fontWeight: 600 }}>Prof. M. Rajesh</strong>
                  </p>
                  <p style={{ fontSize: '12.5px', color: '#777168', marginTop: 2 }}>
                    Semester {selectedYear * 2} • Section {sec} • Branch: {hodDept.code}
                  </p>
                </div>

                <div style={{ marginTop: 10 }}>
                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      height: 44,
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: 6,
                      background: '#720F0F',
                      color: '#FFFFFF'
                    }}
                  >
                    Open Roster & Marks →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* VIEW D: STUDENT ROSTER FOR SELECTED YEAR & SECTION WITH ALL FILTERS */
        <div className="glass-panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setSelectedSection(null)}>
                  ← Change Section
                </button>
                <span className="badge badge-gold">Year {selectedYear} • Section {selectedSection}</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {selectedYear === 1 ? 'I' : selectedYear === 2 ? 'II' : selectedYear === 3 ? 'III' : 'IV'} {hodDept.code} – Section {selectedSection} Student Roster ({deptStudents.length} Students)
              </h2>
            </div>
          </div>

          {/* INTERACTIVE FILTERS BAR */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
            background: 'rgba(255,255,255,0.02)',
            padding: 16,
            borderRadius: 12,
            border: '1px solid var(--border-color)'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>🔍 Search Student</label>
              <input type="text" className="input-field" placeholder="Reg No or Name..." style={{ width: '100%' }} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>📊 Sort Records</label>
              <select className="input-field" style={{ width: '100%' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="DEFAULT">Default Order</option>
                <option value="CGPA_DESC">CGPA (High to Low)</option>
                <option value="CGPA_ASC">CGPA (Low to High)</option>
                <option value="ATTENDANCE_DESC">Attendance (High to Low)</option>
                <option value="ATTENDANCE_ASC">Attendance (Low to High)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>💰 Fee Status</label>
              <select className="input-field" style={{ width: '100%' }} value={feeStatusFilter} onChange={e => setFeeStatusFilter(e.target.value)}>
                <option value="ALL">All Fee Status</option>
                <option value="PAID">Fee Paid Only</option>
                <option value="PENDING">Pending Dues Only</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>⚠️ Arrear Status</label>
              <select className="input-field" style={{ width: '100%' }} value={arrearFilter} onChange={e => setArrearFilter(e.target.value)}>
                <option value="ALL">All Students</option>
                <option value="NO_ARREARS">No Arrears (0)</option>
                <option value="HAS_ARREARS">With Arrears (&gt;0)</option>
              </select>
            </div>
          </div>

          {/* STUDENT ROSTER TABLE */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 12 }}>Photo</th>
                  <th style={{ padding: 12 }}>Register No</th>
                  <th style={{ padding: 12 }}>Student Name</th>
                  <th style={{ padding: 12 }}>Section</th>
                  <th style={{ padding: 12 }}>Semester</th>
                  <th style={{ padding: 12 }}>Mobile Number</th>
                  <th style={{ padding: 12 }}>Attendance %</th>
                  <th style={{ padding: 12 }}>CGPA</th>
                  <th style={{ padding: 12 }}>Arrears</th>
                  <th style={{ padding: 12 }}>Fee Status</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deptStudents.map(st => {
                  const photoUrl = st.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.full_name || 'Student')}&background=B22222&color=F4B400&size=100`;
                  const isFeePaid = !st.fee_balance || st.fee_balance === 0;

                  return (
                    <tr key={st.id || st.register_number} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: 12 }}>
                        <img
                          src={photoUrl}
                          alt={st.full_name}
                          style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F4B400' }}
                        />
                      </td>
                      <td style={{ padding: 12, fontWeight: 700, color: '#F4B400' }}>{st.register_number}</td>
                      <td style={{ padding: 12, fontWeight: 600, color: '#fff' }}>{st.full_name}</td>
                      <td style={{ padding: 12, fontWeight: 700 }}>Sec {selectedSection}</td>
                      <td style={{ padding: 12 }}>Sem {selectedYear * 2}</td>
                      <td style={{ padding: 12, color: 'var(--text-muted)' }}>{st.phone || '+91 98765 43210'}</td>
                      <td style={{ padding: 12 }}>
                        <span className={`badge ${st.attendance_percentage < 75 ? 'badge-vsb' : 'badge-emerald'}`}>
                          {st.attendance_percentage || 95.4}%
                        </span>
                      </td>
                      <td style={{ padding: 12, fontWeight: 700, color: '#34d399' }}>{st.cgpa || 8.92}</td>
                      <td style={{ padding: 12 }}>
                        <span className={`badge ${st.arrears > 0 ? 'badge-vsb' : 'badge-emerald'}`}>
                          {st.arrears || 0} Arrears
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>
                        <span className={`badge ${isFeePaid ? 'badge-emerald' : 'badge-gold'}`}>
                          {isFeePaid ? 'Paid' : 'Pending Dues'}
                        </span>
                      </td>
                      <td style={{ padding: 12, display: 'flex', gap: 6 }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                          onClick={() => setSelectedStudent(st)}
                        >
                          View Profile →
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* Staff Mark & Assessment Modal */}
      {showMarkModal && markTargetStudent && (
        <StaffMarkEntryModal
          student={markTargetStudent}
          onClose={() => setShowMarkModal(false)}
          onSaveSuccess={(msg) => triggerToast(msg)}
        />
      )}

    </div>
  );
}
