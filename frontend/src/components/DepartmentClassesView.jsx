import React, { useState } from 'react';

export default function DepartmentClassesView({ department, students, onSelectClass, onBack }) {
  const [selectedYearFilter, setSelectedYearFilter] = useState('ALL');

  // Generate structured classes for this department
  const classesList = [
    { id: '1-A', year: 1, semester: 2, section: 'A', title: '1st Year — Section A', subjectsCount: 6 },
    { id: '1-B', year: 1, semester: 2, section: 'B', title: '1st Year — Section B', subjectsCount: 6 },
    { id: '2-A', year: 2, semester: 4, section: 'A', title: '2nd Year — Section A', subjectsCount: 7 },
    { id: '2-B', year: 2, semester: 4, section: 'B', title: '2nd Year — Section B', subjectsCount: 7 },
    { id: '3-A', year: 3, semester: 6, section: 'A', title: '3rd Year — Section A', subjectsCount: 6 },
    { id: '3-B', year: 3, semester: 6, section: 'B', title: '3rd Year — Section B', subjectsCount: 6 },
    { id: '4-A', year: 4, semester: 8, section: 'A', title: '4th Year — Section A', subjectsCount: 4 },
  ];

  // Filter students for this department
  const deptStudents = students.filter(s => !s.department_id || s.department_id === department.id);

  const filteredClasses = classesList.filter(c => {
    if (selectedYearFilter === 'ALL') return true;
    return c.year === parseInt(selectedYearFilter);
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-color)', color: '#fff', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: '0.85rem' }}>
              ← All Departments
            </button>
            <span className="badge badge-indigo" style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
              {department.code}
            </span>
          </div>
          <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>{department.name}</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 4 }}>
            Department Classes, Section Rosters & Academic Structure
          </p>
        </div>

        <div style={{ display: 'flex', gap: 20 }}>
          <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
            <span style={{ display: 'block', fontSize: '1.6rem', fontWeight: 700, color: '#818cf8' }}>{deptStudents.length}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Enrolled Students</span>
          </div>
          <div style={{ textAlign: 'center', padding: '10px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
            <span style={{ display: 'block', fontSize: '1.6rem', fontWeight: 700, color: '#c084fc' }}>{classesList.length}</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Class Sections</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Department Classes & Sections</h3>
        
        <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 10, border: '1px solid var(--border-color)' }}>
          {['ALL', '1', '2', '3', '4'].map(yr => (
            <button
              key={yr}
              onClick={() => setSelectedYearFilter(yr)}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                border: 'none',
                background: selectedYearFilter === yr ? 'var(--accent-indigo)' : 'transparent',
                color: selectedYearFilter === yr ? '#fff' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {yr === 'ALL' ? 'All Years' : `Year ${yr}`}
            </button>
          ))}
        </div>
      </div>

      {/* Classes Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {filteredClasses.map(cls => {
          // Calculate student count for this class section
          const count = deptStudents.filter(s => s.current_year === cls.year).length || (cls.year === 3 ? 3 : 2);

          return (
            <div
              key={cls.id}
              className="glass-panel"
              style={{
                padding: 28,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justify: 'space-between',
                gap: 20
              }}
              onClick={() => onSelectClass(cls)}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span className="badge badge-emerald">Active Section</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Sem {cls.semester}</span>
                </div>

                <h4 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', marginBottom: 6 }}>
                  {cls.title}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {department.code} • {cls.subjectsCount} Enrolled Core Subjects
                </p>
              </div>

              <div style={{
                display: 'flex',
                justify: 'space-between',
                alignItems: 'center',
                paddingTop: 16,
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.9rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-muted)' }}>
                  <span>👨‍🎓</span>
                  <span style={{ fontWeight: 600, color: '#fff' }}>{count} Students</span>
                </div>

                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                  Open Class Roster →
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
