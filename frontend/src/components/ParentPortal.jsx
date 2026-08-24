import React, { useState, useEffect } from 'react';
import VSBLogo from './VSBLogo.jsx';

const API = 'http://127.0.0.1:8000/api/v1';

// ─── Stat Card ───────────────────────────────────────────────────────────────
function ParentStatCard({ icon, label, value, color = '#720F0F', sub = null }) {
  return (
    <div style={{
      background: '#FAF7F0',
      border: '1px solid #D8CEBE',
      borderLeft: `4px solid ${color}`,
      borderRadius: 12,
      padding: '18px 20px',
      position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ position: 'absolute', top: -15, right: -15, fontSize: 60, opacity: 0.05 }}>{icon}</div>
      <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: '1.7rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
      <div style={{ color: '#5C5750', fontSize: '0.82rem', marginTop: 4, fontWeight: 600 }}>{label}</div>
      {sub && <div style={{ color: '#777168', fontSize: '0.73rem', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

// ─── Attendance Ring ─────────────────────────────────────────────────────────
function AttRing({ pct }) {
  const p = Math.min(100, Math.max(0, pct));
  const r = 40, cx = 50, cy = 50, c = 2 * Math.PI * r;
  const dash = (p / 100) * c;
  const col = p >= 75 ? '#34d399' : p >= 65 ? '#f59e0b' : '#ef4444';
  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={8} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={col} strokeWidth={8}
        strokeDasharray={`${dash} ${c - dash}`} strokeDashoffset={c / 4} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1.5s ease' }} />
      <text x={cx} y={cy + 4} textAnchor="middle" fontSize="13" fontWeight="900" fill={col}>{p}%</text>
      <text x={cx} y={cy + 15} textAnchor="middle" fontSize="7" fill="#64748b">ATTEND.</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PARENT PORTAL COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function ParentPortal({ userSession = {}, onSignOut }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [dashData, setDashData] = useState(null);
  const [marksData, setMarksData] = useState(null);
  const [attData, setAttData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [leaveReqs, setLeaveReqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState(null);

  const regNo = userSession?.registerNumber || '922521104001';
  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(null), 4000); };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [dash, marks, att, fee, notifs, leaves] = await Promise.allSettled([
          fetch(`${API}/student-portal/dashboard/${regNo}`).then(r => r.json()),
          fetch(`${API}/student-portal/marks/${regNo}`).then(r => r.json()),
          fetch(`${API}/student-portal/attendance/${regNo}`).then(r => r.json()),
          fetch(`${API}/student-portal/fee/${regNo}`).then(r => r.json()),
          fetch(`${API}/student-portal/notifications/${regNo}`).then(r => r.json()),
          fetch(`${API}/student-portal/leave-requests/${regNo}`).then(r => r.json()),
        ]);
        if (dash.status === 'fulfilled') setDashData(dash.value);
        if (marks.status === 'fulfilled') setMarksData(marks.value);
        if (att.status === 'fulfilled') setAttData(att.value);
        if (fee.status === 'fulfilled') setFeeData(fee.value);
        if (notifs.status === 'fulfilled') setNotifications(notifs.value?.notifications || []);
        if (leaves.status === 'fulfilled') setLeaveReqs(Array.isArray(leaves.value) ? leaves.value : []);
      } catch {}

      // Demo fallback
      setDashData(prev => prev || {
        student: {
          full_name: 'Aarav Sharma',
          register_number: regNo,
          roll_number: '21AD001',
          department: 'Artificial Intelligence & Data Science',
          department_code: 'AIDS',
          batch: '2021-2025',
          current_year: 3, current_semester: 6,
          email: 'aarav.sharma@vsb.ac.in',
          phone: '+91 98765 43210',
          blood_group: 'O+',
          hosteller: true,
          bus_route: 'Route No. 4 (Karur Bus Stand)',
          mentor: 'Dr. K. Senthil Kumar',
          class_advisor: 'Prof. M. Rajesh',
          status: 'Active',
        },
        academics: { cgpa: 8.92, sgpa: 9.10, department_rank: 2, arrears_count: 0, credits_earned: 156 },
        attendance: { overall_percentage: 95.4, present: 182, absent: 9, od: 3, shortage_risk: false },
        placement: { status: 'Placed in Tier-1 Company', company: 'Zoho Corporation', package: '12.5 LPA' },
        fee: { status: 'Paid', balance: 0 },
        requests: { pending_leaves: 0, pending_od: 1 },
        parent: { father_name: 'Suresh Sharma', mother_name: 'Lakshmi Sharma', parent_phone: '+91 98765 00001' }
      });
      setMarksData(prev => prev || { cgpa: 8.92, sgpa: 9.10, arrears: 0, credits_earned: 156, department_rank: 2 });
      setAttData(prev => prev || { overall_percentage: 95.4, present_days: 182, absent_days: 9, od_days: 3, shortage_risk: false });
      setFeeData(prev => prev || { admission_fee: 15000, tuition_fee: 85000, exam_fee: 3500, bus_fee: 0, hostel_fee: 45000, scholarship: 25000, balance: 0, payment_status: 'Paid', net_payable: 78500 });
      setNotifications(prev => prev.length ? prev : [
        { id: '1', title: '📢 IA3 Results Published', message: 'Internal Assessment 3 results are now available.', created_at: new Date().toISOString() },
        { id: '2', title: '🏆 Placement Offer Received', message: 'Your ward has received an offer from Zoho Corporation — 12.5 LPA.', created_at: new Date().toISOString() },
        { id: '3', title: '📋 Fee Reminder', message: 'All fees are cleared. No balance due.', created_at: new Date().toISOString() },
      ]);
      setLoading(false);
    };
    loadData();
  }, [regNo]);

  const st = dashData?.student || {};
  const acad = dashData?.academics || {};
  const att = dashData?.attendance || {};
  const place = dashData?.placement || {};
  const fee = dashData?.fee || {};

  const TABS = [
    { key: 'overview', icon: '🏠', label: 'Ward Overview' },
    { key: 'attendance', icon: '📅', label: 'Attendance' },
    { key: 'academics', icon: '📊', label: 'Academic Performance' },
    { key: 'placement', icon: '🏢', label: 'Placement' },
    { key: 'fee', icon: '💳', label: 'Fee Status' },
    { key: 'requests', icon: '📝', label: 'Leave Requests' },
    { key: 'notifications', icon: '🔔', label: 'Notifications' },
  ];

  const alertColor = att.shortage_risk ? '#ef4444' : '#34d399';

  return (
    <div style={{ minHeight: '100vh', background: '#EDE7DC', color: '#2B2926', fontFamily: "var(--font-sans)" }}>

      {/* Toast */}
      {toastMsg && (
        <div style={{ position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8, background: '#24733E', color: '#FFFFFF', fontWeight: 700, boxShadow: '0 4px 16px rgba(36,115,62,0.3)', zIndex: 9999, border: '1px solid #24733E' }}>
          ✅ {toastMsg}
        </div>
      )}

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#FAF6EE',
        borderBottom: '1.5px solid #D8CEBE',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64,
        boxShadow: '0 2px 8px rgba(60,40,20,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <VSBLogo size={36} showTitle lightTheme={true} />
          <div style={{ width: 1, height: 30, background: '#D8CEBE' }} />
          <div>
            <div style={{ fontSize: '0.76rem', color: '#777168', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Parent / Guardian Portal</div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#720F0F' }}>Monitoring Ward: {st.full_name || 'Student'}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ padding: '4px 12px', borderRadius: 99, background: '#F9EED4', border: '1px solid #D69A18', color: '#720F0F', fontSize: '0.78rem', fontWeight: 700 }}>
            👨‍👩‍👧 Parent View
          </span>
          <button onClick={onSignOut} style={{ padding: '6px 14px', borderRadius: 6, background: '#FAF7F0', color: '#720F0F', border: '1px solid #D8CEBE', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700 }}>
            Sign Out
          </button>
        </div>
      </header>

      {/* Layout */}
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>

        {/* Sidebar */}
        <aside style={{
          width: 220, flexShrink: 0,
          background: '#4B0909',
          borderRight: '1px solid #D8CEBE',
          padding: '20px 12px',
          display: 'flex', flexDirection: 'column', gap: 4,
          position: 'sticky', top: 64, alignSelf: 'flex-start', height: 'calc(100vh - 64px)'
        }}>
          {/* Ward Card */}
          <div style={{ textAlign: 'center', padding: '16px 8px 20px', borderBottom: '1px solid rgba(255,255,255,0.12)', marginBottom: 8 }}>
            <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#720F0F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 8px', border: '2px solid #D69A18' }}>
              🎓
            </div>
            <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FFFFFF' }}>{st.full_name || 'Your Ward'}</div>
            <div style={{ color: '#F9EED4', fontSize: '0.72rem', fontWeight: 700 }}>{regNo}</div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.7rem', marginTop: 2 }}>{st.department_code} · Year {st.current_year}</div>
          </div>

          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%',
              background: activeTab === tab.key ? '#720F0F' : 'transparent',
              color: activeTab === tab.key ? '#FFFFFF' : '#F9EED4',
              fontWeight: activeTab === tab.key ? 700 : 500,
              fontSize: '0.84rem',
              borderLeft: activeTab === tab.key ? '3px solid #D69A18' : '3px solid transparent',
              transition: 'all 0.15s',
            }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </aside>

        {/* Main */}
        <main style={{ flex: 1, padding: '28px 32px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b' }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>⏳</div>
              <p>Loading ward information...</p>
            </div>
          ) : (

            // ── OVERVIEW ──────────────────────────────────────
            activeTab === 'overview' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <h1 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: 4 }}>Ward Overview 👨‍👩‍👧</h1>
                  <p style={{ color: '#64748b' }}>Tracking {st.full_name}'s academic progress in real time</p>
                </div>

                {/* Alert if attendance low */}
                {att.shortage_risk && (
                  <div style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, color: '#f87171', fontWeight: 700 }}>
                    ⚠️ URGENT: Your ward's attendance is below 75%! Please ensure regular attendance to avoid exam barment. Contact the class advisor immediately.
                  </div>
                )}

                {/* Key Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                  <ParentStatCard icon="📊" label="CGPA" value={acad.cgpa || 8.92} color="#f59e0b" sub="Current Overall" />
                  <ParentStatCard icon="📈" label="SGPA" value={acad.sgpa || 9.10} color="#6366f1" sub="This Semester" />
                  <ParentStatCard icon="🏆" label="Dept. Rank" value={`#${acad.department_rank || 2}`} color="#B22222" sub="in Department" />
                  <ParentStatCard icon="📅" label="Attendance" value={`${att.overall_percentage || 95.4}%`} color={att.overall_percentage >= 75 ? '#34d399' : '#ef4444'} sub={att.shortage_risk ? '⚠️ Below 75%!' : 'Good Standing'} />
                  <ParentStatCard icon="⚠️" label="Arrears" value={acad.arrears_count || 0} color={acad.arrears_count > 0 ? '#ef4444' : '#34d399'} sub="Active" />
                  <ParentStatCard icon="💳" label="Fee Status" value={fee.status || 'Paid'} color={fee.status === 'Paid' ? '#34d399' : '#ef4444'} />
                </div>

                {/* Ward Info + Attendance Ring */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#f59e0b' }}>👤 Ward Profile</h3>
                    {[
                      ['Register No.', st.register_number],
                      ['Department', st.department],
                      ['Year / Semester', `Year ${st.current_year} / Sem ${st.current_semester}`],
                      ['Batch', st.batch],
                      ['Email', st.email],
                      ['Phone', st.phone],
                      ['Blood Group', st.blood_group],
                      ['Accommodation', st.hosteller ? 'Hosteller' : 'Day Scholar'],
                      ['Bus Route', st.bus_route],
                      ['Class Advisor', st.class_advisor],
                      ['Mentor', st.mentor],
                      ['Status', st.status],
                    ].filter(([, v]) => v).map(([label, val]) => (
                      <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.84rem' }}>
                        <span style={{ color: '#64748b' }}>{label}</span>
                        <span style={{ color: '#e2e8f0', fontWeight: 600, textAlign: 'right', maxWidth: 200 }}>{String(val)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontWeight: 800, marginBottom: 16, color: '#34d399' }}>📅 Attendance Summary</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
                      <AttRing pct={att.overall_percentage || 95.4} />
                      <div style={{ flex: 1 }}>
                        {[
                          { label: 'Present', val: att.present || attData?.present_days || 182, color: '#34d399' },
                          { label: 'Absent', val: att.absent || attData?.absent_days || 9, color: '#ef4444' },
                          { label: 'On Duty', val: att.od || attData?.od_days || 3, color: '#60a5fa' },
                        ].map(item => (
                          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.85rem' }}>
                            <span style={{ color: '#64748b' }}>{item.label}</span>
                            <span style={{ color: item.color, fontWeight: 700 }}>{item.val} days</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <h3 style={{ fontWeight: 800, marginBottom: 12, color: '#B22222' }}>🏢 Placement Update</h3>
                    {place.company ? (
                      <div style={{ padding: '14px 16px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: 12 }}>
                        <div style={{ fontWeight: 900, color: '#34d399', marginBottom: 4 }}>✅ Placed at {place.company}</div>
                        <div style={{ color: '#f59e0b', fontSize: '1.3rem', fontWeight: 900 }}>{place.package}</div>
                        <div style={{ color: '#64748b', fontSize: '0.78rem' }}>Annual Package</div>
                      </div>
                    ) : (
                      <div style={{ color: '#f59e0b', fontSize: '0.9rem' }}>{place.status || 'Eligible & Preparing for placements'}</div>
                    )}
                  </div>
                </div>

                {/* Recent Notifications for Parent */}
                {notifications.slice(0, 3).length > 0 && (
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontWeight: 800, marginBottom: 14, color: '#f59e0b' }}>🔔 Recent Updates</h3>
                    {notifications.slice(0, 3).map(n => (
                      <div key={n.id} style={{ padding: '12px 16px', borderLeft: '3px solid #f59e0b', marginBottom: 10, background: 'rgba(245,158,11,0.04)', borderRadius: '0 10px 10px 0' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{n.title}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: 2 }}>{n.message}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )

            // ── ATTENDANCE ────────────────────────────────────
            : activeTab === 'attendance' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>📅 Attendance Details</h2>
                {att.shortage_risk && (
                  <div style={{ padding: '16px 20px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, color: '#f87171', fontWeight: 700, marginBottom: 20 }}>
                    ⚠️ CRITICAL: Attendance below 75% — risk of examination block!
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14, marginBottom: 24 }}>
                  <ParentStatCard icon="📅" label="Overall" value={`${attData?.overall_percentage || 95.4}%`} color={attData?.overall_percentage >= 75 ? '#34d399' : '#ef4444'} />
                  <ParentStatCard icon="✅" label="Present" value={attData?.present_days || 182} color="#34d399" />
                  <ParentStatCard icon="❌" label="Absent" value={attData?.absent_days || 9} color="#ef4444" />
                  <ParentStatCard icon="🔄" label="OD" value={attData?.od_days || 3} color="#60a5fa" />
                </div>
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 12 }}>ℹ️ Attendance Policy</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    As per university regulations, a minimum of <strong style={{ color: '#f59e0b' }}>75% attendance</strong> is mandatory in each subject. 
                    Students falling below this threshold may not be permitted to appear in the semester examinations. 
                    Medical leave and OD (On Duty) are considered separately with proper documentation.
                  </p>
                </div>
              </div>
            )

            // ── ACADEMICS ─────────────────────────────────────
            : activeTab === 'academics' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>📊 Academic Performance</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 24 }}>
                  <ParentStatCard icon="🎓" label="CGPA" value={marksData?.cgpa || 8.92} color="#f59e0b" />
                  <ParentStatCard icon="📈" label="SGPA" value={marksData?.sgpa || 9.10} color="#6366f1" />
                  <ParentStatCard icon="🏆" label="Dept. Rank" value={`#${marksData?.department_rank || 2}`} color="#B22222" />
                  <ParentStatCard icon="⚠️" label="Arrears" value={marksData?.arrears || 0} color={marksData?.arrears > 0 ? '#ef4444' : '#34d399'} />
                  <ParentStatCard icon="🏅" label="Credits" value={marksData?.credits_earned || 156} color="#10b981" />
                </div>
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                  <h3 style={{ fontWeight: 700, marginBottom: 12 }}>🎓 Academic Standing</h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.88rem', lineHeight: 1.6 }}>
                    Your ward is currently in <strong style={{ color: '#34d399' }}>Good Academic Standing</strong> with a CGPA of{' '}
                    <strong style={{ color: '#f59e0b' }}>{marksData?.cgpa || 8.92}</strong> and ranked{' '}
                    <strong style={{ color: '#B22222' }}>#{ marksData?.department_rank || 2}</strong> in the department.
                    {marksData?.arrears > 0 && <span style={{ color: '#ef4444' }}> There are {marksData.arrears} active arrear subject(s) that need attention.</span>}
                  </p>
                </div>
              </div>
            )

            // ── PLACEMENT ─────────────────────────────────────
            : activeTab === 'placement' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>🏢 Placement Status</h2>
                <div style={{ background: 'rgba(15,23,42,0.95)', border: `1px solid ${place.company ? 'rgba(52,211,153,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 16, padding: 32, maxWidth: 500 }}>
                  {place.company ? (
                    <>
                      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎉</div>
                      <h3 style={{ color: '#34d399', fontWeight: 900, fontSize: '1.2rem', marginBottom: 8 }}>Congratulations! Your ward has been placed!</h3>
                      <div style={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{place.company}</div>
                      <div style={{ color: '#f59e0b', fontSize: '2rem', fontWeight: 900 }}>{place.package}</div>
                      <div style={{ color: '#64748b', fontSize: '0.82rem' }}>Annual Package (CTC)</div>
                    </>
                  ) : (
                    <>
                      <h3 style={{ fontWeight: 800, marginBottom: 12 }}>Placement Status</h3>
                      <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1rem' }}>{place.status || 'Eligible & Preparing'}</div>
                      <p style={{ color: '#64748b', marginTop: 12, fontSize: '0.85rem', lineHeight: 1.6 }}>
                        Your ward is preparing for campus placements. The placement training program is ongoing. 
                        Companies are scheduled to visit campus. We will notify you once placed.
                      </p>
                    </>
                  )}
                </div>
              </div>
            )

            // ── FEE ───────────────────────────────────────────
            : activeTab === 'fee' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>💳 Fee Status</h2>
                <div style={{ maxWidth: 580 }}>
                  <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Fee Statement</span>
                      <span style={{ padding: '4px 14px', borderRadius: 99, background: feeData?.payment_status === 'Paid' ? '#065f46' : '#7f1d1d', color: feeData?.payment_status === 'Paid' ? '#34d399' : '#f87171', fontWeight: 700 }}>
                        {feeData?.payment_status || 'Paid'}
                      </span>
                    </div>
                    {[
                      ['Tuition Fee', feeData?.tuition_fee], ['Exam Fee', feeData?.exam_fee],
                      ['Bus Fee', feeData?.bus_fee], ['Hostel Fee', feeData?.hostel_fee],
                    ].map(([l, v]) => v !== undefined && (
                      <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', fontSize: '0.9rem' }}>
                        <span style={{ color: '#94a3b8' }}>{l}</span>
                        <span style={{ fontWeight: 600 }}>₹{Number(v).toLocaleString()}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(52,211,153,0.3)', fontSize: '0.9rem' }}>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>Scholarship</span>
                      <span style={{ color: '#34d399', fontWeight: 700 }}>-₹{Number(feeData?.scholarship || 0).toLocaleString()}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', fontSize: '1rem', fontWeight: 800 }}>
                      <span>Balance Due</span>
                      <span style={{ color: feeData?.balance > 0 ? '#ef4444' : '#34d399' }}>₹{Number(feeData?.balance || 0).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )

            // ── LEAVE REQUESTS ────────────────────────────────
            : activeTab === 'requests' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>📝 Leave & OD Requests</h2>
                <div style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 24 }}>
                  {leaveReqs.length > 0 ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <thead><tr style={{ color: '#64748b', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                        {['From', 'To', 'Type', 'Status', 'Approved By'].map(h => <th key={h} style={{ padding: '8px 12px', textAlign: 'left' }}>{h}</th>)}
                      </tr></thead>
                      <tbody>
                        {leaveReqs.map(r => (
                          <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                            <td style={{ padding: '9px 12px' }}>{r.from_date}</td>
                            <td style={{ padding: '9px 12px' }}>{r.to_date}</td>
                            <td style={{ padding: '9px 12px', color: '#94a3b8' }}>{r.leave_type}</td>
                            <td style={{ padding: '9px 12px' }}>
                              <span style={{ padding: '3px 10px', borderRadius: 99, background: r.status === 'Approved' ? '#065f46' : r.status === 'Rejected' ? '#7f1d1d' : '#92400e', color: r.status === 'Approved' ? '#34d399' : r.status === 'Rejected' ? '#f87171' : '#fbbf24', fontSize: '0.75rem', fontWeight: 700 }}>
                                {r.status}
                              </span>
                            </td>
                            <td style={{ padding: '9px 12px', color: '#64748b' }}>{r.approved_by || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : <p style={{ color: '#64748b' }}>No leave requests on record.</p>}
                </div>
              </div>
            )

            // ── NOTIFICATIONS ─────────────────────────────────
            : activeTab === 'notifications' ? (
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: 24 }}>🔔 Notifications</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 750 }}>
                  {notifications.length > 0 ? notifications.map(n => (
                    <div key={n.id} style={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 14, padding: '18px 22px', borderLeft: '4px solid #f59e0b' }}>
                      <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 6 }}>{n.title}</div>
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
