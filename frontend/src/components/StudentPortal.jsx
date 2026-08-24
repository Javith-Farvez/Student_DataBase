import React, { useState, useEffect } from 'react';
import VSBLogo from './VSBLogo.jsx';

const API = 'http://127.0.0.1:8000/api/v1';

// ─── Animated Stat Card ─────────────────────────────────────────────────────
function StatCard({ icon, label, value, color = '#B22222', sub = null, trend = null }) {
  const [displayed, setDisplayed] = useState(0);
  const numVal = parseFloat(value) || 0;

  useEffect(() => {
    let start = 0;
    const increment = numVal / 40;
    const timer = setInterval(() => {
      start += increment;
      if (start >= numVal) { setDisplayed(numVal); clearInterval(timer); }
      else setDisplayed(Math.round(start * 10) / 10);
    }, 25);
    return () => clearInterval(timer);
  }, [numVal]);

  return (
    <div style={{
      background: `linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))`,
      border: `1px solid ${color}40`,
      borderLeft: `4px solid ${color}`,
      borderRadius: 16,
      padding: '20px 24px',
      position: 'relative',
      overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}30`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div style={{ position: 'absolute', top: -20, right: -20, fontSize: 72, opacity: 0.07 }}>{icon}</div>
      <div style={{ fontSize: '1.6rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>
        {typeof value === 'string' && !parseFloat(value) ? value : displayed}
        {typeof value === 'string' && value.includes('%') ? '%' : ''}
      </div>
      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 2 }}>{sub}</div>}
      {trend && <div style={{ position: 'absolute', top: 16, right: 16, color: trend > 0 ? '#34d399' : '#f87171', fontSize: '0.78rem', fontWeight: 700 }}>
        {trend > 0 ? '▲' : '▼'} {Math.abs(trend)}%
      </div>}
    </div>
  );
}

// ─── Mini Progress Bar ───────────────────────────────────────────────────────
function ProgressBar({ value, max = 100, color = '#B22222', label = '' }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div style={{ marginBottom: 8 }}>
      {label && <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#94a3b8', marginBottom: 4 }}>
        <span>{label}</span>
        <span style={{ fontWeight: 700, color }}>{value}/{max}</span>
      </div>}
      <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: `linear-gradient(90deg, ${color}, ${color}cc)`, borderRadius: 3, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

// ─── SGPA Sparkline Chart ────────────────────────────────────────────────────
function SGPAChart({ records = [] }) {
  if (!records.length) return null;
  const maxSGPA = 10;
  const width = 320, height = 80;
  const pts = records.map((r, i) => {
    const x = (i / (records.length - 1 || 1)) * (width - 40) + 20;
    const y = height - (r.sgpa / maxSGPA) * (height - 20) - 10;
    return `${x},${y}`;
  });
  const polyline = pts.join(' ');
  const areaPath = `M ${pts[0]} L ${pts.join(' L ')} L ${(records.length - 1) / (records.length - 1 || 1) * (width - 40) + 20},${height} L 20,${height} Z`;

  return (
    <svg width={width} height={height} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="sgpaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B22222" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#B22222" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sgpaGrad)" />
      <polyline points={polyline} fill="none" stroke="#B22222" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {records.map((r, i) => {
        const x = (i / (records.length - 1 || 1)) * (width - 40) + 20;
        const y = height - (r.sgpa / maxSGPA) * (height - 20) - 10;
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={4} fill="#B22222" />
            <text x={x} y={y - 8} textAnchor="middle" fontSize="9" fill="#94a3b8">{r.sgpa}</text>
            <text x={x} y={height + 12} textAnchor="middle" fontSize="8" fill="#64748b">S{r.semester}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Attendance Donut ────────────────────────────────────────────────────────
function AttendanceDonut({ percentage = 0 }) {
  const pct = Math.min(100, Math.max(0, percentage));
  const r = 42, cx = 50, cy = 50;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? '#34d399' : pct >= 65 ? '#f59e0b' : '#ef4444';

  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
        strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
        strokeLinecap="round" style={{ transition: 'stroke-dasharray 1.5s ease' }} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="14" fontWeight="900" fill={color}>{pct}%</text>
      <text x={cx} y={cy + 16} textAnchor="middle" fontSize="7" fill="#64748b">ATTENDANCE</text>
    </svg>
  );
}

// ─── Leave/OD Request Modal ──────────────────────────────────────────────────
function RequestModal({ type, studentId, onClose, onSuccess }) {
  const isOD = type === 'OD';
  const [formData, setFormData] = useState({
    from_date: '', to_date: '', reason: '',
    leave_type: 'Medical', event_name: '', event_type: 'Symposium', venue: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isOD ? '/student-portal/od-request' : '/student-portal/leave-request';
      const payload = isOD
        ? { student_id: studentId, from_date: formData.from_date, to_date: formData.to_date, event_name: formData.event_name, event_type: formData.event_type, venue: formData.venue, reason: formData.reason }
        : { student_id: studentId, from_date: formData.from_date, to_date: formData.to_date, reason: formData.reason, leave_type: formData.leave_type };
      const res = await fetch(`${API}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        onSuccess(`${type} request submitted successfully!`);
        onClose();
      }
    } catch { onSuccess(`${type} request submitted (demo mode)`); onClose(); }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(8px)' }}>
      <div style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: 480, boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}>
        <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: 20 }}>
          {isOD ? '📋 Submit OD Request' : '📝 Apply for Leave'}
        </h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>From Date *</label>
              <input type="date" required value={formData.from_date} onChange={e => setFormData({ ...formData, from_date: e.target.value })}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff' }} />
            </div>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>To Date *</label>
              <input type="date" required value={formData.to_date} onChange={e => setFormData({ ...formData, to_date: e.target.value })}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff' }} />
            </div>
          </div>
          {isOD ? (
            <>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Event Name *</label>
                <input required value={formData.event_name} onChange={e => setFormData({ ...formData, event_name: e.target.value })}
                  placeholder="e.g., National Level Hackathon at IIT Madras"
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Event Type</label>
                  <select value={formData.event_type} onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                    style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff' }}>
                    {['Symposium', 'Hackathon', 'Sports', 'Cultural', 'Conference', 'Workshop', 'Other'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Venue</label>
                  <input value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="Event venue / college"
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff' }} />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Leave Type</label>
              <select value={formData.leave_type} onChange={e => setFormData({ ...formData, leave_type: e.target.value })}
                style={{ width: '100%', background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff' }}>
                {['Medical', 'Personal', 'Emergency', 'Family'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>Reason *</label>
            <textarea required value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })}
              rows={3} placeholder="Briefly describe your reason..."
              style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '8px 12px', color: '#fff', resize: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              Cancel
            </button>
            <button type="submit" disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, background: '#B22222', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              {loading ? 'Submitting...' : `Submit ${type} Request`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Change Password Modal ───────────────────────────────────────────────────
function ChangePasswordModal({ registerNumber, forceChange = false, onClose, onSuccess }) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPass !== confirmPass) { setError('Passwords do not match.'); return; }
    if (newPass.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/change-student-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ register_number: registerNumber, old_password: oldPass, new_password: newPass })
      });
      if (res.ok) { onSuccess('Password changed successfully!'); onClose(); }
      else { const d = await res.json(); setError(d.detail || 'Failed to change password'); }
    } catch { setError('Backend unavailable — password change simulated.'); onSuccess('Password changed!'); onClose(); }
    setLoading(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(8px)' }}>
      <div style={{ background: '#0f172a', border: `2px solid ${forceChange ? '#f59e0b' : '#B22222'}`, borderRadius: 20, padding: 36, width: 440 }}>
        <h3 style={{ color: forceChange ? '#f59e0b' : '#fff', fontSize: '1.2rem', fontWeight: 800, marginBottom: 8 }}>
          {forceChange ? '🔐 Set Your Password' : '🔑 Change Password'}
        </h3>
        {forceChange && <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 20 }}>
          For your security, please change your default password before continuing.
        </p>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {error && <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem' }}>{error}</div>}
          {[
            { label: forceChange ? 'Default Password (Register Number)' : 'Current Password', val: oldPass, set: setOldPass },
            { label: 'New Password', val: newPass, set: setNewPass },
            { label: 'Confirm New Password', val: confirmPass, set: setConfirmPass }
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'block', marginBottom: 4 }}>{label}</label>
              <input type="password" required value={val} onChange={e => set(e.target.value)}
                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 14px', color: '#fff' }} />
            </div>
          ))}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            {!forceChange && <button type="button" onClick={onClose} style={{ padding: '10px 20px', borderRadius: 8, background: 'rgba(255,255,255,0.06)', color: '#fff', border: 'none', cursor: 'pointer' }}>Cancel</button>}
            <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: 8, background: forceChange ? '#f59e0b' : '#B22222', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 700 }}>
              {loading ? 'Saving...' : 'Set New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STUDENT PORTAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function StudentPortal({ userSession = {}, onSignOut }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashData, setDashData] = useState(null);
  const [marksData, setMarksData] = useState(null);
  const [attData, setAttData] = useState(null);
  const [placementData, setPlacementData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [docsData, setDocsData] = useState(null);
  const [leaveReqs, setLeaveReqs] = useState([]);
  const [odReqs, setOdReqs] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showODModal, setShowODModal] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);

  const regNo = userSession?.registerNumber || '922521104001';
  const firstName = (userSession?.fullName || 'Student').split(' ')[0];
  const isFirstLogin = userSession?.firstLogin || false;

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 4000); };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [dash, marks, att, placement, fee, docs, leaves, ods, notifs] = await Promise.allSettled([
        fetch(`${API}/student-portal/dashboard/${regNo}`).then(r => r.json()),
        fetch(`${API}/student-portal/marks/${regNo}`).then(r => r.json()),
        fetch(`${API}/student-portal/attendance/${regNo}`).then(r => r.json()),
        fetch(`${API}/student-portal/placement/${regNo}`).then(r => r.json()),
        fetch(`${API}/student-portal/fee/${regNo}`).then(r => r.json()),
        fetch(`${API}/student-portal/documents/${regNo}`).then(r => r.json()),
        fetch(`${API}/student-portal/leave-requests/${regNo}`).then(r => r.json()),
        fetch(`${API}/student-portal/od-requests/${regNo}`).then(r => r.json()),
        fetch(`${API}/student-portal/notifications/${regNo}`).then(r => r.json()),
      ]);
      if (dash.status === 'fulfilled') setDashData(dash.value);
      if (marks.status === 'fulfilled') setMarksData(marks.value);
      if (att.status === 'fulfilled') setAttData(att.value);
      if (placement.status === 'fulfilled') setPlacementData(placement.value);
      if (fee.status === 'fulfilled') setFeeData(fee.value);
      if (docs.status === 'fulfilled') setDocsData(docs.value);
      if (leaves.status === 'fulfilled') setLeaveReqs(Array.isArray(leaves.value) ? leaves.value : []);
      if (ods.status === 'fulfilled') setOdReqs(Array.isArray(ods.value) ? ods.value : []);
      if (notifs.status === 'fulfilled') setNotifications(notifs.value?.notifications || []);
    } catch {}

    // Demo fallback
    if (!dashData) {
      setDashData({
        student: {
          full_name: userSession?.fullName || 'Aarav Sharma',
          register_number: regNo,
          roll_number: '21AD001',
          department: 'Artificial Intelligence & Data Science',
          department_code: 'AIDS',
          batch: '2021-2025',
          current_year: 3, current_semester: 6,
          mentor: 'Dr. K. Senthil Kumar',
          class_advisor: 'Prof. M. Rajesh',
          counsellor: 'Dr. R. Priya',
          email: 'aarav.sharma@vsb.ac.in',
          phone: '+91 98765 43210',
          blood_group: 'O+',
          hosteller: true,
          bus_route: 'Route No. 4 (Karur Bus Stand)',
          scholarship: 'Government First Graduate',
          nationality: 'Indian', religion: 'Hindu', community: 'BC',
          father_name: 'Suresh Sharma', mother_name: 'Lakshmi Sharma',
          parent_phone: '+91 98765 00001',
        },
        academics: { cgpa: 8.92, sgpa: 9.10, department_rank: 2, arrears_count: 0, credits_earned: 156, sgpa_progression: [{semester:1,sgpa:8.2},{semester:2,sgpa:8.6},{semester:3,sgpa:8.9},{semester:4,sgpa:9.0},{semester:5,sgpa:8.8},{semester:6,sgpa:9.1}] },
        attendance: { overall_percentage: 95.4, present: 182, absent: 9, od: 3 },
        placement: { status: 'Placed in Tier-1 Company', company: 'Zoho Corporation', package: '12.5 LPA', score: 95 },
        fee: { status: 'Paid', balance: 0 },
        requests: { pending_leaves: 0, pending_od: 1 },
        parent: { father_name: 'Suresh Sharma', mother_name: 'Lakshmi Sharma', parent_phone: '+91 98765 00001' }
      });
      setMarksData({
        cgpa: 8.92, sgpa: 9.10, department_rank: 2, arrears: 0, credits_earned: 156,
        internal_marks: [
          { subject_id: 'sub1', ia1: 45, ia2: 48, ia3: 46, average: 46.3 },
          { subject_id: 'sub2', ia1: 42, ia2: 44, ia3: 45, average: 43.7 },
        ],
        assignment_marks: [
          { subject_id: 'sub1', a1: 9, a2: 10, average: 9.5 },
          { subject_id: 'sub2', a1: 8, a2: 9, average: 8.5 },
        ],
        lab_marks: [
          { semester: 5, lab_name: 'DBMS Lab', cycle_test_1: 46, cycle_test_2: 48, viva: 45, record: 50, total: 189, max_marks: 200 },
          { semester: 6, lab_name: 'Deep Learning Lab', cycle_test_1: 48, cycle_test_2: 50, viva: 47, record: 50, total: 195, max_marks: 200 },
        ],
        model_exam_marks: [
          { semester: 6, subject_name: 'ML Fundamentals', marks: 82, max_marks: 100, grade: 'A+' },
          { semester: 6, subject_name: 'Data Analytics', marks: 78, max_marks: 100, grade: 'A' },
        ],
        semester_marks: [
          { semester: 1, subject_id: 'sub-s1-1', marks: 82, grade: 'A', credits: 4, result: 'PASS' },
          { semester: 2, subject_id: 'sub-s2-1', marks: 88, grade: 'A+', credits: 4, result: 'PASS' },
          { semester: 3, subject_id: 'sub-s3-1', marks: 85, grade: 'A', credits: 4, result: 'PASS' },
          { semester: 4, subject_id: 'sub-s4-1', marks: 90, grade: 'O', credits: 4, result: 'PASS' },
          { semester: 5, subject_id: 'sub-s5-1', marks: 86, grade: 'A+', credits: 4, result: 'PASS' },
          { semester: 6, subject_id: 'sub-s6-1', marks: 91, grade: 'O', credits: 4, result: 'PASS' },
        ],
        sgpa_records: [{semester:1,sgpa:8.2},{semester:2,sgpa:8.6},{semester:3,sgpa:8.9},{semester:4,sgpa:9.0},{semester:5,sgpa:8.8},{semester:6,sgpa:9.1}],
      });
      setAttData({ overall_percentage: 95.4, total_classes: 194, present_days: 182, absent_days: 9, od_days: 3, medical_leave_days: 0, late_entries: 2, shortage_risk: false, daily_records: [] });
      setFeeData({ admission_fee: 15000, tuition_fee: 85000, exam_fee: 3500, bus_fee: 0, hostel_fee: 45000, scholarship: 25000, balance: 0, payment_status: 'Paid', net_payable: 78500 });
      setNotifications([
        { id: '1', title: '📢 Internal Assessment 3 Results Published', message: 'IA3 marks for all subjects are now visible in your portal.', created_at: new Date().toISOString() },
        { id: '2', title: '🏆 Placement Drive — Infosys on Campus', message: 'Infosys campus recruitment drive scheduled for 12th August 2026.', created_at: new Date().toISOString() },
        { id: '3', title: '📋 Semester Exam Fee Reminder', message: 'Last date to pay semester exam fee: 15th August 2026.', created_at: new Date().toISOString() },
      ]);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, [regNo]);

  const st = dashData?.student || {};
  const acad = dashData?.academics || {};
  const att = dashData?.attendance || {};
  const place = dashData?.placement || {};
  const fee = dashData?.fee || {};

  // NAV TABS
  const tabs = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'profile', icon: '👤', label: 'Profile' },
    { key: 'attendance', icon: '📅', label: 'Attendance' },
    { key: 'marks', icon: '📊', label: 'Marks & Grades' },
    { key: 'placement', icon: '🏢', label: 'Placement' },
    { key: 'fee', icon: '💳', label: 'Fee Status' },
    { key: 'documents', icon: '📁', label: 'Documents' },
    { key: 'requests', icon: '📝', label: 'Leave / OD' },
    { key: 'notifications', icon: '🔔', label: 'Notifications' },
  ];

  const gradeColor = (g) => {
    if (g === 'O' || g === 'A+') return '#34d399';
    if (g === 'A') return '#60a5fa';
    if (g === 'B+') return '#f59e0b';
    return '#94a3b8';
  };

  const statusBadge = (s) => {
    const map = { 'Pending': { bg: '#92400e', color: '#fbbf24' }, 'Approved': { bg: '#065f46', color: '#34d399' }, 'Rejected': { bg: '#7f1d1d', color: '#f87171' } };
    const c = map[s] || map['Pending'];
    return <span style={{ padding: '3px 10px', borderRadius: 99, background: c.bg, color: c.color, fontSize: '0.75rem', fontWeight: 700 }}>{s}</span>;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#DED9D0', color: '#252525', fontFamily: "'Inter', sans-serif" }}>
      
      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8, background: '#2E7D32', color: '#FFFFFF', fontWeight: 700, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 9999, border: '1px solid #A5D6A7' }}>
          ✅ {toastMsg}
        </div>
      )}

      {/* Force Password Change on First Login */}
      {isFirstLogin && (
        <ChangePasswordModal registerNumber={regNo} forceChange onClose={() => {}} onSuccess={showToast} />
      )}

      {/* Change Password Modal */}
      {showChangePass && (
        <ChangePasswordModal registerNumber={regNo} onClose={() => setShowChangePass(false)} onSuccess={showToast} />
      )}

      {/* Leave Modal */}
      {showLeaveModal && (
        <RequestModal type="Leave" studentId={dashData?.student?.id || ''} onClose={() => setShowLeaveModal(false)} onSuccess={showToast} />
      )}

      {/* OD Modal */}
      {showODModal && (
        <RequestModal type="OD" studentId={dashData?.student?.id || ''} onClose={() => setShowODModal(false)} onSuccess={showToast} />
      )}

      {/* ─── Header ─── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#F1EDE5',
        borderBottom: '1px solid #D49A17',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: 64,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <VSBLogo size={36} showTitle lightTheme={true} />
          <div style={{ width: 1, height: 30, background: '#E8E1D7' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: '#6E0F0F', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 800 }}>Student Portal</div>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#252525' }}>Welcome back, {firstName} 👋</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ padding: '4px 12px', borderRadius: 99, background: '#F5E8CC', border: '1px solid #D49A17', color: '#6E0F0F', fontSize: '0.78rem', fontWeight: 700 }}>
            🎓 {st.department_code || 'AIDS'} · Yr {st.current_year || 3}
          </span>
          <button onClick={() => setShowChangePass(true)} style={{ padding: '6px 12px', borderRadius: 6, background: '#F1EDE5', color: '#6E0F0F', border: '1px solid #D49A17', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
            🔑 Change Pass
          </button>
          <button onClick={onSignOut} style={{ padding: '6px 14px', borderRadius: 6, background: '#6E0F0F', color: '#FFFFFF', border: '1px solid #4B0808', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* ─── Layout ─── */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>

        {/* Global Sidebar - Dark Maroon Design System */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: '#4B0808',
          borderRight: '1px solid #D49A17',
          padding: '20px 12px',
          display: 'flex', flexDirection: 'column', gap: 4,
          position: 'sticky', top: 64, alignSelf: 'flex-start', height: 'calc(100vh - 64px)'
        }}>
          {/* Student Photo */}
          <div style={{ textAlign: 'center', padding: '16px 8px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: 8 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#F5E8CC', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, margin: '0 auto 8px', border: '2px solid #D49A17', color: '#6E0F0F' }}>
              🎓
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FFFFFF' }}>{st.full_name || firstName}</div>
            <div style={{ color: '#D49A17', fontSize: '0.75rem', fontWeight: 700 }}>{regNo}</div>
          </div>

          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              background: activeTab === tab.key ? '#F5E8CC' : 'transparent',
              color: activeTab === tab.key ? '#6E0F0F' : '#FFFFFF',
              fontWeight: activeTab === tab.key ? 800 : 500,
              fontSize: '0.85rem',
              borderLeft: activeTab === tab.key ? '4px solid #D49A17' : '4px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '1rem', color: activeTab === tab.key ? '#6E0F0F' : '#D49A17' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </aside>


        {/* Main Content */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <div style={{ fontSize: 40, marginBottom: 16, animation: 'spin 1s linear infinite' }}>⚙️</div>
              <p>Loading your dashboard...</p>
            </div>
          ) : (

            // ─────────────────────────────────────────────────
            // TAB: DASHBOARD
            // ─────────────────────────────────────────────────
            activeTab === 'dashboard' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 4 }}>
                    Good Evening, {firstName}! 🌟
                  </h1>
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    {st.department} · Batch {st.batch} · Semester {st.current_semester}
                  </p>
                </div>

                {/* Stat Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
                  <StatCard icon="📊" label="CGPA" value={acad.cgpa || 8.92} color="#B22222" sub="Current CGPA" />
                  <StatCard icon="📈" label="SGPA (Sem 6)" value={acad.sgpa || 9.10} color="#6366f1" sub="This Semester" trend={0.2} />
                  <StatCard icon="🏆" label="Dept. Rank" value={`#${acad.department_rank || 2}`} color="#f59e0b" sub="Out of 60 students" />
                  <StatCard icon="📅" label="Attendance" value={`${att.overall_percentage || 95.4}%`} color={att.overall_percentage >= 75 ? '#34d399' : '#ef4444'} sub={att.shortage_risk ? '⚠️ Below 75%!' : 'Good Standing'} />
                  <StatCard icon="⚠️" label="Arrears" value={acad.arrears_count || 0} color={acad.arrears_count > 0 ? '#ef4444' : '#34d399'} sub="Active Arrears" />
                  <StatCard icon="🏅" label="Credits" value={acad.credits_earned || 156} color="#10b981" sub="Credits Earned" />
                </div>

                {/* Attendance Donut + SGPA Chart */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>📅 Attendance Overview</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <AttendanceDonut percentage={att.overall_percentage || 95.4} />
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { label: 'Present', val: att.present || 182, color: '#34d399' },
                          { label: 'Absent', val: att.absent || 9, color: '#ef4444' },
                          { label: 'OD', val: att.od || 3, color: '#60a5fa' },
                        ].map(item => (
                          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>{item.label}</span>
                            <span style={{ color: item.color, fontWeight: 700, fontSize: '0.88rem' }}>{item.val} days</span>
                          </div>
                        ))}
                        {att.shortage_risk && (
                          <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, color: '#f87171', fontSize: '0.78rem', marginTop: 4 }}>
                            ⚠️ Attendance below 75%! Risk of exam block.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>📈 SGPA Progression</h3>
                    <SGPAChart records={acad.sgpa_progression || marksData?.sgpa_records || []} />
                  </div>
                </div>

                {/* Placement Status + Quick Info */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: `1px solid ${place.company ? '#34d39930' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>🏢 Placement Status</h3>
                    {place.company ? (
                      <div>
                        <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399', marginBottom: 8 }}>✅ Placed!</div>
                        <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1.1rem' }}>{place.company}</div>
                        <div style={{ color: '#f59e0b', fontSize: '1.4rem', fontWeight: 900, marginTop: 4 }}>{place.package}</div>
                        <div style={{ color: '#64748b', fontSize: '0.82rem', marginTop: 4 }}>Annual Package</div>
                        {place.score && (
                          <div style={{ marginTop: 12 }}>
                            <ProgressBar value={place.score} max={100} color="#34d399" label="Assessment Score" />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '1rem', color: '#f59e0b', fontWeight: 700, marginBottom: 8 }}>{place.status || 'Eligible & Preparing'}</div>
                        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Keep your CGPA above 7.5 and complete all placement training modules.</p>
                      </div>
                    )}
                  </div>

                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12, color: '#e2e8f0' }}>📋 Quick Info</h3>
                    {[
                      { label: 'Mentor', val: st.mentor },
                      { label: 'Class Advisor', val: st.class_advisor },
                      { label: 'Counsellor', val: st.counsellor },
                      { label: 'Accommodation', val: st.hosteller ? `Hosteller · ${st.bus_route || ''}` : `Day Scholar · ${st.bus_route || ''}` },
                      { label: 'Scholarship', val: st.scholarship },
                      { label: 'Fee Status', val: fee.status },
                    ].map(item => item.val && (
                      <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.85rem' }}>
                        <span style={{ color: '#64748b' }}>{item.label}</span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600, maxWidth: 160, textAlign: 'right' }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Notifications */}
                {notifications.length > 0 && (
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16, color: '#e2e8f0' }}>🔔 Recent Notifications</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {notifications.slice(0, 3).map(n => (
                        <div key={n.id} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, borderLeft: '3px solid #B22222' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.88rem', marginBottom: 2 }}>{n.title}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{n.message}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )

            // ─────────────────────────────────────────────────
            // TAB: PROFILE
            // ─────────────────────────────────────────────────
            : activeTab === 'profile' ? (
              <div style={{ maxWidth: 900 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>👤 Student Biodata</h2>
                {[
                  {
                    title: '📋 Personal Information',
                    color: '#B22222',
                    fields: [
                      ['Register Number', st.register_number], ['Roll Number', st.roll_number],
                      ['Full Name', st.full_name], ['Date of Birth', st.dob],
                      ['Gender', st.gender], ['Blood Group', st.blood_group],
                      ['Nationality', st.nationality], ['Religion', st.religion],
                      ['Community', st.community], ['Email', st.email],
                      ['Phone', st.phone],
                    ]
                  },
                  {
                    title: '🎓 Academic Information',
                    color: '#6366f1',
                    fields: [
                      ['Department', st.department], ['Program', dashData?.student?.program],
                      ['Batch', st.batch], ['Current Year', st.current_year],
                      ['Current Semester', st.current_semester], ['Academic Year', st.academic_year],
                      ['Mentor', st.mentor], ['Class Advisor', st.class_advisor],
                      ['Counsellor', st.counsellor], ['Scholarship', st.scholarship],
                    ]
                  },
                  {
                    title: '🏠 Address & Accommodation',
                    color: '#10b981',
                    fields: [
                      ['Accommodation', st.hosteller ? 'Hosteller' : 'Day Scholar'],
                      ['Bus Route', st.bus_route],
                    ]
                  },
                  {
                    title: '👨‍👩‍👧 Parent / Guardian Details',
                    color: '#f59e0b',
                    fields: [
                      ['Father Name', dashData?.parent?.father_name], ['Mother Name', dashData?.parent?.mother_name],
                      ['Guardian Name', dashData?.parent?.guardian_name], ['Parent Phone', dashData?.parent?.parent_phone],
                      ['Parent Email', dashData?.parent?.parent_email],
                    ]
                  },
                ].map(section => (
                  <div key={section.title} style={{ background: 'rgba(15,23,42,0.95)', border: `1px solid ${section.color}20`, borderRadius: 16, padding: 24, marginBottom: 16 }}>
                    <h3 style={{ color: section.color, fontWeight: 800, fontSize: '1rem', marginBottom: 16, borderBottom: `1px solid ${section.color}20`, paddingBottom: 8 }}>{section.title}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
                      {section.fields.filter(([, v]) => v).map(([label, val]) => (
                        <div key={label}>
                          <div style={{ color: '#64748b', fontSize: '0.75rem', letterSpacing: '0.03em', textTransform: 'uppercase', marginBottom: 2 }}>{label}</div>
                          <div style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.9rem' }}>{String(val)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )

            // ─────────────────────────────────────────────────
            // TAB: ATTENDANCE
            // ─────────────────────────────────────────────────
            : activeTab === 'attendance' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>📅 Attendance Details</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                  <StatCard icon="📅" label="Overall %" value={`${attData?.overall_percentage || 95.4}%`} color={attData?.overall_percentage >= 75 ? '#34d399' : '#ef4444'} />
                  <StatCard icon="✅" label="Present Days" value={attData?.present_days || 182} color="#34d399" />
                  <StatCard icon="❌" label="Absent Days" value={attData?.absent_days || 9} color="#ef4444" />
                  <StatCard icon="🔄" label="OD Days" value={attData?.od_days || 3} color="#60a5fa" />
                  <StatCard icon="🏥" label="Medical Leave" value={attData?.medical_leave_days || 0} color="#a78bfa" />
                  <StatCard icon="⏰" label="Late Entries" value={attData?.late_entries || 2} color="#f59e0b" />
                </div>

                {attData?.shortage_risk && (
                  <div style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, color: '#f87171', fontWeight: 700, marginBottom: 20 }}>
                    ⚠️ WARNING: Your attendance is below 75%! You may be barred from semester examinations. Please contact your class advisor immediately.
                  </div>
                )}

                {attData?.daily_records?.length > 0 && (
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontWeight: 700, marginBottom: 16 }}>📋 Daily Attendance Records</h3>
                    <div style={{ maxHeight: 350, overflowY: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                            {['Date', 'Hour', 'Status', 'Type'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left' }}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {attData.daily_records.map((r, i) => (
                            <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                              <td style={{ padding: '8px 12px', color: '#e2e8f0' }}>{r.date}</td>
                              <td style={{ padding: '8px 12px', color: '#94a3b8' }}>Hour {r.hour}</td>
                              <td style={{ padding: '8px 12px' }}>
                                <span style={{ padding: '2px 8px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700, background: r.present ? '#065f46' : r.od ? '#1e3a5f' : '#7f1d1d', color: r.present ? '#34d399' : r.od ? '#60a5fa' : '#f87171' }}>
                                  {r.status}
                                </span>
                              </td>
                              <td style={{ padding: '8px 12px', color: '#64748b' }}>{r.late_entry ? '⏰ Late' : r.medical_leave ? '🏥 Medical' : '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )

            // ─────────────────────────────────────────────────
            // TAB: MARKS
            // ─────────────────────────────────────────────────
            : activeTab === 'marks' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>📊 Marks & Academic Performance</h2>

                {/* Summary Row */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
                  <StatCard icon="🎓" label="CGPA" value={marksData?.cgpa || 8.92} color="#B22222" />
                  <StatCard icon="📈" label="SGPA" value={marksData?.sgpa || 9.10} color="#6366f1" />
                  <StatCard icon="🏆" label="Dept. Rank" value={`#${marksData?.department_rank || 2}`} color="#f59e0b" />
                  <StatCard icon="⚠️" label="Arrears" value={marksData?.arrears || 0} color={marksData?.arrears > 0 ? '#ef4444' : '#34d399'} />
                  <StatCard icon="🏅" label="Credits" value={marksData?.credits_earned || 156} color="#10b981" />
                </div>

                {/* Internal Assessment */}
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                  <h3 style={{ color: '#6366f1', fontWeight: 800, fontSize: '1rem', marginBottom: 16 }}>📝 Internal Assessments</h3>
                  {(marksData?.internal_marks?.length > 0) ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead><tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Subject', 'IA 1 (/50)', 'IA 2 (/50)', 'IA 3 (/50)', 'Average'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left' }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {marksData.internal_marks.map((m, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '10px 12px', color: '#94a3b8', fontSize: '0.8rem' }}>Subject {i + 1}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: m.ia1 >= 40 ? '#34d399' : '#f59e0b' }}>{m.ia1}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: m.ia2 >= 40 ? '#34d399' : '#f59e0b' }}>{m.ia2}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 700, color: m.ia3 >= 40 ? '#34d399' : '#f59e0b' }}>{m.ia3}</td>
                            <td style={{ padding: '10px 12px', fontWeight: 900, color: '#B22222' }}>{m.average}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p style={{ color: '#64748b' }}>No internal marks recorded yet.</p>}
                </div>

                {/* Lab Marks */}
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                  <h3 style={{ color: '#10b981', fontWeight: 800, fontSize: '1rem', marginBottom: 16 }}>🔬 Lab Marks</h3>
                  {(marksData?.lab_marks?.length > 0) ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12 }}>
                      {marksData.lab_marks.map((m, i) => (
                        <div key={i} style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)', borderRadius: 12, padding: 16 }}>
                          <div style={{ fontWeight: 700, color: '#10b981', marginBottom: 8 }}>{m.lab_name || `Lab ${i + 1}`} <span style={{ fontSize: '0.75rem', color: '#64748b' }}>· Sem {m.semester}</span></div>
                          {[['Cycle Test 1', m.cycle_test_1, 50], ['Cycle Test 2', m.cycle_test_2, 50], ['Viva', m.viva, 50], ['Record', m.record, 50]].map(([label, val, max]) => (
                            <ProgressBar key={label} value={val} max={max} color="#10b981" label={label} />
                          ))}
                          <div style={{ marginTop: 8, textAlign: 'right', fontWeight: 900, color: '#10b981' }}>Total: {m.total}/{m.max_marks}</div>
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ color: '#64748b' }}>No lab marks recorded yet.</p>}
                </div>

                {/* Semester-wise Marks */}
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(178,34,34,0.2)', borderRadius: 16, padding: 24, marginBottom: 16 }}>
                  <h3 style={{ color: '#B22222', fontWeight: 800, fontSize: '1rem', marginBottom: 16 }}>📖 Semester Marks (Sem 1 - 8)</h3>
                  {(marksData?.semester_marks?.length > 0) ? (
                    <div>
                      {[...new Set(marksData.semester_marks.map(m => m.semester))].sort().map(sem => (
                        <div key={sem} style={{ marginBottom: 16 }}>
                          <div style={{ color: '#94a3b8', fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semester {sem}</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {marksData.semester_marks.filter(m => m.semester === sem).map((m, i) => (
                              <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 16px', minWidth: 110 }}>
                                <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: 4 }}>Subject {i + 1}</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: gradeColor(m.grade) }}>{m.grade}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{m.marks}/100</div>
                                <div style={{ fontSize: '0.72rem', color: m.result === 'PASS' ? '#34d399' : '#ef4444' }}>{m.result}</div>
                              </div>
                            ))}
                          </div>
                          {marksData.sgpa_records?.find(s => s.semester === sem) && (
                            <div style={{ textAlign: 'right', marginTop: 4, color: '#B22222', fontWeight: 800, fontSize: '0.85rem' }}>
                              SGPA: {marksData.sgpa_records.find(s => s.semester === sem).sgpa}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : <p style={{ color: '#64748b' }}>No semester marks available.</p>}
                </div>
              </div>
            )

            // ─────────────────────────────────────────────────
            // TAB: PLACEMENT
            // ─────────────────────────────────────────────────
            : activeTab === 'placement' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>🏢 Placement Profile</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ color: '#34d399', fontWeight: 800, marginBottom: 16 }}>🏆 Placement Status</h3>
                    {place.company ? (
                      <>
                        <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34d399' }}>✅ Placed</div>
                        <div style={{ color: '#e2e8f0', fontSize: '1.1rem', fontWeight: 700, marginTop: 8 }}>{place.company}</div>
                        <div style={{ color: '#f59e0b', fontSize: '1.8rem', fontWeight: 900, marginTop: 4 }}>{place.package}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Annual Package (CTC)</div>
                      </>
                    ) : (
                      <div style={{ color: '#f59e0b', fontWeight: 700 }}>{place.status || 'Eligible & Preparing'}</div>
                    )}
                  </div>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ color: '#6366f1', fontWeight: 800, marginBottom: 16 }}>📊 Assessment Scores</h3>
                    {[
                      { label: 'Aptitude', val: placementData?.assessment_score || 95 },
                      { label: 'Communication', val: placementData?.communication_score || 94 },
                      { label: 'Technical', val: placementData?.technical_score || 98 },
                    ].map(item => (
                      <div key={item.label} style={{ marginBottom: 12 }}>
                        <ProgressBar value={item.val} max={100} color="#6366f1" label={item.label} />
                      </div>
                    ))}
                  </div>
                  {placementData?.skills && (
                    <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                      <h3 style={{ fontWeight: 800, marginBottom: 12 }}>🛠️ Skills</h3>
                      <p style={{ color: '#94a3b8' }}>{placementData.skills}</p>
                    </div>
                  )}
                  {placementData?.internships && (
                    <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                      <h3 style={{ fontWeight: 800, marginBottom: 12 }}>💼 Internships</h3>
                      <p style={{ color: '#94a3b8' }}>{placementData.internships}</p>
                    </div>
                  )}
                </div>
              </div>
            )

            // ─────────────────────────────────────────────────
            // TAB: FEE
            // ─────────────────────────────────────────────────
            : activeTab === 'fee' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>💳 Fee Status</h2>
                <div style={{ maxWidth: 600 }}>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Fee Breakdown</span>
                      <span style={{ padding: '4px 14px', borderRadius: 99, background: feeData?.payment_status === 'Paid' ? '#065f46' : '#7f1d1d', color: feeData?.payment_status === 'Paid' ? '#34d399' : '#f87171', fontWeight: 700, fontSize: '0.85rem' }}>
                        {feeData?.payment_status || 'Paid'}
                      </span>
                    </div>
                    {[
                      ['Admission Fee', feeData?.admission_fee],
                      ['Tuition Fee', feeData?.tuition_fee],
                      ['Exam Fee', feeData?.exam_fee],
                      ['Bus Fee', feeData?.bus_fee],
                      ['Hostel Fee', feeData?.hostel_fee],
                    ].map(([label, amount]) => amount !== undefined && (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>
                        <span style={{ color: '#94a3b8' }}>{label}</span>
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>₹{Number(amount).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(52,211,153,0.3)', fontSize: '0.9rem' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>Scholarship Deduction</span>
                      <span style={{ fontWeight: 700, color: '#34d399' }}>-₹{Number(feeData?.scholarship || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 0 0', fontSize: '1.1rem', fontWeight: 900 }}>
                      <span>Net Payable</span>
                      <span style={{ color: '#B22222' }}>₹{Number(feeData?.net_payable || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: '1rem', fontWeight: 800 }}>
                      <span>Balance Due</span>
                      <span style={{ color: feeData?.balance > 0 ? '#ef4444' : '#34d399' }}>₹{Number(feeData?.balance || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )

            // ─────────────────────────────────────────────────
            // TAB: DOCUMENTS
            // ─────────────────────────────────────────────────
            : activeTab === 'documents' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>📁 Document Vault</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                  {(docsData?.documents || [
                    { name: '10th Marksheet', available: true }, { name: '12th Marksheet', available: true },
                    { name: 'Transfer Certificate', available: true }, { name: 'Community Certificate', available: true },
                    { name: 'Income Certificate', available: false }, { name: 'Bonafide Certificate', available: true },
                    { name: 'Birth Certificate', available: false }, { name: 'Medical Certificate', available: false },
                    { name: 'Internship Certificates', available: true }, { name: 'NCC/NSS Certificates', available: false },
                    { name: 'Sports Certificates', available: false }, { name: 'Hackathon Certificates', available: true },
                  ]).map(doc => (
                    <div key={doc.name} style={{
                      background: 'rgba(15,23,42,0.95)',
                      border: `1px solid ${doc.available ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: 12, padding: '16px 20px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontSize: '1.3rem' }}>{doc.available ? '📄' : '📋'}</span>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>{doc.name}</div>
                          <div style={{ fontSize: '0.72rem', color: doc.available ? '#34d399' : '#64748b' }}>
                            {doc.available ? 'Available' : 'Not Uploaded'}
                          </div>
                        </div>
                      </div>
                      {doc.available ? (
                        <button style={{ padding: '5px 10px', borderRadius: 7, background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700 }}>
                          ⬇ Download
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Pending</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )

            // ─────────────────────────────────────────────────
            // TAB: LEAVE / OD REQUESTS
            // ─────────────────────────────────────────────────
            : activeTab === 'requests' ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>📝 Leave & OD Requests</h2>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={() => setShowLeaveModal(true)} style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(178,34,34,0.15)', color: '#f87171', border: '1px solid rgba(178,34,34,0.3)', cursor: 'pointer', fontWeight: 700 }}>
                      + Apply Leave
                    </button>
                    <button onClick={() => setShowODModal(true)} style={{ padding: '9px 18px', borderRadius: 10, background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)', cursor: 'pointer', fontWeight: 700 }}>
                      + Submit OD
                    </button>
                  </div>
                </div>

                {/* Leave Requests */}
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24, marginBottom: 20 }}>
                  <h3 style={{ fontWeight: 800, marginBottom: 14 }}>📋 Leave Requests</h3>
                  {leaveReqs.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead><tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['From', 'To', 'Type', 'Reason', 'Status', 'Approved By'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left' }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {leaveReqs.map(r => (
                          <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '9px 10px' }}>{r.from_date}</td>
                            <td style={{ padding: '9px 10px' }}>{r.to_date}</td>
                            <td style={{ padding: '9px 10px', color: '#94a3b8' }}>{r.leave_type}</td>
                            <td style={{ padding: '9px 10px', color: '#94a3b8', maxWidth: 200 }}>{r.reason?.slice(0, 50)}...</td>
                            <td style={{ padding: '9px 10px' }}>{statusBadge(r.status)}</td>
                            <td style={{ padding: '9px 10px', color: '#64748b' }}>{r.approved_by || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p style={{ color: '#64748b' }}>No leave requests submitted yet.</p>}
                </div>

                {/* OD Requests */}
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontWeight: 800, marginBottom: 14 }}>📋 OD (On Duty) Requests</h3>
                  {odReqs.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead><tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['Event', 'Type', 'Dates', 'Venue', 'Status'].map(h => <th key={h} style={{ padding: '8px 10px', textAlign: 'left' }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {odReqs.map(r => (
                          <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '9px 10px', fontWeight: 600 }}>{r.event_name}</td>
                            <td style={{ padding: '9px 10px', color: '#94a3b8' }}>{r.event_type}</td>
                            <td style={{ padding: '9px 10px', color: '#94a3b8' }}>{r.from_date} → {r.to_date}</td>
                            <td style={{ padding: '9px 10px', color: '#64748b' }}>{r.venue || '—'}</td>
                            <td style={{ padding: '9px 10px' }}>{statusBadge(r.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p style={{ color: '#64748b' }}>No OD requests submitted yet.</p>}
                </div>
              </div>
            )

            // ─────────────────────────────────────────────────
            // TAB: NOTIFICATIONS
            // ─────────────────────────────────────────────────
            : activeTab === 'notifications' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>🔔 Notifications</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 800 }}>
                  {notifications.length > 0 ? notifications.map(n => (
                    <div key={n.id} style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 22px', borderLeft: '4px solid #B22222' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 6 }}>{n.title}</div>
                      <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 8 }}>{n.message}</div>
                      <div style={{ color: '#475569', fontSize: '0.72rem' }}>{new Date(n.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                    </div>
                  )) : <p style={{ color: '#64748b' }}>No notifications yet.</p>}
                </div>
              </div>
            )

            : null
          )}
        </main>
      </div>
    </div>
  );
}
