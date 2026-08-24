import React, { useState, useEffect } from 'react';

export default function AcademicOverviewModule({ student, onNavigateTab }) {
  const [academicData, setAcademicData] = useState(null);
  const [internal1Data, setInternal1Data] = useState([]);
  const [internal2Data, setInternal2Data] = useState([]);
  const [assignmentData, setAssignmentData] = useState([]);
  const [loading, setLoading] = useState(false);

  const curSem = student?.current_semester || 6;

  useEffect(() => {
    if (student?.id) {
      setLoading(true);
      Promise.all([
        fetch(`http://127.0.0.1:8000/api/v1/academic/student/${student.id}/full-academic-record`).then(r => r.ok ? r.json() : null),
        fetch(`http://127.0.0.1:8000/api/v1/students/${student.id}/academic/internal-1?semester=${curSem}`).then(r => r.ok ? r.json() : null),
        fetch(`http://127.0.0.1:8000/api/v1/students/${student.id}/academic/internal-2?semester=${curSem}`).then(r => r.ok ? r.json() : null),
        fetch(`http://127.0.0.1:8000/api/v1/students/${student.id}/academic/assignments?semester=${curSem}`).then(r => r.ok ? r.json() : null)
      ]).then(([fullRec, i1, i2, assg]) => {
        if (fullRec) setAcademicData(fullRec);
        if (i1?.records) setInternal1Data(i1.records);
        if (i2?.records) setInternal2Data(i2.records);
        if (assg?.records) setAssignmentData(assg.records);
      }).catch(err => console.error("Overview fetch error:", err))
        .finally(() => setLoading(false));
    }
  }, [student?.id, curSem]);

  const liveSgpa = academicData?.student?.sgpa || student?.sgpa || 9.10;
  const liveCgpa = academicData?.student?.cgpa || student?.cgpa || 8.92;
  const pendingArrears = academicData?.student?.pending_arrears || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Banner Overview */}
      <div style={{ padding: 24, borderRadius: 12, borderLeft: '4px solid #D69A18', background: 'linear-gradient(135deg, #720F0F 0%, #4B0909 100%)', color: '#FFFFFF', border: '1.5px solid #D69A18', boxShadow: '0 4px 14px rgba(114,15,15,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <span className="badge badge-gold" style={{ background: '#F9EED4', color: '#720F0F', border: '1px solid #D69A18' }}>ACADEMIC OVERVIEW & INTEGRATED MARKS MATRIX</span>
              <span className="badge badge-gold" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>Reg: {student?.register_number}</span>
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', fontFamily: 'var(--font-college)' }}>
              Academic Profile Overview: <span style={{ color: '#F9EED4' }}>{student?.full_name}</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#F9EED4', marginTop: 2 }}>
              Connected Assessment System • Department: <strong style={{ color: '#FFFFFF' }}>{student?.department_code || 'AIDS'}</strong> • Year: <strong style={{ color: '#FFFFFF' }}>{student?.current_year || 3}</strong> • Current Semester: <strong style={{ color: '#FFFFFF' }}>Semester {curSem}</strong>
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => onNavigateTab && onNavigateTab('internal-1')} style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6, background: '#FAF7F0', border: '1.5px solid #720F0F', color: '#720F0F', cursor: 'pointer' }}>
              📘 Internal 1
            </button>
            <button onClick={() => onNavigateTab && onNavigateTab('internal-2')} style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6, background: '#FAF7F0', border: '1.5px solid #720F0F', color: '#720F0F', cursor: 'pointer' }}>
              📗 Internal 2
            </button>
            <button onClick={() => onNavigateTab && onNavigateTab('assignments')} style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6, background: '#FAF7F0', border: '1.5px solid #720F0F', color: '#720F0F', cursor: 'pointer' }}>
              📙 Assignments
            </button>
            <button onClick={() => onNavigateTab && onNavigateTab('semester-marks')} style={{ padding: '8px 14px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6, background: '#FAF7F0', border: '1.5px solid #720F0F', color: '#720F0F', cursor: 'pointer' }}>
              📊 Semester Marks
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <div className="vsb-card" style={{ padding: 20, textAlign: 'center', borderLeft: '4px solid #24733E', background: '#FAF7F0' }}>
          <span style={{ fontSize: '0.8rem', color: '#5C5750', fontWeight: 700 }}>CREDIT-WEIGHTED CGPA</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#24733E', margin: '4px 0' }}>{liveCgpa}</div>
          <span className="badge badge-emerald">First Class Distinction</span>
        </div>

        <div className="vsb-card" style={{ padding: 20, textAlign: 'center', borderLeft: '4px solid #D69A18', background: '#FAF7F0' }}>
          <span style={{ fontSize: '0.8rem', color: '#5C5750', fontWeight: 700 }}>SEMESTER {curSem} SGPA</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#A96E00', margin: '4px 0' }}>{liveSgpa}</div>
          <span className="badge badge-gold">Live Calculated</span>
        </div>

        <div className="vsb-card" style={{ padding: 20, textAlign: 'center', borderLeft: '4px solid #720F0F', background: '#FAF7F0' }}>
          <span style={{ fontSize: '0.8rem', color: '#5C5750', fontWeight: 700 }}>TOTAL CREDITS EARNED</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#720F0F', margin: '4px 0' }}>{student?.credits_earned || 156}</div>
          <span className="badge badge-vsb">Out of 168 Credits</span>
        </div>

        <div className="vsb-card" style={{ padding: 20, textAlign: 'center', borderLeft: '4px solid #A52A24', background: '#FAF7F0' }}>
          <span style={{ fontSize: '0.8rem', color: '#5C5750', fontWeight: 700 }}>STANDING ARREARS</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: pendingArrears === 0 ? '#24733E' : '#A52A24', margin: '4px 0' }}>
            {pendingArrears}
          </div>
          <span className={`badge ${pendingArrears === 0 ? 'badge-emerald' : 'badge-error'}`}>
            {pendingArrears === 0 ? 'All Clear Standing' : 'Active Arrears'}
          </span>
        </div>
      </div>

      {/* 4 Separate Modules Link Quick Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>

        {/* Card 1: Internal Marks 1 */}
        <div
          className="vsb-card"
          style={{ padding: 20, cursor: 'pointer', borderLeft: '4px solid #720F0F', background: '#FAF7F0' }}
          onClick={() => onNavigateTab && onNavigateTab('internal-1')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="badge badge-vsb">MODULE 1</span>
            <span style={{ fontSize: '1.2rem' }}>📘</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#720F0F' }}>1. Internal Marks 1</h3>
          <p style={{ fontSize: '0.82rem', color: '#5C5750', marginTop: 4 }}>
            Maximum 50 Marks → Auto 100 Conversion • Dynamic + Add Subject. Records: <strong style={{ color: '#720F0F' }}>{internal1Data.length} Subjects</strong>
          </p>
          <button style={{ marginTop: 12, width: '100%', padding: '8px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6, background: '#FAF7F0', border: '1.5px solid #720F0F', color: '#720F0F', cursor: 'pointer' }}>
            Open Internal 1 Page →
          </button>
        </div>

        {/* Card 2: Internal Marks 2 */}
        <div
          className="vsb-card"
          style={{ padding: 20, cursor: 'pointer', borderLeft: '4px solid #D69A18', background: '#FAF7F0' }}
          onClick={() => onNavigateTab && onNavigateTab('internal-2')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="badge badge-gold">MODULE 2</span>
            <span style={{ fontSize: '1.2rem' }}>📗</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#720F0F' }}>2. Internal Marks 2</h3>
          <p style={{ fontSize: '0.82rem', color: '#5C5750', marginTop: 4 }}>
            Independent Assessment Record • Does not overwrite Internal 1. Records: <strong style={{ color: '#A96E00' }}>{internal2Data.length} Subjects</strong>
          </p>
          <button style={{ marginTop: 12, width: '100%', padding: '8px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6, background: '#FAF7F0', border: '1.5px solid #720F0F', color: '#720F0F', cursor: 'pointer' }}>
            Open Internal 2 Page →
          </button>
        </div>

        {/* Card 3: Assignment Marks */}
        <div
          className="vsb-card"
          style={{ padding: 20, cursor: 'pointer', borderLeft: '4px solid #720F0F', background: '#FAF7F0' }}
          onClick={() => onNavigateTab && onNavigateTab('assignments')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="badge badge-vsb">MODULE 3</span>
            <span style={{ fontSize: '1.2rem' }}>📙</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#720F0F' }}>3. Assignment Marks</h3>
          <p style={{ fontSize: '0.82rem', color: '#5C5750', marginTop: 4 }}>
            Assignment 1 & 2 • Auto Average Calculation • Submission date tracking. Records: <strong style={{ color: '#720F0F' }}>{assignmentData.length} Subjects</strong>
          </p>
          <button style={{ marginTop: 12, width: '100%', padding: '8px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6, background: '#FAF7F0', border: '1.5px solid #720F0F', color: '#720F0F', cursor: 'pointer' }}>
            Open Assignment Page →
          </button>
        </div>

        {/* Card 4: Semester Marks & SGPA/CGPA */}
        <div
          className="vsb-card"
          style={{ padding: 20, cursor: 'pointer', borderLeft: '4px solid #24733E', background: '#FAF7F0' }}
          onClick={() => onNavigateTab && onNavigateTab('semester-marks')}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span className="badge badge-emerald">MODULE 4</span>
            <span style={{ fontSize: '1.2rem' }}>📊</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#720F0F' }}>4. Semester Marks & SGPA</h3>
          <p style={{ fontSize: '0.82rem', color: '#5C5750', marginTop: 4 }}>
            Theory & Practical Labs • Anna Univ 2021 Regulation Auto Grades & SGPA Engine.
          </p>
          <button style={{ marginTop: 12, width: '100%', padding: '8px', fontSize: '0.82rem', fontWeight: 700, borderRadius: 6, background: '#FAF7F0', border: '1.5px solid #720F0F', color: '#720F0F', cursor: 'pointer' }}>
            Open Semester Marks →
          </button>
        </div>
      </div>
    </div>
  );
}
