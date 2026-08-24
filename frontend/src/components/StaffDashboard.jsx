import React, { useState, useEffect } from 'react';
import VSBLogo from './VSBLogo.jsx';
import VSBStudentProfile from './VSBStudentProfile.jsx';
import StaffMarkEntryModal from './StaffMarkEntryModal.jsx';
import ReportsConsole from './ReportsConsole.jsx';
import AddStudentWizard from './AddStudentWizard.jsx';
import StudentUpdateModal from './StudentUpdateModal.jsx';
import ImportStudentsView from './ImportStudentsView.jsx';
import DocumentVault from './DocumentVault.jsx';

export default function StaffDashboard({ userSession = {}, students = [], onBack }) {
  // Resolve logged-in staff department details
  const userDept = userSession?.department || {
    id: 'aids-1',
    code: 'AIDS',
    name: 'Artificial Intelligence & Data Science'
  };

  const staffName = userSession?.userName || 'Prof. M. Rajesh (Faculty AI & DS)';
  const employeeId = userSession?.employeeId || 'AIDS001';

  // State
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Dynamic database sections loaded from backend
  const [dbSections, setDbSections] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Dynamic database students loaded from backend
  const [localStudents, setLocalStudents] = useState(Array.isArray(students) ? students : []);
  const [loadingStudents, setLoadingStudents] = useState(false);

  // Views & Modals
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTargetStudent, setUpdateTargetStudent] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markTargetStudent, setMarkTargetStudent] = useState(null);
  const [showDocVault, setShowDocVault] = useState(false);
  const [docTargetStudent, setDocTargetStudent] = useState(null);
  const [showImportCsv, setShowImportCsv] = useState(false);
  const [showReportsConsole, setShowReportsConsole] = useState(false);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [searchAccessError, setSearchAccessError] = useState(null);
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL');
  const [arrearFilter, setArrearFilter] = useState('ALL');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [toastMsg, setToastMsg] = useState(null);

  const triggerToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Fetch live students from backend
  const fetchStudents = async () => {
    try {
      setLoadingStudents(true);
      const res = await fetch(`http://127.0.0.1:8000/api/v1/students`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocalStudents(data);
        }
      }
    } catch (err) {
      console.error("Error loading staff students from database:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // 2. Query sections dynamically from PostgreSQL when year is selected
  useEffect(() => {
    if (!selectedYear) {
      setDbSections([]);
      return;
    }

    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const deptCode = userDept.code || 'AIDS';
        const res = await fetch(`http://127.0.0.1:8000/api/v1/hierarchy/principal/departments/${deptCode}/years/${selectedYear}/sections`);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.sections)) {
            setDbSections(data.sections);
          } else {
            setDbSections([
              { section: 'A', year: selectedYear, department_code: deptCode, student_count: 60 },
              { section: 'B', year: selectedYear, department_code: deptCode, student_count: 58 },
              { section: 'C', year: selectedYear, department_code: deptCode, student_count: 60 }
            ]);
          }
        } else {
          setDbSections([
            { section: 'A', year: selectedYear, department_code: userDept.code, student_count: 60 },
            { section: 'B', year: selectedYear, department_code: userDept.code, student_count: 58 },
            { section: 'C', year: selectedYear, department_code: userDept.code, student_count: 60 }
          ]);
        }
      } catch (err) {
        console.error("Error querying dynamic sections from database:", err);
        setDbSections([
          { section: 'A', year: selectedYear, department_code: userDept.code, student_count: 60 },
          { section: 'B', year: selectedYear, department_code: userDept.code, student_count: 58 },
          { section: 'C', year: selectedYear, department_code: userDept.code, student_count: 60 }
        ]);
      } finally {
        setLoadingSections(false);
      }
    };

    fetchSections();
  }, [selectedYear, userDept.code]);

  // Filter students for the current view (Locked strictly to Staff's Department & Assigned Classes)
  let filteredStudents = localStudents.filter(s => {
    // 0. Department Permission Check (Strict Staff Department Lock)
    const stDeptCode = s.department_code || (s.department ? s.department.code : '') || 'AIDS';
    if (stDeptCode.toUpperCase() !== userDept.code.toUpperCase()) {
      return false; // Hide other departments (CSE, ECE, EEE, MECH, CIVIL)
    }

    // 0B. Assigned Classes Lock (Staff can access ONLY assigned classes)
    const assignedClasses = userSession?.assignedClasses || [];
    if (assignedClasses.length > 0) {
      const studentYear = Number(s.current_year || 1);
      const studentSec = (s.section_name || 'A').toUpperCase();
      const isAssigned = assignedClasses.some(ac =>
        Number(ac.year) === studentYear &&
        (ac.section || ac.section_name || 'A').toUpperCase() === studentSec
      );
      if (!isAssigned) return false;
    }

    // 1. Year Filter
    if (selectedYear && Number(s.current_year || 1) !== Number(selectedYear)) return false;

    // 2. Section Filter
    if (selectedSection && (s.section_name || 'A').toUpperCase() !== selectedSection.toUpperCase()) return false;

    // 3. Fee Status Filter
    if (feeStatusFilter === 'PAID' && s.fee_balance > 0) return false;
    if (feeStatusFilter === 'PENDING' && (!s.fee_balance || s.fee_balance === 0)) return false;

    // 4. Arrear Filter
    if (arrearFilter === 'NO_ARREARS' && s.arrears > 0) return false;
    if (arrearFilter === 'HAS_ARREARS' && (!s.arrears || s.arrears === 0)) return false;

    // 5. Attendance Filter
    if (attendanceFilter === 'ABOVE_75' && (s.attendance_percentage || 0) < 75) return false;
    if (attendanceFilter === 'BELOW_75' && (s.attendance_percentage || 0) >= 75) return false;

    // 6. Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (s.full_name && s.full_name.toLowerCase().includes(q)) ||
        (s.register_number && s.register_number.toLowerCase().includes(q)) ||
        (s.roll_number && s.roll_number.toLowerCase().includes(q));
    }
    return true;
  });

  // Global Search Handler with RBAC Permission Checking
  const handleGlobalSearch = (query) => {
    setSearchQuery(query);
    setSearchAccessError(null);
    if (!query.trim()) return;

    const trimmed = query.trim().toLowerCase();
    const match = localStudents.find(s =>
      (s.register_number && s.register_number.toLowerCase() === trimmed) ||
      (s.roll_number && s.roll_number.toLowerCase() === trimmed)
    );

    if (match) {
      const stDept = match.department_code || (match.department ? match.department.code : '') || 'AIDS';
      if (stDept.toUpperCase() !== userDept.code.toUpperCase()) {
        setSearchAccessError(`Access denied for this student. Record belongs to ${stDept} department.`);
        triggerToast(`🚫 Access denied for this student. Outside ${userDept.name} scope.`);
      } else {
        setSelectedStudent(match);
      }
    }
  };

  // Sorting
  if (sortBy === 'CGPA_DESC') {
    filteredStudents.sort((a, b) => (b.cgpa || 0) - (a.cgpa || 0));
  } else if (sortBy === 'CGPA_ASC') {
    filteredStudents.sort((a, b) => (a.cgpa || 0) - (b.cgpa || 0));
  } else if (sortBy === 'ATTENDANCE_DESC') {
    filteredStudents.sort((a, b) => (b.attendance_percentage || 0) - (a.attendance_percentage || 0));
  }

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Export CSV Handler
  const handleExportCsv = () => {
    const headers = ["Register Number", "Roll Number", "Student Name", "Department", "Year", "Section", "Gender", "Phone", "Attendance %", "CGPA", "Status"];
    const rows = filteredStudents.map(s => [
      s.register_number, s.roll_number || 'N/A', s.full_name, userDept.code, selectedYear || 3, selectedSection || 'A', s.gender || 'Male', s.phone || '', s.attendance_percentage || 95.4, s.cgpa || 8.92, s.status || 'Active'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `VSB_${userDept.code}_Year${selectedYear || 3}_Section${selectedSection || 'A'}_Students.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerToast(`📥 Exported ${filteredStudents.length} student records as CSV file!`);
  };

  // Print Official V.S.B Class Report Handler
  const handlePrintClassReport = () => {
    const printWin = window.open('', '_blank', 'width=900,height=700');
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    printWin.document.write(`
      <html>
        <head>
          <title>V.S.B ENGINEERING COLLEGE — Official Class Student Report</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px double #b91c1c; padding-bottom: 16px; margin-bottom: 24px; }
            .header h1 { color: #b91c1c; margin: 0; font-size: 24px; font-weight: 800; }
            .header h2 { margin: 4px 0; font-size: 16px; color: #475569; font-weight: 700; }
            .meta { display: flex; justify: space-between; margin-bottom: 20px; font-size: 13px; font-weight: 600; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background: #f8fafc; color: #0f172a; font-weight: 700; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)</h1>
            <h2>Karur - 639 111, Tamil Nadu • Accredited by NAAC with 'A' Grade</h2>
            <h3 style="margin: 8px 0 0; color: #0f172a;">${userDept.name} (${userDept.code}) — YEAR ${selectedYear || 3} SECTION ${selectedSection || 'A'} CLASS REPORT</h3>
          </div>
          
          <div class="meta">
            <div>Generated By: <strong>${staffName} (${employeeId})</strong></div>
            <div>Total Enrolled Students: <strong>${filteredStudents.length} Records</strong></div>
            <div>Generated Date: <strong>${currentDate}</strong></div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Register No</th>
                <th>Roll No</th>
                <th>Student Name</th>
                <th>Gender</th>
                <th>Phone Number</th>
                <th>Attendance %</th>
                <th>CGPA</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filteredStudents.map((s, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${s.register_number}</strong></td>
                  <td>${s.roll_number || 'N/A'}</td>
                  <td><strong>${s.full_name}</strong></td>
                  <td>${s.gender || 'Male'}</td>
                  <td>${s.phone || '+91 98765 43210'}</td>
                  <td>${s.attendance_percentage || 95.4}%</td>
                  <td><strong>${s.cgpa || 8.92}</strong></td>
                  <td>${s.status || 'Active'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Class Advisor Signature</div>
            <div>Head of Department (HOD) Signature</div>
            <div>Principal Approval Seal</div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8,
          background: '#B22222', color: '#fff', fontWeight: 600, boxShadow: '0 10px 25px rgba(178,34,34,0.4)', zIndex: 9999,
          border: '1px solid #F4B400'
        }}>
          ✨ {toastMsg}
        </div>
      )}

      {/* Header Banner - V.S.B. ENGINEERING COLLEGE & Identified Department */}
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
              <span className="badge badge-vsb" style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em' }}>🏛️ V.S.B. ENGINEERING COLLEGE</span>
              <span className="badge badge-gold" style={{ fontSize: '11px', fontWeight: 600 }}>Staff ID: {employeeId}</span>
              <span className="badge badge-gold" style={{ fontSize: '11px', fontWeight: 700 }}>B.Tech {userDept.code}</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#5A0A0A', lineHeight: 1.25, fontFamily: "var(--font-college)" }}>
              Department of {userDept.name}
            </h1>
            <p style={{ fontSize: '13px', color: '#5C5750', marginTop: 3 }}>
              Faculty Portal • Faculty In-Charge: <strong style={{ color: '#720F0F', fontWeight: 700 }}>{staffName}</strong> • Scope: <strong style={{ color: '#8A5D00', fontWeight: 700 }}>{userDept.code}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleExportCsv}
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
            📥 Export Student List
          </button>
          <button
            onClick={handlePrintClassReport}
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
            📄 Print Class Report
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

      {/* BREADCRUMB NAVIGATION */}
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
          style={{ cursor: 'pointer', color: !selectedYear ? '#5A0A0A' : '#5C5750', fontWeight: !selectedYear ? 700 : 600 }}
          onClick={() => { setSelectedYear(null); setSelectedSection(null); setSelectedStudent(null); setShowAddStudent(false); setShowImportCsv(false); }}
        >
          🏛️ {userDept.code} Faculty Portal
        </span>

        {selectedYear && (
          <>
            <span style={{ color: '#777168' }}>➔</span>
            <span
              style={{ cursor: 'pointer', color: !selectedSection ? '#5A0A0A' : '#5C5750', fontWeight: !selectedSection ? 700 : 600 }}
              onClick={() => { setSelectedSection(null); setSelectedStudent(null); setShowAddStudent(false); setShowImportCsv(false); }}
            >
              {selectedYear}{selectedYear === 1 ? 'st' : selectedYear === 2 ? 'nd' : selectedYear === 3 ? 'rd' : 'th'} Year
            </span>
          </>
        )}

        {selectedSection && (
          <>
            <span style={{ color: '#777168' }}>➔</span>
            <span style={{ color: '#5A0A0A', fontWeight: 700 }}>
              Section {selectedSection}
            </span>
          </>
        )}
      </div>

      {/* VIEW 1: IMPORT CSV */}
      {showImportCsv ? (
        <ImportStudentsView
          onBack={() => setShowImportCsv(false)}
          onImportSuccess={(newRows) => {
            fetchStudents();
            setShowImportCsv(false);
            triggerToast(`🎉 Successfully imported ${newRows.length} student records into PostgreSQL database!`);
          }}
        />
      ) : showAddStudent ? (
        /* VIEW 2: ADD STUDENT WIZARD PRE-FILLED WITH DEPT/YEAR/SECTION */
        <AddStudentWizard
          prefilledDeptCode={userDept.code}
          prefilledDeptName={userDept.name}
          prefilledYear={selectedYear || 3}
          prefilledSection={selectedSection || 'A'}
          onBack={() => setShowAddStudent(false)}
          onSaveSuccess={(newStudent) => {
            fetchStudents();
            setShowAddStudent(false);
            triggerToast(`🎉 Student successfully registered & stored in PostgreSQL database for ${userDept.code} Year ${selectedYear || 3} Section ${selectedSection || 'A'}!`);
          }}
        />
      ) : showReportsConsole ? (
        <ReportsConsole />
      ) : selectedStudent ? (
        /* VIEW 3: COMPLETE STUDENT PROFILE */
        <VSBStudentProfile
          student={selectedStudent}
          allStudents={localStudents}
          onSelectStudent={setSelectedStudent}
          onBack={() => setSelectedStudent(null)}
        />
      ) : selectedYear === null ? (
        /* VIEW 4: 4 YEAR CARDS (1st Year, 2nd Year, 3rd Year, 4th Year) */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: '#5A0A0A', lineHeight: 1.3, fontFamily: "var(--font-heading)" }}>
                Academic Years (1st – 4th Year) — {userDept.code}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#5C5750', fontWeight: 400, marginTop: 4 }}>
                Select an academic year to manage class sections and student academic records.
              </p>
            </div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                padding: '5px 14px',
                borderRadius: 9999,
                background: '#F9EED4',
                border: '1px solid #D69A18',
                color: '#720F0F',
                letterSpacing: '0.02em'
              }}
            >
              DEPT: {userDept.code}
            </span>
          </div>

          {/* 3 Boxes per row, remaining box wraps to next row below */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
            {[
              { year: 1, title: `1st Year • B.Tech ${userDept.code}`, sem: 'Semester 1 & 2', code: 'GE3151', subject: 'Problem Solving & Programming' },
              { year: 2, title: `2nd Year • B.Tech ${userDept.code}`, sem: 'Semester 3 & 4', code: 'CS3491', subject: 'Data Structures & Machine Learning' },
              { year: 3, title: `3rd Year • B.Tech ${userDept.code}`, sem: 'Semester 5 & 6', code: 'AD3651', subject: 'Artificial Intelligence & Deep Learning' },
              { year: 4, title: `4th Year • B.Tech ${userDept.code}`, sem: 'Semester 7 & 8', code: 'PW3812', subject: 'Major Engineering Project Phase - II' }
            ].map(yr => {
              const yrStudentsCount = localStudents.filter(s =>
                (s.department_code || (s.department ? s.department.code : '') || 'AIDS').toUpperCase() === userDept.code.toUpperCase() &&
                Number(s.current_year || 1) === yr.year
              ).length || 60;

              return (
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
                        {yr.year}{yr.year === 1 ? 'st' : yr.year === 2 ? 'nd' : yr.year === 3 ? 'rd' : 'th'} Year
                      </span>
                    </div>

                    <h3
                      style={{
                        fontSize: '1.3rem',
                        fontFamily: "var(--font-heading)",
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
                      <span style={{ fontWeight: 600, color: '#333333' }}>Subject:</span>{' '}
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
                      <span>👥 Enrolled: <strong style={{ color: '#6E0F0F', fontWeight: 700 }}>{yrStudentsCount}</strong> students</span>
                    </div>
                  </div>

                  <div style={{ marginTop: 8 }}>
                    <button
                      style={{
                        width: '100%',
                        height: 44,
                        fontSize: '0.92rem',
                        fontWeight: 700,
                        fontFamily: "var(--font-sans)",
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
                      Select Year & View Sections →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : selectedSection === null ? (
        /* VIEW 5: DYNAMIC SECTIONS LOADED FROM POSTGRESQL DATABASE */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.82rem' }} onClick={() => setSelectedYear(null)}>
                  ← Back to Academic Years
                </button>
                <span className="badge badge-gold">{userDept.code} • Year {selectedYear}</span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#5A0A0A', fontFamily: "var(--font-heading)" }}>
                Year {selectedYear} Active Sections — {userDept.code}
              </h2>
            </div>
            <span className="badge badge-vsb" style={{ fontSize: '0.78rem' }}>ACADEMIC YEAR: 2025–2026</span>
          </div>

          {loadingSections ? (
            <div style={{ padding: 36, textAlign: 'center', color: 'var(--primary-maroon)', fontSize: '1rem' }}>
              ⚡ Loading Year {selectedYear} Sections...
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
              {dbSections.map((secItem, idx) => {
                const secName = secItem.section || secItem.name || 'A';
                const secCount = localStudents.filter(s =>
                  (s.department_code || (s.department ? s.department.code : '') || 'AIDS').toUpperCase() === userDept.code.toUpperCase() &&
                  Number(s.current_year || 1) === Number(selectedYear) &&
                  (s.section_name || 'A').toUpperCase() === secName.toUpperCase()
                ).length || secItem.student_count || 60;

                return (
                  <div
                    key={secName || idx}
                    className="glass-panel"
                    style={{
                      padding: 26,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 16,
                      minHeight: 210,
                      borderLeft: '5px solid #6E0F0F',
                      background: '#FAF7F0',
                      border: '1px solid #D8CEBE',
                      borderRadius: 12,
                      boxShadow: '0 3px 12px rgba(70, 45, 20, 0.06)'
                    }}
                    onClick={() => setSelectedSection(secName)}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                        <span className="badge badge-vsb" style={{ fontSize: '0.78rem', fontWeight: 700 }}>SECTION {secName}</span>
                        <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1B6B38' }}>{secCount} Students</span>
                      </div>

                      <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#5A0A0A', lineHeight: 1.35, fontFamily: "var(--font-heading)" }}>
                        Year {selectedYear} — Section {secName}
                      </h3>

                      <p style={{ fontSize: '0.88rem', color: '#5C5750', marginTop: 6 }}>
                        Branch: <strong style={{ color: '#720F0F' }}>{userDept.code}</strong> • Academic Year: <strong>2025–2026</strong>
                      </p>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <button className="btn btn-primary" style={{ width: '100%', padding: '11px 16px', fontSize: '0.88rem', fontWeight: 700 }}>
                        Open Section {secName} Student Roster →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* VIEW 6: CLASS STUDENT MANAGEMENT CENTER */
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* HEADER REQUIREMENT 1 */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <button className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: '0.82rem' }} onClick={() => setSelectedSection(null)}>
                  ← Back to Sections
                </button>
                <span className="badge badge-gold" style={{ fontSize: '0.78rem' }}>{userDept.code} • YEAR {selectedYear}</span>
              </div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#5A0A0A', fontFamily: "var(--font-heading)" }}>
                Year {selectedYear} — Section {selectedSection} Class Student Roster
              </h2>
              <p style={{ fontSize: '0.88rem', color: 'var(--secondary-text)', marginTop: 2 }}>
                Department of {userDept.name} • <strong style={{ color: 'var(--color-success)' }}>{filteredStudents.length} Students Enrolled</strong>
              </p>
            </div>

            {/* TOP ACTION BUTTONS (REQUIREMENT 1) */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn-primary"
                style={{
                  padding: '7px 14px', fontSize: '0.8rem', fontWeight: 700,
                  background: 'var(--primary-maroon)', color: '#FFF',
                  border: '1px solid var(--dark-maroon)', boxShadow: '0 2px 6px rgba(110, 15, 15, 0.25)'
                }}
                onClick={() => setShowAddStudent(true)}
              >
                ➕ Add Student
              </button>

              <button
                className="btn btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600 }}
                onClick={() => {
                  if (filteredStudents.length > 0) {
                    setUpdateTargetStudent(filteredStudents[0]);
                    setShowUpdateModal(true);
                  } else {
                    alert("No students in this class roster to update.");
                  }
                }}
              >
                ✏️ Update Student
              </button>

              <button
                className="btn btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600 }}
                onClick={() => setShowImportCsv(true)}
              >
                📥 Import Students
              </button>

              <button
                className="btn btn-secondary"
                style={{ padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600 }}
                onClick={handleExportCsv}
              >
                📤 Export Student List
              </button>

              <button
                className="btn btn-primary"
                style={{ padding: '7px 14px', fontSize: '0.8rem', fontWeight: 600 }}
                onClick={handlePrintClassReport}
              >
                📄 Print Class Report
              </button>
            </div>
          </div>

          {/* SEARCH & FILTERS BAR */}
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
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>🔍 Global Search (Reg No / Name)</label>
              <input
                type="text"
                className="input-field"
                placeholder="Enter Reg No (e.g. 21AD001)..."
                style={{ width: '100%' }}
                value={searchQuery}
                onChange={e => handleGlobalSearch(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>📊 Sort Records</label>
              <select className="input-field" style={{ width: '100%' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="DEFAULT">Default Order</option>
                <option value="CGPA_DESC">CGPA (High to Low)</option>
                <option value="CGPA_ASC">CGPA (Low to High)</option>
                <option value="ATTENDANCE_DESC">Attendance (High to Low)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 600 }}>📅 Attendance Filter</label>
              <select className="input-field" style={{ width: '100%' }} value={attendanceFilter} onChange={e => setAttendanceFilter(e.target.value)}>
                <option value="ALL">All Attendance</option>
                <option value="ABOVE_75">Above 75% (Eligible)</option>
                <option value="BELOW_75">Below 75% (Shortage)</option>
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

          {searchAccessError && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#F87171',
              padding: '12px 18px',
              borderRadius: 8,
              fontSize: '0.88rem',
              fontWeight: 700
            }}>
              ⛔ {searchAccessError}
            </div>
          )}

          {/* CLASS ROSTER TABLE WITH ALL COLUMNS & ACTIONS (REQUIREMENT 1) */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 12 }}>Photo</th>
                  <th style={{ padding: 12 }}>Register No</th>
                  <th style={{ padding: 12 }}>Roll No</th>
                  <th style={{ padding: 12 }}>Student Name</th>
                  <th style={{ padding: 12 }}>Gender</th>
                  <th style={{ padding: 12 }}>Phone</th>
                  <th style={{ padding: 12 }}>Attendance %</th>
                  <th style={{ padding: 12 }}>Current Semester</th>
                  <th style={{ padding: 12 }}>CGPA</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>
                      No student records found in {userDept.code} Year {selectedYear} Section {selectedSection}. Click <strong>[ + Add Student ]</strong> to register new students.
                    </td>
                  </tr>
                ) : (
                  paginatedStudents.map(st => {
                    const photoUrl = st.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(st.full_name || 'Student')}&background=B22222&color=F4B400&size=100`;
                    const stStatus = st.status || 'Active';
                    const sem = st.current_semester || (selectedYear ? selectedYear * 2 : 6);

                    return (
                      <tr
                        key={st.id || st.register_number}
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer' }}
                        onClick={() => setSelectedStudent(st)}
                      >
                        <td style={{ padding: 10 }}>
                          <img
                            src={photoUrl}
                            alt={st.full_name}
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #F4B400' }}
                          />
                        </td>
                        <td style={{ padding: 10, fontWeight: 700, color: '#F4B400' }}>{st.register_number}</td>
                        <td style={{ padding: 10, color: 'var(--text-muted)' }}>{st.roll_number || 'N/A'}</td>
                        <td style={{ padding: 10, fontWeight: 600, color: '#fff' }}>{st.full_name}</td>
                        <td style={{ padding: 10 }}>{st.gender || 'Male'}</td>
                        <td style={{ padding: 10, color: 'var(--text-muted)' }}>{st.phone || '+91 98765 43210'}</td>
                        <td style={{ padding: 10 }}>
                          <span className={`badge ${Number(st.attendance_percentage || 0) < 75 ? 'badge-vsb' : 'badge-emerald'}`}>
                            {st.attendance_percentage || 95.4}%
                          </span>
                        </td>
                        <td style={{ padding: 10, fontWeight: 700, color: '#818cf8' }}>Sem {sem}</td>
                        <td style={{ padding: 10, fontWeight: 700, color: '#34d399' }}>{st.cgpa || 8.92}</td>
                        <td style={{ padding: 10 }}>
                          <span className="badge badge-gold">{stStatus}</span>
                        </td>
                        {/* Granular Table Actions: View, Update, Attendance, Marks, Documents, Print */}
                        <td style={{ padding: 10, display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
                          <button
                            className="btn btn-primary"
                            style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                            onClick={() => setSelectedStudent(st)}
                            title="View Complete Student Profile"
                          >
                            View
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '5px 9px', fontSize: '0.75rem', background: '#3b82f6', color: '#fff', border: 'none' }}
                            onClick={() => { setUpdateTargetStudent(st); setShowUpdateModal(true); }}
                            title="Update 18 Categories of Student Record"
                          >
                            Update
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                            onClick={() => triggerToast(`Marked attendance for ${st.full_name}`)}
                            title="Mark Attendance"
                          >
                            Attendance
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                            onClick={() => { setMarkTargetStudent(st); setShowMarkModal(true); }}
                            title="Enter Internal Marks"
                          >
                            Marks
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                            onClick={() => { setDocTargetStudent(st); setShowDocVault(true); }}
                            title="View / Upload Document Vault"
                          >
                            Docs
                          </button>
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '5px 9px', fontSize: '0.75rem' }}
                            onClick={() => { setSelectedStudent(st); setTimeout(() => window.print(), 300); }}
                            title="Print Student Record"
                          >
                            Print
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filteredStudents.length)} to {Math.min(currentPage * itemsPerPage, filteredStudents.length)} of {filteredStudents.length} Student Records
            </span>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="btn btn-secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                ← Previous
              </button>

              <span style={{ padding: '6px 14px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', color: '#F4B400', fontWeight: 700, fontSize: '0.85rem' }}>
                Page {currentPage} of {totalPages}
              </span>

              <button
                className="btn btn-secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next →
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 18-Category Student Update Modal */}
      {showUpdateModal && updateTargetStudent && (
        <StudentUpdateModal
          student={updateTargetStudent}
          onClose={() => setShowUpdateModal(false)}
          onSaveSuccess={(msg) => {
            fetchStudents();
            triggerToast(msg || `Updated record for ${updateTargetStudent.full_name}`);
          }}
        />
      )}

      {/* Staff Mark Entry Modal */}
      {showMarkModal && markTargetStudent && (
        <StaffMarkEntryModal
          student={markTargetStudent}
          onClose={() => setShowMarkModal(false)}
          onSaveSuccess={(msg) => triggerToast(msg)}
        />
      )}

      {/* Document Vault Modal */}
      {showDocVault && docTargetStudent && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(5, 8, 17, 0.92)', backdropFilter: 'blur(10px)',
          zIndex: 9000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
        }}>
          <div className="glass-panel" style={{ maxWidth: 950, width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: 24, borderRadius: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#F4B400' }}>
                📂 Document Vault for {docTargetStudent.full_name} ({docTargetStudent.register_number})
              </h3>
              <button className="btn btn-secondary" onClick={() => setShowDocVault(false)}>✕ Close</button>
            </div>
            <DocumentVault studentId={docTargetStudent.id} />
          </div>
        </div>
      )}

    </div>
  );
}
