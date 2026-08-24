import React, { useState } from 'react';
import VSBLogo from './VSBLogo.jsx';
import VSBStudentProfile from './VSBStudentProfile.jsx';
import VSBDepartmentDetail from './VSBDepartmentDetail.jsx';


export default function PrincipalDashboard({ students = [], departments = [], onBack }) {
  // Navigation State: null (College Level) -> selectedDept -> selectedYear -> selectedSection -> selectedStudent
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('DEFAULT'); // 'CGPA_DESC' | 'CGPA_ASC' | 'ATTENDANCE_DESC' | 'ATTENDANCE_ASC'
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');
  const [arrearFilter, setArrearFilter] = useState('ALL');
  const [toastMsg, setToastMsg] = useState(null);

  const safeDepartments = (Array.isArray(departments) && departments.length >= 11) ? departments : [
    { id: 'dept-it', code: 'IT', name: 'Information Technology', count: 320, hod: 'Dr. N. Priya', sections: 8, passRate: '96.8%', placement: '95.0%' },
    { id: 'dept-cse', code: 'CSE', name: 'Computer Science and Engineering', count: 720, hod: 'Dr. A. Ramesh', sections: 18, passRate: '97.4%', placement: '96.2%' },
    { id: 'dept-aids', code: 'AIDS', name: 'Artificial Intelligence and Data Science', count: 480, hod: 'Dr. K. Senthil Kumar', sections: 12, passRate: '97.2%', placement: '96.5%' },
    { id: 'dept-aiml', code: 'AIML', name: 'Artificial Intelligence and Machine Learning', count: 360, hod: 'Dr. R. Vignesh', sections: 8, passRate: '96.5%', placement: '95.8%' },
    { id: 'dept-csbs', code: 'CSBS', name: 'Computer Science and Business System', count: 240, hod: 'Dr. S. Meenakshi', sections: 6, passRate: '95.9%', placement: '94.5%' },
    { id: 'dept-cce', code: 'CCE', name: 'Computer and Communication Engineering', count: 240, hod: 'Dr. T. Anand', sections: 6, passRate: '95.2%', placement: '93.8%' },
    { id: 'dept-ece', code: 'ECE', name: 'Electronics and Communication Engineering', count: 640, hod: 'Dr. P. Murugan', sections: 16, passRate: '95.8%', placement: '94.1%' },
    { id: 'dept-eee', code: 'EEE', name: 'Electrical and Electronics Engineering', count: 420, hod: 'Dr. K. Balaji', sections: 10, passRate: '94.6%', placement: '91.8%' },
    { id: 'dept-mech', code: 'MECH', name: 'Mechanical Engineering', count: 380, hod: 'Dr. S. Karthik', sections: 10, passRate: '93.5%', placement: '90.4%' },
    { id: 'dept-chem', code: 'CHEM', name: 'Chemical Engineering', count: 200, hod: 'Dr. V. Lakshmi', sections: 6, passRate: '93.0%', placement: '89.2%' },
    { id: 'dept-civil', code: 'CIVIL', name: 'Civil Engineering', count: 200, hod: 'Dr. M. Sundaram', sections: 6, passRate: '92.1%', placement: '88.5%' }
  ];

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filter students for section list
  let sectionStudents = students.filter(s => {
    if (selectedDept && s.department_name && !s.department_name.toLowerCase().includes(selectedDept.code.toLowerCase())) {
      return false;
    }
    if (selectedYear && (s.current_year || 1) !== selectedYear) return false;
    if (selectedSection && (s.section_name || 'A') !== selectedSection) return false;

    if (feeStatusFilter === 'PAID' && s.fee_balance > 0) return false;
    if (feeStatusFilter === 'PENDING' && (!s.fee_balance || s.fee_balance === 0)) return false;

    if (arrearFilter === 'NO_ARREARS' && s.arrears > 0) return false;
    if (arrearFilter === 'HAS_ARREARS' && (!s.arrears || s.arrears === 0)) return false;

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
    sectionStudents.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
  } else if (sortBy === 'CGPA_ASC') {
    sectionStudents.sort((a, b) => (a.cgpa || 0) - (b.cgpa || 0));
  } else if (sortBy === 'ATTENDANCE_DESC') {
    sectionStudents.sort((a, b) => (b.attendance_percentage || 0) - (a.attendance_percentage || 0));
  } else if (sortBy === 'ATTENDANCE_ASC') {
    sectionStudents.sort((a, b) => (a.attendance_percentage || 0) - (b.attendance_percentage || 0));
  }

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
          <VSBLogo size={48} showTitle={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span className="badge badge-vsb" style={{ fontSize: '12px', fontWeight: 600 }}>🏛️ PRINCIPAL EXECUTIVE PORTAL</span>
              <span className="badge badge-gold" style={{ fontSize: '12px', fontWeight: 600 }}>UNRESTRICTED INSTITUTIONAL SCOPE</span>
            </div>
            <h1 style={{ fontSize: '23px', fontWeight: 700, color: '#5A0A0A', lineHeight: 1.25 }}>
              Dr. V.S.B Principal — Executive Analytics Console
            </h1>
            <p style={{ fontSize: '13px', color: '#5C5750', marginTop: 3 }}>
              V.S.B. Engineering College (Karur) • Principal Office ID: <strong style={{ color: '#D69A18', fontWeight: 600 }}>PRIN001</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={() => triggerToast('📊 Exported College-Wide Master Data to Excel!')}
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
            onClick={() => triggerToast('📄 Generating Principal Executive PDF Report...')}
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
            📄 Print Executive Report
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

      {/* DRILLDOWN BREADCRUMB NAVIGATION TRAIL */}
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
          style={{ cursor: 'pointer', color: !selectedDept ? '#5A0A0A' : '#5C5750', fontWeight: !selectedDept ? 700 : 500 }}
          onClick={() => { setSelectedDept(null); setSelectedYear(null); setSelectedSection(null); setSelectedStudent(null); }}
        >
          🏛️ Institutional Dashboard (All 11 Depts)
        </span>

        {selectedDept && (
          <>
            <span style={{ color: '#777168' }}>➔</span>
            <span
              style={{ cursor: 'pointer', color: !selectedYear ? '#5A0A0A' : '#5C5750', fontWeight: !selectedYear ? 700 : 500 }}
              onClick={() => { setSelectedYear(null); setSelectedSection(null); setSelectedStudent(null); }}
            >
              Dept: {selectedDept.name} ({selectedDept.code})
            </span>
          </>
        )}

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

      {/* TOP 14 PRINCIPAL EXECUTIVE KPI CARDS — ONLY ON ROOT OVERVIEW */}
      {!selectedDept && !selectedYear && !selectedSection && !selectedStudent && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #D69A18', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>1. Total Departments</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#5A0A0A', margin: '4px 0' }}>11 UG Branches</div>
            <span style={{ fontSize: '11px', color: '#24733E', fontWeight: 600 }}>IT, CSE, AIDS, AIML...</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #720F0F', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>2. Total Students</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#720F0F', margin: '4px 0' }}>3,680</div>
            <span style={{ fontSize: '11px', color: '#777168', fontWeight: 500 }}>Enrolled Students</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #24733E', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>3. Faculty & Staff</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#24733E', margin: '4px 0' }}>218 Members</div>
            <span style={{ fontSize: '11px', color: '#24733E', fontWeight: 600 }}>Professors & Labs</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #A96E00', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>4. Total HODs</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#A96E00', margin: '4px 0' }}>11 HODs</div>
            <span style={{ fontSize: '11px', color: '#A96E00', fontWeight: 600 }}>Department Heads</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #24733E', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>5. Attendance Rate</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#24733E', margin: '4px 0' }}>95.8%</div>
            <span style={{ fontSize: '11px', color: '#24733E', fontWeight: 600 }}>Daily Verified</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #A96E00', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>6. Placement Rate</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#A96E00', margin: '4px 0' }}>94.2%</div>
            <span style={{ fontSize: '11px', color: '#A96E00', fontWeight: 600 }}>Highest 28.0 LPA</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #24733E', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>7. Pass Percentage</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#24733E', margin: '4px 0' }}>96.4%</div>
            <span style={{ fontSize: '11px', color: '#24733E', fontWeight: 600 }}>Zone Rank 2</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #720F0F', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>8. Total College Fees</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#720F0F', margin: '4px 0' }}>₹ 18.50 Cr</div>
            <span style={{ fontSize: '11px', color: '#777168', fontWeight: 500 }}>Tuition & Exams</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #D69A18', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>9. Hostel Fees</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#5A0A0A', margin: '4px 0' }}>₹ 4.20 Cr</div>
            <span style={{ fontSize: '11px', color: '#777168', fontWeight: 500 }}>850 Residents</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #D69A18', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>10. Bus Fees</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#5A0A0A', margin: '4px 0' }}>₹ 2.80 Cr</div>
            <span style={{ fontSize: '11px', color: '#777168', fontWeight: 500 }}>32 Routes</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #A52A24', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>11. Pending Fees</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#A52A24', margin: '4px 0' }}>₹ 45.20 L</div>
            <span style={{ fontSize: '11px', color: '#A52A24', fontWeight: 600 }}>Due Defaulters</span>
          </div>

          <div style={{ background: '#FAF7F0', border: '1px solid #D8CEBE', borderLeft: '4px solid #A52A24', borderRadius: 11, padding: 18, boxShadow: '0 2px 8px rgba(70,45,20,0.08)' }}>
            <span style={{ fontSize: '12px', color: '#5C5750', fontWeight: 600, display: 'block' }}>12. Arrear Statistics</span>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#A52A24', margin: '4px 0' }}>3.2%</div>
            <span style={{ fontSize: '11px', color: '#777168', fontWeight: 500 }}>91 Arrear Students</span>
          </div>
        </div>
      )}

      {/* VIEW A: IF STUDENT SELECTED -> COMPLETE 360 PROFILE */}
      {selectedStudent ? (
        <VSBStudentProfile
          student={selectedStudent}
          allStudents={students}
          onSelectStudent={setSelectedStudent}
          onBack={() => setSelectedStudent(null)}
        />
      ) : selectedDept === null ? (
        /* STEP 1: 11 DEPARTMENT CARDS GRID MATCHING VSB ERP THEME */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#5A0A0A', lineHeight: 1.3 }}>
                Academic Departments & Specializations (11 UG Branches)
              </h2>
              <p style={{ fontSize: '13.5px', color: '#5C5750', marginTop: 4 }}>
                Select a department to access executive analytics, curriculum data, and student records.
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
              INSTITUTIONAL DIRECT ACCESS
            </span>
          </div>

          {/* 11 Department Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {safeDepartments.map(dept => (
              <div
                key={dept.code}
                className="glass-panel"
                style={{
                  padding: 24,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 16,
                  background: '#FAF7F0',
                  borderRadius: 11,
                  border: '1px solid #D8CEBE',
                  borderLeft: '4px solid #D69A18',
                  boxShadow: '0 2px 8px rgba(70, 45, 20, 0.08)',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedDept(dept)}
              >
                <div>
                  {/* Top row: Pill badge & Building Icon */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: 9999,
                      background: '#F9EED4',
                      color: '#720F0F',
                      border: '1px solid #D69A18',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {dept.code}
                    </span>

                    <span style={{ fontSize: '20px' }}>🏛️</span>
                  </div>

                  {/* Department Title */}
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#5A0A0A', lineHeight: 1.3, marginBottom: 8 }}>
                    {dept.name}
                  </h3>

                  {/* Student & Faculty Counts */}
                  <div style={{ display: 'flex', gap: 14, fontSize: '13px', color: '#5C5750', marginBottom: 8 }}>
                    <span>👨‍🎓 <strong style={{ color: '#2B2926', fontWeight: 600 }}>{dept.count || dept.student_count ? `${dept.count || dept.student_count} Students` : (dept.code === 'AIDS' ? '480 Students' : '240 Students')}</strong></span>
                    <span>👩‍🏫 <strong style={{ color: '#2B2926', fontWeight: 600 }}>{dept.faculty_count || (dept.code === 'AIDS' ? '20 Faculty' : '16 Faculty')}</strong></span>
                  </div>

                  <p style={{ fontSize: '13px', color: '#5C5750', lineHeight: 1.45 }}>
                    Official department info, accreditation, syllabus & live ERP statistics.
                  </p>
                </div>

                {/* Maroon Action Link */}
                <div style={{ marginTop: 8 }}>
                  <button
                    className="btn btn-primary"
                    style={{
                      width: '100%',
                      height: 42,
                      fontSize: '13px',
                      fontWeight: 600,
                      borderRadius: 6,
                      background: '#720F0F',
                      color: '#FFFFFF'
                    }}
                  >
                    View Department →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : selectedYear === null ? (
        /* STEP 2: DEDICATED DEPARTMENT DETAIL PAGE INSIDE ERP */
        <VSBDepartmentDetail
          department={selectedDept}
          userSession={{ role: 'PRINCIPAL' }}
          onBack={() => setSelectedDept(null)}
          onNavigateToRoster={(code, yr) => {
            setSelectedYear(yr || 1);
          }}
        />
      ) : selectedSection === null ? (

        /* STEP 2: 4 GOLD-BORDERED YEAR CARDS FOR SELECTED DEPT */
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
                  onClick={() => setSelectedDept(null)}
                >
                  ← All Departments
                </button>
                <span className="badge badge-gold" style={{ fontSize: '12px', fontWeight: 600 }}>{selectedDept.name} ({selectedDept.code})</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#5A0A0A', lineHeight: 1.3 }}>
                {selectedDept.code} Academic Years (4 Years)
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
              INSTITUTIONAL CONTROL
            </span>
          </div>

          {/* 3 Boxes per row, remaining box wraps to next row below */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {[
              { year: 1, title: `1st Year — ${selectedDept.code}`, sem: 'Semester 1 & 2', code: 'BATCH 24-28', count: Math.round((selectedDept.count || 240) * 0.28) },
              { year: 2, title: `2nd Year — ${selectedDept.code}`, sem: 'Semester 3 & 4', code: 'BATCH 23-27', count: Math.round((selectedDept.count || 240) * 0.26) },
              { year: 3, title: `3rd Year — ${selectedDept.code}`, sem: 'Semester 5 & 6', code: 'BATCH 22-26', count: Math.round((selectedDept.count || 240) * 0.24) },
              { year: 4, title: `4th Year — ${selectedDept.code}`, sem: 'Semester 7 & 8', code: 'BATCH 21-25', count: Math.round((selectedDept.count || 240) * 0.22) }
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
                      {yr.count} Students
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
                    <span style={{ fontWeight: 600, color: '#333333' }}>Department:</span>{' '}
                    <strong style={{ color: '#1B1B1B', fontWeight: 600 }}>{selectedDept.name}</strong>
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
                    <span>🏫 Sections A, B & C</span>
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
                    Open Year Sections →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : selectedSection === null ? (
        /* STEP 3: 3 GOLD-BORDERED SECTION CARDS */
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
                  ← All Years
                </button>
                <span className="badge badge-gold" style={{ fontSize: '12px', fontWeight: 600 }}>{selectedDept.code} • Year {selectedYear}</span>
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
              INSTITUTIONAL CONTROL
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
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#24733E' }}>60 Students</span>
                  </div>

                  <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#5A0A0A', lineHeight: 1.3 }}>
                    {selectedYear === 1 ? 'I' : selectedYear === 2 ? 'II' : selectedYear === 3 ? 'III' : 'IV'} {selectedDept.code} – Section {sec}
                  </h3>

                  <p style={{ fontSize: '13.5px', color: '#5C5750', marginTop: 6 }}>
                    Class Advisor: <strong style={{ color: '#2B2926', fontWeight: 600 }}>Prof. M. Rajesh</strong>
                  </p>
                  <p style={{ fontSize: '12.5px', color: '#777168', marginTop: 2 }}>
                    Semester {selectedYear * 2} • Section {sec} • Branch: {selectedDept.code}
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
                    Open Section Roster →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* STEP 4: STUDENT ROSTER FOR SELECTED SECTION WITH ALL INTERACTIVE CONTROLS */
        <div className="glass-panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.8rem' }} onClick={() => setSelectedSection(null)}>
                  ← Change Section
                </button>
                <span className="badge badge-gold">{selectedDept.code} • Year {selectedYear} • Section {selectedSection}</span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                {selectedDept.name} — Year {selectedYear} (Section {selectedSection}) Roster ({sectionStudents.length} Students)
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

          {/* STUDENT ROSTER TABLE WITH PHOTO AVATARS */}
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
                {sectionStudents.map(st => {
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
                      <td style={{ padding: 12 }}>
                        <button
                          className="btn btn-primary"
                          style={{ padding: '6px 14px', fontSize: '0.78rem' }}
                          onClick={() => setSelectedStudent(st)}
                        >
                          Complete Profile →
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

    </div>
  );
}
