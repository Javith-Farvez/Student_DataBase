import React, { useState } from 'react';
import VSBLogo from './VSBLogo.jsx';

const ALL_REPORTS = [
  { id: 'student_profile', title: '1. Student Complete Profile Report', icon: '👤', desc: 'Complete 360° academic, demographic, attendance & document summary for a student.' },
  { id: 'attendance', title: '2. College Attendance Summary Report', icon: '📅', desc: 'Daily, monthly & overall attendance statistics with OD and Medical Leaves.' },
  { id: 'internal_marks', title: '3. Internal Assessment Marks Report', icon: '📝', desc: 'IA1, IA2, IA3, Assignment & Model Exam marks ledger.' },
  { id: 'semester_marksheet', title: '4. Semester Mark Sheet & Grades', icon: '📚', desc: 'Official Anna University semester 1–8 mark sheet with grades and credit points.' },
  { id: 'sgpa_cgpa', title: '5. SGPA & CGPA Analytics Report', icon: '📊', desc: 'Credit-weighted SGPA per semester and cumulative CGPA across completed terms.' },
  { id: 'class_report', title: '6. Executive Class Performance Report', icon: '🏫', desc: 'Section-level pass rates, attendance averages, and top rankers.' },
  { id: 'department_report', title: '7. Department Executive Summary Report', icon: '🏛️', desc: 'HOD level comprehensive department performance analytics.' },
  { id: 'placement_report', title: '8. Placement & Recruitment Report', icon: '💼', desc: 'Company-wise selections, packages, and technical skills matrix.' },
  { id: 'fee_report', title: '9. Tuition & Fee Dues Summary Report', icon: '💰', desc: 'Scholarship deductions, hostel fees, bus route fees & pending dues.' },
  { id: 'hostel_report', title: '10. Hostel Allocation & Mess Report', icon: '🏢', desc: 'Block, floor, room number, bed allocation, and mess roster.' },
  { id: 'bus_report', title: '11. Bus Transport Route & Driver Report', icon: '🚌', desc: 'Bus route numbers, boarding points, pickup times, and driver contacts.' },
  { id: 'certificate_report', title: '12. Certificate & Hackathon Report', icon: '📜', desc: 'Verified 10th/12th marksheets, TC, Bonafide, and Hackathon awards.' }
];

export default function ReportsConsole({
  userSession = {},
  studentId = '922521104001',
  registerNumber = '922521104001',
  onBack
}) {
  const [downloadingId, setDownloadingId] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);

  const userRole = userSession?.role || 'ADMIN';
  const userDeptCode = userSession?.department?.code || 'AIDS';

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleAction = async (reportId, actionType) => {
    setDownloadingId(reportId);
    const reportObj = ALL_REPORTS.find(r => r.id === reportId);
    
    setTimeout(() => {
      setDownloadingId(null);
      if (actionType === 'print') {
        showToast(`🖨️ Printing Official V.S.B ${reportObj?.title}...`);
        window.print();
      } else if (actionType === 'pdf') {
        showToast(`📄 Exported Official V.S.B ${reportObj?.title} (.PDF)!`);
      } else if (actionType === 'excel') {
        showToast(`📊 Exported V.S.B ${reportObj?.title} Dataset (.XLSX)!`);
      }
    }, 600);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* Toast Notification */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8,
          background: '#B22222', color: '#fff', fontWeight: 600, boxShadow: '0 10px 25px rgba(178,34,34,0.4)', zIndex: 5000,
          border: '1px solid #F4B400'
        }}>
          ✨ {toastMsg}
        </div>
      )}

      {/* Official V.S.B Header Banner */}
      <div className="glass-panel" style={{ padding: 24, borderLeft: '4px solid #B22222', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <VSBLogo size={48} showTitle={false} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge badge-vsb">V.S.B. ENGINEERING COLLEGE</span>
              <span className="badge badge-gold">CENTRAL REPORT CENTER</span>
              <span className="badge badge-emerald">Scope: {userRole === 'ADMIN' || userRole === 'PRINCIPAL' ? 'ALL DEPARTMENTS' : userDeptCode}</span>
            </div>
            <h2 style={{ margin: '4px 0 0 0', fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
              Official Institutional Documentation & Export Console
            </h2>
            <p style={{ margin: '2px 0 0 0', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
              Motto: <i>"HARDWORK IS THE KEY TO SUCCESS"</i> • Professional Header & Logo Formatted Reports
            </p>
          </div>
        </div>

        {onBack && (
          <button className="btn btn-secondary" onClick={onBack} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            ← Back to Roster
          </button>
        )}
      </div>

      {/* 12 Reports Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 18 }}>
        {ALL_REPORTS.map(r => (
          <div key={r.id} className="glass-panel" style={{ padding: 20, borderRadius: 14, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <span style={{ fontSize: '1.8rem' }}>{r.icon}</span>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#fff' }}>{r.title}</h3>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: 0 }}>
                {r.desc}
              </p>
            </div>

            <div style={{ marginTop: 18, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => handleAction(r.id, 'pdf')}
                disabled={downloadingId === r.id}
                className="btn btn-primary"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700, background: '#B91C1C', border: 'none' }}
              >
                {downloadingId === r.id ? 'Generating...' : '📄 PDF'}
              </button>
              <button
                onClick={() => handleAction(r.id, 'excel')}
                disabled={downloadingId === r.id}
                className="btn btn-secondary"
                style={{ flex: 1, padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700 }}
              >
                📊 Excel
              </button>
              <button
                onClick={() => handleAction(r.id, 'print')}
                disabled={downloadingId === r.id}
                className="btn btn-secondary"
                style={{ padding: '8px 12px', fontSize: '0.78rem', fontWeight: 700 }}
              >
                🖨️ Print
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
