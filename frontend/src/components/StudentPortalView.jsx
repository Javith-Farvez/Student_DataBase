import React, { useState } from 'react';
import {
  User, BookOpen, Award, FileText, Lock, Download, Calendar, CheckCircle2,
  AlertCircle, Briefcase, ChevronRight, ShieldCheck, Key, RefreshCw, X
} from 'lucide-react';

export default function StudentPortalView({ studentData, onSignOut }) {
  const student = studentData || {
    register_number: '922521104001',
    roll_number: '21AD001',
    full_name: 'Aarav Sharma',
    department_code: 'AIDS',
    department_name: 'Artificial Intelligence & Data Science',
    current_year: 3,
    current_semester: 6,
    section: 'A',
    cgpa: 8.92,
    attendance_percentage: 95.4,
    dob: '2004-05-14',
    blood_group: 'O+',
    phone: '+91 98765 43210',
    email: 'aarav.sharma@vsb.ac.in',
    father_name: 'Suresh Sharma',
    mother_name: 'Sunita Sharma'
  };

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'attendance' | 'marks' | 'assignments' | 'placement' | 'documents'
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passForm, setPassForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [toastMsg, setToastMsg] = useState(null);
  const [toastType, setToastType] = useState('success');

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePasswordChangeSubmit = (e) => {
    e.preventDefault();
    if (!passForm.oldPassword || !passForm.newPassword || !passForm.confirmPassword) {
      triggerToast('Please fill in all password fields.', 'error');
      return;
    }
    if (passForm.newPassword.length < 6) {
      triggerToast('New password must be at least 6 characters.', 'error');
      return;
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      triggerToast('New password and confirm password do not match.', 'error');
      return;
    }

    triggerToast('🎉 Password changed successfully! Please log in with your new password.', 'success');
    setShowPasswordModal(false);
    setPassForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Sample Subject Attendance Breakdown
  const subjectAttendance = [
    { code: 'AD3651', name: 'Large Language Models & Generative AI', present: 36, total: 38, percent: 94.7 },
    { code: 'CS3491', name: 'Artificial Intelligence & Machine Learning', present: 42, total: 44, percent: 95.5 },
    { code: 'AD3501', name: 'Deep Learning & Neural Networks', present: 38, total: 40, percent: 95.0 },
    { code: 'AD3611', name: 'Data Engineering & Cloud Pipelines', present: 30, total: 30, percent: 100.0 },
    { code: 'GE3451', name: 'Professional Ethics & Human Values', present: 20, total: 22, percent: 90.9 }
  ];

  // Sample Internal & Semester Marks
  const marksData = [
    { code: 'AD3651', subject: 'LLM & Generative AI', ia1: 92, ia2: 95, ia3: 90, assignment: 10, lab: 48, semGrade: 'O' },
    { code: 'CS3491', subject: 'AI & Machine Learning', ia1: 88, ia2: 91, ia3: 94, assignment: 10, lab: 46, semGrade: 'A+' },
    { code: 'AD3501', subject: 'Deep Learning & Neural Networks', ia1: 85, ia2: 89, ia3: 92, assignment: 9, lab: 45, semGrade: 'A+' },
    { code: 'AD3611', subject: 'Data Engineering', ia1: 96, ia2: 98, ia3: 95, assignment: 10, lab: 50, semGrade: 'O' },
    { code: 'GE3451', subject: 'Professional Ethics', ia1: 90, ia2: 86, ia3: 88, assignment: 10, lab: 44, semGrade: 'A+' }
  ];

  // Sample Assignments
  const assignmentsList = [
    { title: 'Assignment 1: Fine-tuning Llama-3 on Custom ERP Dataset', subject: 'AD3651', dueDate: '2026-08-20', status: 'Submitted', score: '10 / 10' },
    { title: 'Assignment 2: PostgreSQL 16 Distributed Index Optimization', subject: 'AD3611', dueDate: '2026-08-25', status: 'Pending', score: 'Pending Evaluation' },
    { title: 'Lab Record 3: InsightFace 512-d Embedding Pipeline', subject: 'CS3491', dueDate: '2026-08-18', status: 'Submitted', score: '10 / 10' }
  ];

  // Sample Placement Announcements
  const placementDrives = [
    { company: 'Zoho Corporation', role: 'Software Development Engineer', CTC: '₹ 8.5 LPA', date: '2026-08-30', status: 'Eligible & Shortlisted' },
    { company: 'Tata Consultancy Services (TCS Digital)', role: 'AI Data Engineer', CTC: '₹ 7.2 LPA', date: '2026-09-05', status: 'Registered' },
    { company: 'Cognizant GenC Next', role: 'Full Stack Engineer', CTC: '₹ 6.75 LPA', date: '2026-09-12', status: 'Eligible' }
  ];

  // Sample Documents
  const approvedDocuments = [
    { name: 'Semester 5 Marksheet (Official)', type: 'PDF', date: '2026-01-15' },
    { name: 'Bonafide Certificate (Passport/Scholarship)', type: 'PDF', date: '2026-06-10' },
    { name: 'Hostel & Mess Clearance Certificate', type: 'PDF', date: '2026-07-01' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#DED9D0', color: '#252525', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Toast Alert */}
      {toastMsg && (
        <div style={{
          position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8,
          background: toastType === 'success' ? '#2E7D32' : '#B42318', color: '#fff',
          fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.15)', zIndex: 5000,
          border: toastType === 'success' ? '1px solid #A5D6A7' : '1px solid #FFCDD2'
        }}>
          {toastType === 'success' ? '✨ ' : '⚠️ '}{toastMsg}
        </div>
      )}

      {/* Top Header Navigation */}
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 32px', background: '#F1EDE5', borderBottom: '1px solid #D49A17',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: '#6E0F0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: '#fff', fontSize: '1.2rem', border: '1px solid #D49A17' }}>
            🎓
          </div>
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6E0F0F', letterSpacing: '0.02em', fontFamily: "'Playfair Display', serif" }}>
              VSB STUDENT PORTAL
            </h1>
            <p style={{ fontSize: '0.75rem', color: '#666666' }}>
              V.S.B. Engineering College • Register No: {student.register_number}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setShowPasswordModal(true)}
            style={{
              padding: '7px 16px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700,
              background: '#F5E8CC', color: '#6E0F0F', border: '1px solid #D49A17',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
            }}
          >
            <Key className="w-4 h-4 text-amber-700" />
            Change Password
          </button>

          <button
            onClick={onSignOut}
            style={{
              padding: '7px 16px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700,
              background: '#F1EDE5', color: '#6E0F0F', border: '1px solid #6E0F0F',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Workspace Container */}
      <main style={{ maxWidth: 1300, margin: '24px auto', padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 24 }}>
        
        {/* Student Master Header Banner */}
        <div style={{
          background: '#F1EDE5',
          padding: 24, borderRadius: 12, border: '1px solid #C9C0B2',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16, background: '#F5E8CC',
              border: '2px solid #D49A17', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', color: '#6E0F0F'
            }}>
              👨‍🎓
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#6E0F0F', fontFamily: "'Playfair Display', serif" }}>{student.full_name}</h2>
                <span style={{ background: '#6E0F0F', color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, border: '1px solid #D49A17' }}>
                  {student.department_code || 'AIDS'}
                </span>
              </div>
              <p style={{ color: '#666666', fontSize: '0.88rem', marginTop: 4 }}>
                Reg No: <strong style={{ color: '#6E0F0F' }}>{student.register_number}</strong> • Roll No: {student.roll_number} • Year {student.current_year} (Sem {student.current_semester}) • Section {student.section}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ background: '#E5E0D7', padding: '12px 20px', borderRadius: 10, border: '1px solid #C9C0B2', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#666666', textTransform: 'uppercase', fontWeight: 700 }}>Attendance</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2E7D32', marginTop: 2 }}>{student.attendance_percentage}%</p>
            </div>
            <div style={{ background: '#E5E0D7', padding: '12px 20px', borderRadius: 10, border: '1px solid #C9C0B2', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: '#666666', textTransform: 'uppercase', fontWeight: 700 }}>CGPA</span>
              <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#D49A17', marginTop: 2 }}>{student.cgpa}</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: 8, background: '#F1EDE5', padding: 6, borderRadius: 10, border: '1px solid #C9C0B2', overflowX: 'auto' }}>
          {[
            { id: 'overview', label: '👤 Profile Overview', icon: User },
            { id: 'attendance', label: '📊 Subject Attendance', icon: BookOpen },
            { id: 'marks', label: '📝 Marks & Grades', icon: Award },
            { id: 'assignments', label: '📋 Assignments', icon: FileText },
            { id: 'placement', label: '💼 Placement Drives', icon: Briefcase },
            { id: 'documents', label: '📥 Approved Documents', icon: Download },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 18px', borderRadius: 6, fontSize: '0.85rem', fontWeight: 700,
                  background: isActive ? '#6E0F0F' : '#FCFAF6',
                  color: isActive ? '#FFFFFF' : '#6E0F0F',
                  border: isActive ? '1px solid #D49A17' : '1px solid #E8E1D7',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease'
                }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-maroon'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: 20 }}>
            {/* Personal Details */}
            <div style={{ background: '#F1EDE5', padding: 24, borderRadius: 12, border: '1px solid #C9C0B2' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Playfair Display', serif" }}>
                <User className="w-5 h-5 text-amber-700" /> Personal Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #C9C0B2', paddingBottom: 8 }}>
                  <span style={{ color: '#666666' }}>Full Name</span>
                  <span style={{ fontWeight: 700, color: '#252525' }}>{student.full_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #C9C0B2', paddingBottom: 8 }}>
                  <span style={{ color: '#666666' }}>Date of Birth</span>
                  <span style={{ fontWeight: 600, color: '#252525' }}>{student.dob}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #C9C0B2', paddingBottom: 8 }}>
                  <span style={{ color: '#666666' }}>Blood Group</span>
                  <span style={{ fontWeight: 700, color: '#6E0F0F' }}>{student.blood_group}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #C9C0B2', paddingBottom: 8 }}>
                  <span style={{ color: '#666666' }}>Mobile Phone</span>
                  <span style={{ fontWeight: 600, color: '#252525' }}>{student.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                  <span style={{ color: '#666666' }}>Email Address</span>
                  <span style={{ fontWeight: 600, color: '#252525' }}>{student.email}</span>
                </div>
              </div>
            </div>

            {/* Academic & Parent Info */}
            <div style={{ background: '#F1EDE5', padding: 24, borderRadius: 12, border: '1px solid #C9C0B2' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Playfair Display', serif" }}>
                <BookOpen className="w-5 h-5 text-amber-700" /> Academic & Family Details
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #C9C0B2', paddingBottom: 8 }}>
                  <span style={{ color: '#666666' }}>Department</span>
                  <span style={{ fontWeight: 700, color: '#252525' }}>{student.department_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #C9C0B2', paddingBottom: 8 }}>
                  <span style={{ color: '#666666' }}>Father's Name</span>
                  <span style={{ fontWeight: 600, color: '#252525' }}>{student.father_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #C9C0B2', paddingBottom: 8 }}>
                  <span style={{ color: '#666666' }}>Mother's Name</span>
                  <span style={{ fontWeight: 600, color: '#252525' }}>{student.mother_name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 4 }}>
                  <span style={{ color: '#666666' }}>First Graduate Status</span>
                  <span style={{ fontWeight: 700, color: '#2E7D32' }}>Eligible (Government Scheme)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SUBJECT ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div style={{ background: '#F1EDE5', padding: 24, borderRadius: 12, border: '1px solid #C9C0B2' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>
              Subject-wise Attendance Breakdown — Semester {student.current_semester}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#E5E0D7', borderBottom: '2px solid #E8E1D7', color: '#6E0F0F', fontSize: '0.85rem' }}>
                  <th style={{ padding: 12 }}>Subject Code</th>
                  <th style={{ padding: 12 }}>Subject Name</th>
                  <th style={{ padding: 12 }}>Classes Attended</th>
                  <th style={{ padding: 12 }}>Total Hours</th>
                  <th style={{ padding: 12 }}>Attendance %</th>
                  <th style={{ padding: 12 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {subjectAttendance.map(sub => (
                  <tr key={sub.code} style={{ borderBottom: '1px solid #C9C0B2', fontSize: '0.9rem' }}>
                    <td style={{ padding: 14, fontWeight: 700, color: '#6E0F0F' }}>{sub.code}</td>
                    <td style={{ padding: 14, fontWeight: 600 }}>{sub.name}</td>
                    <td style={{ padding: 14 }}>{sub.present} hrs</td>
                    <td style={{ padding: 14, color: '#666666' }}>{sub.total} hrs</td>
                    <td style={{ padding: 14, fontWeight: 800, color: sub.percent >= 90 ? '#2E7D32' : '#B42318' }}>{sub.percent}%</td>
                    <td style={{ padding: 14 }}>
                      <span style={{ background: '#E8F5E9', color: '#2E7D32', fontSize: '0.75rem', fontWeight: 700, padding: '4px 10px', borderRadius: 99, border: '1px solid #A5D6A7' }}>
                        Satisfactory
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 3: MARKS */}
        {activeTab === 'marks' && (
          <div style={{ background: '#F1EDE5', padding: 24, borderRadius: 12, border: '1px solid #C9C0B2' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>
              Internal Assessment (IA) & Semester Grades — Semester {student.current_semester}
            </h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#E5E0D7', borderBottom: '2px solid #E8E1D7', color: '#6E0F0F', fontSize: '0.85rem' }}>
                  <th style={{ padding: 12 }}>Code</th>
                  <th style={{ padding: 12 }}>Subject Title</th>
                  <th style={{ padding: 12 }}>IA1 (100)</th>
                  <th style={{ padding: 12 }}>IA2 (100)</th>
                  <th style={{ padding: 12 }}>IA3 (100)</th>
                  <th style={{ padding: 12 }}>Assignment</th>
                  <th style={{ padding: 12 }}>Lab (50)</th>
                  <th style={{ padding: 12 }}>Semester Grade</th>
                </tr>
              </thead>
              <tbody>
                {marksData.map(m => (
                  <tr key={m.code} style={{ borderBottom: '1px solid #C9C0B2', fontSize: '0.9rem' }}>
                    <td style={{ padding: 14, fontWeight: 700, color: '#6E0F0F' }}>{m.code}</td>
                    <td style={{ padding: 14, fontWeight: 600 }}>{m.subject}</td>
                    <td style={{ padding: 14 }}>{m.ia1}</td>
                    <td style={{ padding: 14 }}>{m.ia2}</td>
                    <td style={{ padding: 14 }}>{m.ia3}</td>
                    <td style={{ padding: 14, color: '#2E7D32', fontWeight: 700 }}>{m.assignment}/10</td>
                    <td style={{ padding: 14 }}>{m.lab}/50</td>
                    <td style={{ padding: 14 }}><span style={{ background: '#6E0F0F', color: '#fff', fontSize: '0.8rem', fontWeight: 800, padding: '4px 12px', borderRadius: 6 }}>{m.semGrade}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: ASSIGNMENTS */}
        {activeTab === 'assignments' && (
          <div style={{ background: '#F1EDE5', padding: 24, borderRadius: 12, border: '1px solid #C9C0B2' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>
              Course Assignments & Submissions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {assignmentsList.map((a, i) => (
                <div key={i} style={{ background: '#E5E0D7', padding: 18, borderRadius: 10, border: '1px solid #C9C0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: '#6E0F0F', fontWeight: 800 }}>{a.subject}</span>
                    <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: 2, color: '#252525' }}>{a.title}</h4>
                    <p style={{ fontSize: '0.8rem', color: '#666666', marginTop: 4 }}>Due Date: {a.dueDate}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ background: a.status === 'Submitted' ? '#E8F5E9' : '#FFF8E1', color: a.status === 'Submitted' ? '#2E7D32' : '#B7791F', fontSize: '0.78rem', fontWeight: 800, padding: '6px 14px', borderRadius: 99, border: a.status === 'Submitted' ? '1px solid #A5D6A7' : '1px solid #FFE082', display: 'inline-block' }}>
                      {a.status}
                    </span>
                    <p style={{ fontSize: '0.8rem', color: '#666666', marginTop: 4, fontWeight: 700 }}>Score: {a.score}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: PLACEMENT DRIVES */}
        {activeTab === 'placement' && (
          <div style={{ background: '#F1EDE5', padding: 24, borderRadius: 12, border: '1px solid #C9C0B2' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>
              Campus Placement Drives & Eligibility
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
              {placementDrives.map((p, i) => (
                <div key={i} style={{ background: '#E5E0D7', padding: 20, borderRadius: 12, border: '1px solid #C9C0B2' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2E7D32', background: '#E8F5E9', padding: '4px 10px', borderRadius: 99, border: '1px solid #A5D6A7' }}>
                    {p.status}
                  </span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 800, marginTop: 10, color: '#6E0F0F' }}>{p.company}</h4>
                  <p style={{ fontSize: '0.88rem', color: '#666666', marginTop: 2 }}>{p.role}</p>
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ color: '#D49A17', fontWeight: 800, fontSize: '1rem' }}>{p.CTC}</span>
                    <span style={{ color: '#666666' }}>Drive: {p.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: DOCUMENTS */}
        {activeTab === 'documents' && (
          <div style={{ background: '#F1EDE5', padding: 24, borderRadius: 12, border: '1px solid #C9C0B2' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#6E0F0F', marginBottom: 16, fontFamily: "'Playfair Display', serif" }}>
              Approved Institutional Certificates & Vault
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {approvedDocuments.map((doc, i) => (
                <div key={i} style={{ background: '#E5E0D7', padding: 16, borderRadius: 10, border: '1px solid #C9C0B2', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FileText className="w-6 h-6 text-amber-700" />
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#252525' }}>{doc.name}</h4>
                      <p style={{ fontSize: '0.78rem', color: '#666666' }}>Verified & Stored • Issued: {doc.date}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => triggerToast(`Downloading ${doc.name}...`)}
                    style={{
                      padding: '8px 16px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 700,
                      background: '#6E0F0F', color: '#fff', border: '1px solid #4B0808', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.55)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 5000, padding: 20 }}>
          <div style={{ width: 440, background: '#F1EDE5', padding: 28, borderRadius: 16, border: '1px solid #C9C0B2', color: '#252525', boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#6E0F0F', display: 'flex', alignItems: 'center', gap: 8, fontFamily: "'Playfair Display', serif" }}>
                <Key className="w-5 h-5 text-amber-700" /> Change Student Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', color: '#666666', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handlePasswordChangeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#252525', display: 'block', marginBottom: 6 }}>Current Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter current password..."
                  value={passForm.oldPassword}
                  onChange={e => setPassForm({ ...passForm, oldPassword: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#252525', display: 'block', marginBottom: 6 }}>New Password (min 6 chars)</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Enter new password..."
                  value={passForm.newPassword}
                  onChange={e => setPassForm({ ...passForm, newPassword: e.target.value })}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#252525', display: 'block', marginBottom: 6 }}>Confirm New Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Confirm new password..."
                  value={passForm.confirmPassword}
                  onChange={e => setPassForm({ ...passForm, confirmPassword: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: 12 }}>
                  🔑 Update Password
                </button>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn btn-secondary" style={{ padding: 12 }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

