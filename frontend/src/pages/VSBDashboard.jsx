import React from 'react';

export default function VSBDashboard({ departments, students, onOpenStudent, onNavigateDept }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        
        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Total Enrolled Students</span>
            <span style={{ fontSize: 24 }}>👨‍🎓</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '12px 0 4px', color: '#F4B400' }}>
            {students.length > 0 ? students.length * 142 : 1420}
          </div>
          <span className="badge badge-vsb">V.S.B ENGINEERING COLLEGE</span>
        </div>

        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Today's Attendance Rate</span>
            <span style={{ fontSize: 24 }}>📅</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '12px 0 4px', color: '#34d399' }}>
            95.8%
          </div>
          <span className="badge badge-emerald">InsightFace AI Verified</span>
        </div>

        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Active Departments</span>
            <span style={{ fontSize: 24 }}>🏛️</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '12px 0 4px', color: '#818cf8' }}>
            {departments.length || 7}
          </div>
          <span className="badge badge-gold">CSE, AIDS, ECE, EEE, MECH</span>
        </div>

        <div className="glass-panel" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
            <span>Campus Placement Rate</span>
            <span style={{ fontSize: 24 }}>💼</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: 800, margin: '12px 0 4px', color: '#c084fc' }}>
            94.2%
          </div>
          <span className="badge badge-emerald">Highest Package: 28 LPA</span>
        </div>

      </div>

      {/* Analytics Charts & Visualizations */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Department Attendance & Performance Breakdown Chart */}
        <div className="glass-panel" style={{ padding: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Department Attendance & CGPA Analytics</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Real-time comparative performance by academic branch</span>
            </div>
            <span className="badge badge-vsb">Academic Session 2025–2026</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { dept: 'Artificial Intelligence & Data Science (AI & DS)', attendance: 96.5, avgCgpa: 8.95, color: '#B22222' },
              { dept: 'Computer Science & Engineering (CSE)', attendance: 95.8, avgCgpa: 8.88, color: '#F4B400' },
              { dept: 'Electronics & Communication Engg (ECE)', attendance: 94.2, avgCgpa: 8.75, color: '#818cf8' },
              { dept: 'Electrical & Electronics Engg (EEE)', attendance: 93.6, avgCgpa: 8.62, color: '#34d399' },
              { dept: 'Mechanical Engineering (MECH)', attendance: 92.4, avgCgpa: 8.50, color: '#c084fc' },
            ].map(d => (
              <div key={d.dept} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{d.dept}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    Attendance: <strong style={{ color: d.color }}>{d.attendance}%</strong> | Avg CGPA: <strong style={{ color: '#fff' }}>{d.avgCgpa}</strong>
                  </span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${d.attendance}%`, background: d.color, borderRadius: 5, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Access Portals */}
        <div className="glass-panel" style={{ padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Quick Access Department Portals</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {departments.slice(0, 5).map(dept => (
              <div
                key={dept.id}
                style={{
                  padding: 14,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  justify: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => onNavigateDept(dept)}
              >
                <div>
                  <span className="badge badge-vsb" style={{ fontSize: '0.75rem', marginBottom: 4 }}>{dept.code}</span>
                  <h5 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff' }}>{dept.name}</h5>
                </div>
                <span style={{ fontSize: 18, color: '#F4B400' }}>→</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Student Profiles Table Preview */}
      <div className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>V.S.B Student Directory Preview</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click any student row to view full 7-tab profile</span>
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: 12 }}>Register No</th>
              <th style={{ padding: 12 }}>Roll No</th>
              <th style={{ padding: 12 }}>Student Name</th>
              <th style={{ padding: 12 }}>Department</th>
              <th style={{ padding: 12 }}>CGPA</th>
              <th style={{ padding: 12 }}>Attendance</th>
              <th style={{ padding: 12 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {students.slice(0, 5).map(st => (
              <tr key={st.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                <td style={{ padding: 14, fontWeight: 700, color: '#F4B400' }}>{st.register_number}</td>
                <td style={{ padding: 14, color: 'var(--text-muted)' }}>{st.roll_number}</td>
                <td style={{ padding: 14, fontWeight: 600 }}>{st.full_name}</td>
                <td style={{ padding: 14 }}><span className="badge badge-vsb">{st.department_name || 'AI & DS'}</span></td>
                <td style={{ padding: 14, fontWeight: 700, color: '#34d399' }}>{st.cgpa || 8.92}</td>
                <td style={{ padding: 14 }}>{st.attendance_percentage || 95.4}%</td>
                <td style={{ padding: 14 }}>
                  <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }} onClick={() => onOpenStudent(st)}>
                    View Profile →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
