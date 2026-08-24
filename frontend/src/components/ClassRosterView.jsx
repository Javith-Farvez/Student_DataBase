import React, { useState } from 'react';

export default function ClassRosterView({ department, classInfo, students, onBack, onAddStudent, onSelectStudent }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter students for this specific department & class year
  const classStudents = students.filter(s => {
    const matchesDept = !s.department_id || s.department_id === department.id;
    const matchesYear = s.current_year === classInfo.year || classInfo.year === 3;
    const matchesQuery = s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.register_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.roll_number.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesYear && matchesQuery;
  });

  const subjectsList = [
    { code: 'CS3601', name: 'Database Systems & PostgreSQL', credits: 4, faculty: 'Dr. Aris Thorne' },
    { code: 'AI3602', name: 'Neural Networks & Deep Learning', credits: 4, faculty: 'Prof. Elena Vance' },
    { code: 'CS3603', name: 'Distributed Systems & Cloud Security', credits: 3, faculty: 'Dr. Marcus Brody' },
    { code: 'CS3604', name: 'Software Architecture & Design Patterns', credits: 3, faculty: 'Prof. Sarah Jenkins' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Breadcrumb Header */}
      <div className="glass-panel" style={{ padding: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, fontSize: '0.85rem' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: '#818cf8', cursor: 'pointer', fontWeight: 600, padding: 0 }}>
              ← {department.name} ({department.code})
            </button>
            <span style={{ color: 'var(--text-dim)' }}>/</span>
            <span style={{ color: 'var(--text-muted)' }}>Class Section</span>
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>{classInfo.title}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: 4 }}>
            Semester {classInfo.semester} • Academic Year 2025–2026
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={onAddStudent}>
            ➕ Add Student to Class
          </button>
        </div>
      </div>

      {/* Class Subjects & Summary Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        
        {/* Core Subjects */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16 }}>Enrolled Core Subjects ({subjectsList.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {subjectsList.map(sub => (
              <div key={sub.code} style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-indigo" style={{ fontSize: '0.75rem' }}>{sub.code}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{sub.credits} Credits</span>
                </div>
                <h5 style={{ fontSize: '0.92rem', fontWeight: 600, margin: '8px 0 4px', color: '#fff' }}>{sub.name}</h5>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>👩‍🏫 {sub.faculty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Class Stats */}
        <div className="glass-panel" style={{ padding: 24, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Class Attendance Analytics</h3>
          <div style={{ textAlign: 'center', margin: '16px 0' }}>
            <span style={{ fontSize: '2.8rem', fontWeight: 800, color: '#34d399' }}>94.2%</span>
            <span style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Average Class Attendance Rate</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
            <span style={{ color: 'var(--text-muted)' }}>AI Face Match Threshold</span>
            <span style={{ fontWeight: 600, color: '#818cf8' }}>0.62 Cosine</span>
          </div>
        </div>

      </div>

      {/* Class Student Roster Table */}
      <div className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
            Class Student Roster ({classStudents.length} Students)
          </h3>
          <input
            type="text"
            className="input-field"
            placeholder="🔍 Filter student roster..."
            style={{ width: 280 }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px 16px' }}>Reg Number</th>
              <th style={{ padding: '12px 16px' }}>Roll No</th>
              <th style={{ padding: '12px 16px' }}>Student Name</th>
              <th style={{ padding: '12px 16px' }}>Gender</th>
              <th style={{ padding: '12px 16px' }}>Blood Group</th>
              <th style={{ padding: '12px 16px' }}>Email</th>
              <th style={{ padding: '12px 16px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {classStudents.map(st => (
              <tr key={st.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.9rem' }}>
                <td style={{ padding: '14px 16px', fontWeight: 600, color: '#F4B400', cursor: 'pointer' }} onClick={() => onSelectStudent && onSelectStudent(st)}>
                  {st.register_number}
                </td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{st.roll_number}</td>
                <td style={{ padding: '14px 16px', fontWeight: 700, color: '#FFF', cursor: 'pointer' }} onClick={() => onSelectStudent && onSelectStudent(st)}>
                  {st.full_name} 🔍
                </td>
                <td style={{ padding: '14px 16px' }}>{st.gender}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{st.blood_group || 'O+'}</td>
                <td style={{ padding: '14px 16px', color: 'var(--text-muted)' }}>{st.email}</td>
                <td style={{ padding: '14px 16px' }}>
                  <button className="btn btn-secondary" onClick={() => onSelectStudent && onSelectStudent(st)} style={{ padding: '4px 10px', fontSize: '0.78rem' }}>
                    View Dossier
                  </button>
                </td>
              </tr>
            ))}
            {classStudents.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
                  No students in this class section yet. Click "Add Student to Class" above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
