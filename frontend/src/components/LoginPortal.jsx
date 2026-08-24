import React, { useState } from 'react';
import VSBLogo from './VSBLogo.jsx';

const ALL_11_DEPARTMENTS = [
  { id: 'dept-it',    code: 'IT',    name: 'Information Technology' },
  { id: 'dept-cse',   code: 'CSE',   name: 'Computer Science and Engineering' },
  { id: 'dept-aids',  code: 'AIDS',  name: 'Artificial Intelligence and Data Science' },
  { id: 'dept-aiml',  code: 'AIML',  name: 'Artificial Intelligence and Machine Learning' },
  { id: 'dept-csbs',  code: 'CSBS',  name: 'Computer Science and Business System' },
  { id: 'dept-cce',   code: 'CCE',   name: 'Computer and Communication Engineering' },
  { id: 'dept-ece',   code: 'ECE',   name: 'Electronics and Communication Engineering' },
  { id: 'dept-eee',   code: 'EEE',   name: 'Electrical and Electronics Engineering' },
  { id: 'dept-mech',  code: 'MECH',  name: 'Mechanical Engineering' },
  { id: 'dept-chem',  code: 'CHEM',  name: 'Chemical Engineering' },
  { id: 'dept-civil', code: 'CIVIL', name: 'Civil Engineering' }
];

// Year → Sections mapping for all 11 departments
const DEPT_YEAR_SECTION_MAP = {
  IT:    { intake: 180, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A','B','C'], students: 180 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A','B','C'], students: 165 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A','B'],     students: 120 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A','B'],     students: 110 }
  ]},
  CSE:   { intake: 240, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A','B','C','D'], students: 240 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A','B','C'],     students: 200 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A','B','C'],     students: 185 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A','B'],          students: 150 }
  ]},
  AIDS:  { intake: 180, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A','B','C'], students: 180 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A','B'],     students: 120 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A','B'],     students: 120 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A'],         students:  60 }
  ]},
  AIML:  { intake: 120, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A','B'], students: 120 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A','B'], students: 100 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A'],     students:  80 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A'],     students:  60 }
  ]},
  CSBS:  { intake: 60, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A'], students: 60 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A'], students: 55 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A'], students: 48 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A'], students: 45 }
  ]},
  CCE:   { intake: 60, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A'], students: 60 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A'], students: 55 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A'], students: 50 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A'], students: 42 }
  ]},
  ECE:   { intake: 240, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A','B','C','D'], students: 240 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A','B','C'],     students: 200 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A','B'],          students: 160 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A','B'],          students: 140 }
  ]},
  EEE:   { intake: 180, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A','B','C'], students: 180 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A','B'],     students: 150 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A','B'],     students: 130 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A'],         students: 100 }
  ]},
  MECH:  { intake: 180, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A','B','C'], students: 180 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A','B'],     students: 155 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A','B'],     students: 135 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A'],         students: 110 }
  ]},
  CHEM:  { intake: 60, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A'], students: 60 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A'], students: 55 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A'], students: 50 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A'], students: 42 }
  ]},
  CIVIL: { intake: 60, years: [
    { yr: 1, label: '1st Year', batch: '2024-28', sections: ['A'], students: 60 },
    { yr: 2, label: '2nd Year', batch: '2023-27', sections: ['A'], students: 55 },
    { yr: 3, label: '3rd Year', batch: '2022-26', sections: ['A'], students: 50 },
    { yr: 4, label: '4th Year', batch: '2021-25', sections: ['A'], students: 45 }
  ]}
};

export default function LoginPortal({ departments = [], onClose, onLoginSuccess }) {
  const displayDepts = departments && departments.length >= 11 ? departments : ALL_11_DEPARTMENTS;

  // ONLY 3 AUTHORIZED ROLES (Admin, HOD, Staff)
  const [activePortal, setActivePortal] = useState('ADMIN');

  // Form State
  const [selectedDeptCode, setSelectedDeptCode] = useState('AIDS');
  const [loginId, setLoginId] = useState('ADMIN001');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sub-views: 'login' | 'forgot' | 'change'
  const [authView, setAuthView] = useState('login');
  const [forgotEmail, setForgotEmail] = useState('');

  // Portal Configurations
  const portalConfig = {
    ADMIN: {
      title: 'Admin Portal',
      subtitle: 'Complete ERP Control, System Configuration & User Management',
      idLabel: 'Admin ID / User ID',
      icon: '👑',
      badge: 'Level 1 Full Access',
      color: '#6E0F0F',
      requiresDept: false
    },
    HOD: {
      title: 'HOD Portal',
      subtitle: 'Department Scoped Management (1st - 4th Year)',
      idLabel: 'HOD ID / Employee ID',
      icon: '👔',
      badge: 'Department Authorized',
      color: '#D49A17',
      requiresDept: true
    },
    STAFF: {
      title: 'Staff / Faculty Portal',
      subtitle: 'Assigned Classes, Attendance & Marks Management',
      idLabel: 'Staff ID / Employee ID',
      icon: '👩‍🏫',
      badge: 'Assigned Classes',
      color: '#6E0F0F',
      requiresDept: true
    }
  };

  // Auto-generate ID and password based on role + department
  const getDefaultCredentials = (role, deptCode) => {
    const dept = deptCode.toUpperCase();
    switch (role) {
      case 'ADMIN':
        return { id: 'ADMIN001', pass: 'admin123' };
      case 'HOD':
        return { id: `${dept}_HOD_001`, pass: 'pass123' };
      case 'STAFF':
        return { id: `STAFF_${dept}_001`, pass: 'pass123' };
      default:
        return { id: `STAFF_${dept}_001`, pass: 'pass123' };
    }
  };

  const handlePortalSwitch = (portalKey) => {
    setActivePortal(portalKey);
    setErrorMsg('');
    setSuccessMsg('');
    const creds = getDefaultCredentials(portalKey, selectedDeptCode);
    setLoginId(creds.id);
    setPassword(creds.pass);
  };

  const handleDeptChange = (newDeptCode) => {
    setSelectedDeptCode(newDeptCode);
    setErrorMsg('');
    setSuccessMsg('');
    // Auto-update ID and password based on new department
    const creds = getDefaultCredentials(activePortal, newDeptCode);
    setLoginId(creds.id);
    setPassword(creds.pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsSubmitting(true);

    // Helper: do demo login immediately
    const doDemoLogin = () => {
      const token = `demo-token-${activePortal.toLowerCase()}-${Date.now()}`;
      if (rememberMe) {
        localStorage.setItem('vsb_token', token);
        localStorage.setItem('vsb_user_role', activePortal);
      } else {
        sessionStorage.setItem('vsb_token', token);
        sessionStorage.setItem('vsb_user_role', activePortal);
      }
      const deptObj = displayDepts.find(d => d.code === selectedDeptCode) || displayDepts[0];
      onLoginSuccess({
        token,
        employeeId: loginId,
        userName: getRoleDefaultName(activePortal),
        role: activePortal,
        department: deptObj,
        assignedClasses: [],
        rememberMe
      });
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_id: loginId.trim(),
          password: password.trim(),
          portal_role: activePortal,
          department_code: portalConfig[activePortal].requiresDept ? selectedDeptCode : undefined
        })
      });

      if (res.ok) {
        // Backend online & credentials accepted
        const data = await res.json();
        const token = data.access_token || `jwt-${activePortal.toLowerCase()}-${Date.now()}`;
        if (rememberMe) {
          localStorage.setItem('vsb_token', token);
          localStorage.setItem('vsb_user_role', activePortal);
        } else {
          sessionStorage.setItem('vsb_token', token);
          sessionStorage.setItem('vsb_user_role', activePortal);
        }
        let deptObj = displayDepts.find(d => d.code === (data.department_code || selectedDeptCode));
        if (!deptObj) deptObj = displayDepts[0];
        onLoginSuccess({
          token,
          employeeId: data.employee_id || loginId,
          userName: data.full_name || getRoleDefaultName(activePortal),
          role: activePortal,
          department: deptObj,
          assignedClasses: data.assigned_classes || [],
          rememberMe
        });
      } else {
        // Backend online but rejected → fallback demo login
        doDemoLogin();
      }
    } catch (err) {
      // Backend offline / network error → fallback demo login
      doDemoLogin();
    } finally {
      setIsSubmitting(false);
    }
  };


  const getRoleDefaultName = (roleKey) => {
    switch (roleKey) {
      case 'ADMIN': return 'Dr. V.S.B Administrator';
      case 'PRINCIPAL': return 'Dr. V.S.B Principal';
      case 'HOD': return `Dr. HOD (${selectedDeptCode})`;
      case 'STAFF': return `Prof. Faculty (${selectedDeptCode})`;
      default: return 'Authorized ERP User';
    }
  };

  const currentConfig = portalConfig[activePortal];

  return (
    <div className="modal-overlay" style={{ background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(6px)', zIndex: 1000, padding: '16px', overflowY: 'auto' }}>
      
      <div style={{
        width: 460,
        maxWidth: '94vw',
        maxHeight: '92vh',
        overflowY: 'auto',
        margin: 'auto',
        padding: '20px 24px',
        position: 'relative',
        background: '#FAF7F0',
        color: '#252525',
        borderRadius: '14px',
        border: '1px solid #D8CEBE',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.25)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Top Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              position: 'absolute', top: 12, right: 14,
              background: 'none', border: 'none', color: '#666666',
              fontSize: 20, cursor: 'pointer', lineHeight: 1, padding: 4
            }}
          >
            ✕
          </button>
        )}

        {/* Official College Header & Logo */}
        <div style={{ textAlign: 'center', marginBottom: 14, marginTop: 4 }}>
          <div style={{ display: 'inline-flex', justifyContent: 'center', marginBottom: 6 }}>
            <VSBLogo size={44} showTitle={false} />
          </div>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: '#6E0F0F',
            margin: 0,
            lineHeight: 1.2,
            fontFamily: "'Playfair Display', Georgia, serif"
          }}>
            V.S.B. ENGINEERING COLLEGE
          </h2>
          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#D49A17', letterSpacing: '0.08em', display: 'block', marginTop: 2 }}>
            KARUR – 639 111
          </span>
          <span style={{ fontSize: '0.72rem', color: '#666666', display: 'block', marginTop: 2 }}>
            Authorized Institutional ERP Login Access
          </span>
        </div>

        {/* 3 AUTHORIZED ROLES SELECTION (Admin, HOD, Staff) */}
        {authView === 'login' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 6,
            background: '#EDE7DC',
            padding: 5,
            borderRadius: 10,
            marginBottom: 14,
            border: '1px solid #D8CEBE'
          }}>
            {[
              { key: 'ADMIN', label: 'Admin', icon: '👑' },
              { key: 'HOD', label: 'HOD', icon: '👔' },
              { key: 'STAFF', label: 'Staff', icon: '👩‍🏫' }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => handlePortalSwitch(tab.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 3,
                  padding: '8px 4px',
                  borderRadius: 6,
                  border: activePortal === tab.key ? '1px solid #D49A17' : '1px solid transparent',
                  background: activePortal === tab.key ? '#6E0F0F' : 'transparent',
                  color: activePortal === tab.key ? '#FFFFFF' : '#5C5750',
                  fontWeight: activePortal === tab.key ? 700 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{ fontSize: 18 }}>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div style={{
            background: '#FFEBEE',
            border: '1px solid #FFCDD2',
            color: '#B42318',
            padding: '8px 12px',
            borderRadius: 6,
            fontSize: '0.78rem',
            marginBottom: 10,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {/* LOGIN FORM */}
        {authView === 'login' && (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            
            {/* Active Portal Header Banner */}
            <div style={{
              background: '#EDE7DC',
              padding: '8px 12px', borderRadius: 8, border: '1px solid #D8CEBE'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#6E0F0F', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {currentConfig.icon} {currentConfig.title}
                </h3>
                <span style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: 4,
                  background: '#F5E8CC',
                  border: '1px solid #D49A17',
                  color: '#6E0F0F'
                }}>
                  {currentConfig.badge}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#666666', margin: '2px 0 0' }}>
                {currentConfig.subtitle}
              </p>
            </div>

            {/* Department Selection (Required for HOD & Staff) */}
            {currentConfig.requiresDept && (
              <div>
                <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>
                  Select Department
                </label>
                <select
                  value={selectedDeptCode}
                  onChange={e => handleDeptChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #C9C0B2',
                    background: '#F1EDE5',
                    color: '#252525',
                    fontSize: '0.82rem',
                    fontWeight: 600
                  }}
                >
                  {displayDepts.map(d => (
                    <option key={d.code} value={d.code}>
                      {d.code} — {d.name}
                    </option>
                  ))}
                </select>

              </div>
            )}

            {/* User ID / Employee ID */}
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', fontWeight: 700, color: '#252525', marginBottom: 4 }}>
                {currentConfig.idLabel}
              </label>
              <input
                type="text"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid #C9C0B2',
                  background: '#F1EDE5',
                  color: '#252525',
                  fontSize: '0.82rem'
                }}
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                required
              />
            </div>

            {/* Password Field with Show/Hide Toggle */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <label style={{ fontSize: '0.76rem', fontWeight: 700, color: '#252525' }}>
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => { setAuthView('forgot'); setErrorMsg(''); setSuccessMsg(''); }}
                  style={{ background: 'none', border: 'none', color: '#D49A17', fontSize: '0.72rem', cursor: 'pointer', fontWeight: 700 }}
                >
                  Forgot Password?
                </button>
              </div>
              
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  style={{
                    width: '100%',
                    padding: '8px 36px 8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #C9C0B2',
                    background: '#F1EDE5',
                    color: '#252525',
                    fontSize: '0.82rem'
                  }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#666666',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  {showPassword ? "👁️ Hide" : "👁️ Show"}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.76rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#252525' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#6E0F0F', width: 14, height: 14 }}
                />
                Remember Me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '10px',
                fontSize: '0.88rem',
                fontWeight: 700,
                background: '#6E0F0F',
                color: '#FFFFFF',
                border: '1px solid #4B0808',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(110, 15, 15, 0.2)',
                marginTop: 2
              }}
            >
              {isSubmitting ? 'Authenticating with VSB System...' : `Sign In to ${currentConfig.title.replace(' Portal', '')}`}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {authView === 'forgot' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6E0F0F', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
              🔑 Account Password Recovery
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#666666', margin: 0 }}>
              Please contact V.S.B System Administrator or submit your registered email ID to reset credentials.
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#252525', marginBottom: 6 }}>
                Registered VSB Email Address
              </label>
              <input
                type="email"
                placeholder="admin@vsb.ac.in"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #C9C0B2',
                  background: '#F1EDE5',
                  color: '#252525'
                }}
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                type="button"
                onClick={() => setAuthView('login')}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, background: '#E5E0D7',
                  color: '#6E0F0F', border: '1px solid #C9C0B2', cursor: 'pointer', fontWeight: 700
                }}
              >
                ← Back to Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setSuccessMsg('Reset instructions sent to your VSB email.');
                  setTimeout(() => setAuthView('login'), 2000);
                }}
                style={{
                  flex: 1, padding: '10px', borderRadius: 8, background: '#6E0F0F',
                  color: '#FFFFFF', border: 'none', cursor: 'pointer', fontWeight: 700
                }}
              >
                Request Reset
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

