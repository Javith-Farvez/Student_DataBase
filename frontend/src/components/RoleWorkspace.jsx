import React, { useState } from 'react';
import VSBLogo from './VSBLogo.jsx';
import VSBStudentProfile from './VSBStudentProfile.jsx';
import VSBStudentMasterModule from './VSBStudentMasterModule.jsx';
import VSBAcademicModule from './VSBAcademicModule.jsx';
import SSLCHSCModule from './SSLCHSCModule.jsx';
import StaffMarkEntryModal from './StaffMarkEntryModal.jsx';
import ImportStudentsView from './ImportStudentsView.jsx';
import FaceRecognitionModal from './FaceRecognitionModal.jsx';
import AddStudentWizard from './AddStudentWizard.jsx';
import AttendanceConsole from './AttendanceConsole.jsx';
import AdminConsole from './AdminConsole.jsx';
import UserManagementModule from './UserManagementModule.jsx';
import StaffDashboard from './StaffDashboard.jsx';
import HodDashboard from './HodDashboard.jsx';
import StudentPortalView from './StudentPortalView.jsx';

export default function RoleWorkspace({ userSession = {}, departments = [], students = [], onSignOut }) {
  const role = userSession?.role || 'ADMIN';

  // STUDENT ROLE HAS DEDICATED WORKSPACE PORTAL
  if (role === 'STUDENT') {
    return <StudentPortalView studentData={userSession} onSignOut={onSignOut} />;
  }

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showMarkModal, setShowMarkModal] = useState(false);
  const [markStudentTarget, setMarkStudentTarget] = useState(null);

  const [currentSubView, setCurrentSubView] = useState(
    role === 'HOD' ? 'hod-dashboard' :
      role === 'STAFF' ? 'staff-dashboard' :
        'student-master'
  );

  const [showFaceAiModal, setShowFaceAiModal] = useState(false);
  const [showAdminConsole, setShowAdminConsole] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const OFFICIAL_11_LIST = [
    { id: 'dept-it', code: 'IT', name: 'Information Technology', count: 180, faculty_count: 22 },
    { id: 'dept-cse', code: 'CSE', name: 'Computer Science and Engineering', count: 240, faculty_count: 28 },
    { id: 'dept-aids', code: 'AIDS', name: 'Artificial Intelligence and Data Science', count: 480, faculty_count: 20 },
    { id: 'dept-aiml', code: 'AIML', name: 'Artificial Intelligence and Machine Learning', count: 120, faculty_count: 16 },
    { id: 'dept-csbs', code: 'CSBS', name: 'Computer Science and Business System', count: 60, faculty_count: 15 },
    { id: 'dept-cce', code: 'CCE', name: 'Computer and Communication Engineering', count: 60, faculty_count: 15 },
    { id: 'dept-ece', code: 'ECE', name: 'Electronics and Communication Engineering', count: 240, faculty_count: 26 },
    { id: 'dept-eee', code: 'EEE', name: 'Electrical and Electronics Engineering', count: 180, faculty_count: 20 },
    { id: 'dept-mech', code: 'MECH', name: 'Mechanical Engineering', count: 180, faculty_count: 22 },
    { id: 'dept-chem', code: 'CHEM', name: 'Chemical Engineering', count: 60, faculty_count: 14 },
    { id: 'dept-civil', code: 'CIVIL', name: 'Civil Engineering', count: 60, faculty_count: 14 }
  ];

  const safeDepartments = (Array.isArray(departments) && departments.length >= 11)
    ? departments
    : OFFICIAL_11_LIST;


  const [localStudents, setLocalStudents] = useState(Array.isArray(students) ? students : []);

  const userDept = userSession?.department || safeDepartments[0];
  const userName = userSession?.userName || 'Dr. V.S.B Administrator';
  const employeeId = userSession?.employeeId || 'ADMIN001';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const filteredStudents = localStudents.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (s.full_name && s.full_name.toLowerCase().includes(q)) ||
      (s.register_number && s.register_number.toLowerCase().includes(q)) ||
      (s.roll_number && s.roll_number.toLowerCase().includes(q));
  });

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#EDE7DC' }}>

      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8,
          background: '#720F0F', color: '#FFFFFF', fontWeight: 600, boxShadow: '0 4px 16px rgba(114,15,15,0.2)', zIndex: 5000,
          border: '1px solid #D69A18'
        }}>
          ✨ {toastMsg}
        </div>
      )}

      {/* Navigation Header – Exact Reference VSB ERP Theme */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        minHeight: 74,
        padding: '12px 24px',
        background: '#FAF6EE',
        borderBottom: '1px solid #D69A18',
        boxShadow: '0 2px 8px rgba(70, 45, 20, 0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <VSBLogo size={36} showTitle={false} />

          {/* Brand Title */}
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#5A0A0A', letterSpacing: '0.04em' }}>
              V.S.B. ENGINEERING COLLEGE
            </span>
            <span style={{ fontSize: '0.70rem', fontWeight: 600, color: '#D69A18', letterSpacing: '0.06em' }}>
              SMART CAMPUS ERP
            </span>
          </div>

          <span style={{ color: '#D8CEBE', fontSize: '1.2rem', margin: '0 2px' }}>|</span>

          {/* Workspace Badge */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              padding: '5px 12px',
              borderRadius: 9999,
              background: '#F9EED4',
              color: '#720F0F',
              border: '1px solid #D69A18',
              letterSpacing: '0.02em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5
            }}>
              {role === 'ADMIN' ? '👑 SUPER ADMIN CONTROL CENTER' :
                  role === 'HOD' ? `👔 HOD PORTAL (${userDept?.code || 'CSE'})` :
                    `👩‍🏫 FACULTY WORKSPACE (${userDept?.code || 'CSE'})`}
            </span>
          </div>

          {/* ROLE-SPECIFIC NAVIGATION MENU */}
          <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
            {role === 'ADMIN' && (
              <>
                <button
                  onClick={() => { setCurrentSubView('user-management'); setShowAdminConsole(false); setSelectedStudent(null); }}
                  style={{
                    padding: '7px 14px', borderRadius: 6, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    background: currentSubView === 'user-management' ? '#720F0F' : '#FAF7F0',
                    color: currentSubView === 'user-management' ? '#FFFFFF' : '#720F0F',
                    border: currentSubView === 'user-management' ? '1px solid #4B0909' : '1px solid #D8CEBE',
                    transition: 'all 200ms ease'
                  }}
                >
                  👥 User Management
                </button>
                <button
                  onClick={() => { setShowAdminConsole(true); setSelectedStudent(null); }}
                  style={{
                    padding: '7px 14px', borderRadius: 6, fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    background: showAdminConsole ? '#720F0F' : '#FAF7F0',
                    color: showAdminConsole ? '#FFFFFF' : '#720F0F',
                    border: showAdminConsole ? '1px solid #4B0909' : '1px solid #D8CEBE',
                    transition: 'all 200ms ease'
                  }}
                >
                  ⚙️ Admin Control Panel
                </button>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right', fontSize: '13px', lineHeight: 1.2 }}>
            <span style={{ color: '#5A0A0A', fontWeight: 600, display: 'block', whiteSpace: 'nowrap' }}>{userName}</span>
            <span style={{ color: '#D69A18', fontWeight: 600, fontSize: '11px' }}>ID: {employeeId}</span>
          </div>

          <button
            style={{
              padding: '7px 14px',
              borderRadius: 6,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              background: '#FAF7F0',
              color: '#720F0F',
              border: '1px solid #D8CEBE',
              transition: 'all 200ms ease'
            }}
            onClick={onSignOut}
          >
            Sign Out
          </button>
        </div>
      </header>


      {/* Main Content View */}
      <main style={{ flex: 1, padding: '18px 24px', width: '100%' }}>
        {/* ROLE BASED DASHBOARDS OR SUBVIEWS */}
        {selectedStudent ? (
          <VSBStudentProfile
            student={selectedStudent}
            userSession={userSession}
            readOnly={role === 'HOD'}
            allStudents={localStudents}
            onSelectStudent={setSelectedStudent}
            onBack={() => setSelectedStudent(null)}
          />
        ) : currentSubView === 'add-student' ? (
          <AddStudentWizard
            onBack={() => setCurrentSubView('student-master')}
            onSaveSuccess={(msg) => {
              alert(msg || '🎉 New Student Successfully Registered and Stored in V.S.B Database!');
              setCurrentSubView('student-master');
            }}
          />
        ) : currentSubView === 'user-management' ? (
          <UserManagementModule />
        ) : showAdminConsole ? (
          <AdminConsole
            students={localStudents}
            departments={safeDepartments}
            onBack={() => setShowAdminConsole(false)}
          />
        ) : currentSubView === 'hod-dashboard' || (role === 'HOD' && currentSubView === 'default') ? (
          <HodDashboard
            userSession={userSession}
            students={localStudents}
          />
        ) : currentSubView === 'student-master' ? (
          /* STUDENT MASTER PROFILE MODULE */
          <VSBStudentMasterModule onSelectStudent={setSelectedStudent} />
        ) : currentSubView === 'academic' ? (
          /* ACADEMIC DETAILS & AUTO-PROMOTION MODULE */
          <VSBAcademicModule onSelectStudent={setSelectedStudent} />
        ) : currentSubView === 'sslc-hsc' ? (
          /* SSLC & HSC MARKS MODULE */
          <SSLCHSCModule onSelectStudent={setSelectedStudent} />
        ) : currentSubView === 'roster' ? (
          /* EXECUTIVE ROSTER MODULE */
          <VSBStudentMasterModule onSelectStudent={setSelectedStudent} />
        ) : currentSubView === 'attendance' ? (
          /* ATTENDANCE CONSOLE */
          <AttendanceConsole
            students={localStudents}
            onBack={() => setCurrentSubView('roster')}
          />
        ) : currentSubView === 'add-wizard' ? (
          /* ADD STUDENT WIZARD */
          <AddStudentWizard
            onBack={() => setCurrentSubView('roster')}
            onSaveSuccess={(newStudent) => {
              setLocalStudents([newStudent, ...localStudents]);
              setCurrentSubView('roster');
              showToast(`🎉 Registration Complete: ${newStudent.full_name} (${newStudent.register_number}) stored!`);
            }}
          />
        ) : currentSubView === 'import-csv' ? (
          /* IMPORT CSV */
          <ImportStudentsView
            onBack={() => setCurrentSubView('roster')}
            onImportSuccess={(newRows) => {
              const formattedRows = newRows.map((r, i) => ({
                id: `imp-${Date.now()}-${i}`,
                register_number: r.reg,
                roll_number: r.roll,
                full_name: r.name,
                department_name: r.dept,
                current_year: Number(r.yr) || 1,
                current_semester: Number(r.sem) || 1,
                section_name: r.sec || 'A',
                phone: r.phone || '',
                attendance_percentage: 95.0,
                cgpa: 8.0
              }));
              setLocalStudents([...formattedRows, ...localStudents]);
              setCurrentSubView('roster');
              showToast(`🎉 Imported ${formattedRows.length} student records into VSB Database!`);
            }}
          />
        ) : role === 'STAFF' || currentSubView === 'staff-dashboard' ? (
          <StaffDashboard
            userSession={userSession}
            students={localStudents}
          />
        ) : (
          /* ROSTER VIEW FOR ADMIN, HOD & STAFF */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* Header Title */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                  {role === 'ADMIN' ? '👑 Admin Master Workspace — V.S.B Engineering College' :
                    role === 'HOD' ? `👔 Department Executive Workspace — ${userDept?.name || 'Computer Science'}` :
                      `👩‍🏫 Faculty Class Roster — ${userDept?.code || 'AIDS'} (Assigned Classes)`}
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
                  Stored Student Records ({localStudents.length} Enrolled) • Spring Security JWT Protected
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                  onClick={() => setCurrentSubView('attendance')}
                >
                  📅 Attendance Management
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                  onClick={() => setShowFaceAiModal(true)}
                >
                  📷 Face Recognition Search
                </button>
                <button
                  className="btn btn-secondary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                  onClick={() => setCurrentSubView('import-csv')}
                >
                  📥 Upload CSV / Excel
                </button>
                <button
                  className="btn btn-primary"
                  style={{ padding: '10px 18px', fontSize: '0.88rem' }}
                  onClick={() => setCurrentSubView('add-wizard')}
                >
                  ➕ Register New Student
                </button>

                <input
                  type="text"
                  className="input-field"
                  placeholder="🔍 Search Reg No, Roll No, Name..."
                  style={{ width: 220 }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Student Roster Table */}
            <div className="glass-panel" style={{ padding: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                  Centralized Student Records Database ({filteredStudents.length} Records)
                </h3>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <th style={{ padding: 12 }}>Register No</th>
                    <th style={{ padding: 12 }}>Roll No</th>
                    <th style={{ padding: 12 }}>Student Name</th>
                    <th style={{ padding: 12 }}>Department</th>
                    <th style={{ padding: 12 }}>Year / Sem</th>
                    <th style={{ padding: 12 }}>CGPA</th>
                    <th style={{ padding: 12 }}>Attendance</th>
                    <th style={{ padding: 12 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(st => (
                    <tr key={st.id || st.register_number} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                      <td style={{ padding: 14, fontWeight: 700, color: '#F4B400' }}>{st.register_number}</td>
                      <td style={{ padding: 14, color: 'var(--text-muted)' }}>{st.roll_number}</td>
                      <td style={{ padding: 14, fontWeight: 600 }}>{st.full_name}</td>
                      <td style={{ padding: 14 }}><span className="badge badge-vsb">{st.department_name || userDept?.code || 'CSE'}</span></td>
                      <td style={{ padding: 14 }}>Yr {st.current_year || 3} / Sem {st.current_semester || 6}</td>
                      <td style={{ padding: 14, fontWeight: 700, color: '#34d399' }}>{st.cgpa || 8.92}</td>
                      <td style={{ padding: 14 }}>{st.attendance_percentage || 95.4}%</td>
                      <td style={{ padding: 14, display: 'flex', gap: 8 }}>
                        <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setSelectedStudent(st)}>
                          1-Click Profile →
                        </button>
                        <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => { setMarkStudentTarget(st); setShowMarkModal(true); }}>
                          📝 Feed Marks
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </main>

      {/* Face AI Modal */}
      {showFaceAiModal && (
        <FaceRecognitionModal
          students={localStudents}
          onClose={() => setShowFaceAiModal(false)}
          onSelectStudent={setSelectedStudent}
        />
      )}

      {/* Staff Mark Entry Modal */}
      {showMarkModal && markStudentTarget && (
        <StaffMarkEntryModal
          student={markStudentTarget}
          onClose={() => setShowMarkModal(false)}
          onSaveSuccess={(msg) => showToast(msg)}
        />
      )}

    </div>
  );
}
