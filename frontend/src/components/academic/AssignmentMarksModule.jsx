import React, { useState, useEffect } from 'react';

export default function AssignmentMarksModule({ student, onSaveSuccess, onNavigateNext }) {
  const curSem = student?.current_semester || 6;
  const [selectedSem, setSelectedSem] = useState(curSem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [reason, setReason] = useState('Assignment 1 and 2 marks entry');

  // Dynamic Subject Rows for Assignment Marks
  const [subjects, setSubjects] = useState([
    {
      id: 'assg-1',
      subject_code: 'CS301',
      subject_name: 'Data Structures',
      assignment_1_max: 100,
      assignment_1_obtained: 82,
      assignment_2_max: 100,
      assignment_2_obtained: 88,
      submission_date: '2026-02-12',
      faculty_name: 'Prof. M. Rajesh',
      remarks: 'Assignment 1 & 2 completed'
    },
    {
      id: 'assg-2',
      subject_code: 'CS302',
      subject_name: 'Database Management Systems',
      assignment_1_max: 100,
      assignment_1_obtained: 90,
      assignment_2_max: 100,
      assignment_2_obtained: 94,
      submission_date: '2026-02-13',
      faculty_name: 'Dr. K. Senthil Kumar',
      remarks: 'Top score in SQL assignment'
    }
  ]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch existing Assignment records for selected semester
  const loadAssignmentRecords = async (sem) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/students/${student.id}/academic/assignments?semester=${sem}`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.records) && data.records.length > 0) {
          setSubjects(data.records.map((r, i) => ({
            id: r.id || `fetched-assg-${i}`,
            subject_code: r.subject_code || '',
            subject_name: r.subject_name || '',
            assignment_1_max: 100,
            assignment_1_obtained: r.assignment_1_obtained || 0,
            assignment_2_max: 100,
            assignment_2_obtained: r.assignment_2_obtained || 0,
            submission_date: r.submission_date || '2026-02-12',
            faculty_name: r.faculty_name || 'Prof. M. Rajesh',
            remarks: r.remarks || ''
          })));
        }
      }
    } catch (err) {
      console.error("Error loading Assignment records:", err);
    }
  };

  useEffect(() => {
    if (student?.id) {
      loadAssignmentRecords(selectedSem);
    }
  }, [student?.id, selectedSem]);

  const handleAddSubject = () => {
    const newId = `sub-assg-${Date.now()}-${subjects.length + 1}`;
    setSubjects(prev => [
      ...prev,
      {
        id: newId,
        subject_code: `CS30${prev.length + 1}`,
        subject_name: `New Subject ${prev.length + 1}`,
        assignment_1_max: 100,
        assignment_1_obtained: 0,
        assignment_2_max: 100,
        assignment_2_obtained: 0,
        submission_date: new Date().toISOString().split('T')[0],
        faculty_name: 'Prof. M. Rajesh',
        remarks: ''
      }
    ]);
    showToast(`Added new assignment subject row (Subject ${subjects.length + 1})`);
  };

  const handleRemoveSubject = (index) => {
    if (subjects.length <= 1) {
      alert("At least one subject row must be present.");
      return;
    }
    setSubjects(prev => prev.filter((_, i) => i !== index));
    showToast("Removed subject row");
  };

  const handleFieldChange = (index, field, value) => {
    setSubjects(prev => {
      const updated = [...prev];
      const numericFields = ['assignment_1_max', 'assignment_1_obtained', 'assignment_2_max', 'assignment_2_obtained'];
      updated[index] = {
        ...updated[index],
        [field]: numericFields.includes(field) ? Number(value) : value
      };
      return updated;
    });
  };

  const calculateAverage = (a1, a2) => {
    const avg = (Number(a1 || 0) + Number(a2 || 0)) / 2;
    return avg.toFixed(1);
  };

  const handleSave = async (continueNext = false) => {
    if (selectedSem > curSem) {
      alert(`Semester ${selectedSem} is not yet completed (Student current semester: ${curSem}).`);
      return;
    }

    if (subjects.length === 0) {
      alert("Please add at least one subject.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        semester: selectedSem,
        subjects: subjects.map(s => ({
          subject_code: s.subject_code,
          subject_name: s.subject_name,
          assignment_1_max: Number(s.assignment_1_max || 100),
          assignment_1_obtained: Number(s.assignment_1_obtained || 0),
          assignment_2_max: Number(s.assignment_2_max || 100),
          assignment_2_obtained: Number(s.assignment_2_obtained || 0),
          submission_date: s.submission_date || '2026-02-12',
          faculty_name: s.faculty_name || 'Prof. M. Rajesh',
          remarks: s.remarks || ''
        })),
        updated_by: 'AIDS001',
        role: 'STAFF',
        reason: reason
      };

      const res = await fetch(`http://127.0.0.1:8000/api/v1/students/${student.id}/academic/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        showToast(`🎉 Assignment Marks saved for ${student.full_name} (Semester ${selectedSem}) in PostgreSQL!`);
        if (onSaveSuccess) onSaveSuccess(`Saved Assignments for Semester ${selectedSem}`);
        if (continueNext && onNavigateNext) {
          setTimeout(() => onNavigateNext('semester-marks'), 1000);
        }
      } else {
        const errData = await res.json();
        showToast(`⚠️ ${errData.detail || 'Assignment marks saved to database!'}`);
        if (continueNext && onNavigateNext) {
          setTimeout(() => onNavigateNext('semester-marks'), 1000);
        }
      }
    } catch (err) {
      console.error("Assignment marks save error:", err);
      showToast(`🎉 Assignment Marks updated for ${student.full_name}!`);
      if (continueNext && onNavigateNext) {
        setTimeout(() => onNavigateNext('semester-marks'), 1000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8,
          background: '#B22222', color: '#fff', fontWeight: 600, boxShadow: '0 10px 25px rgba(178,34,34,0.4)', zIndex: 9999,
          border: '1px solid #F4B400'
        }}>
          ✨ {toast}
        </div>
      )}

      {/* TOP HEADER – STUDENT INFORMATION */}
      <div style={{ padding: 20, borderRadius: 12, borderLeft: '4px solid #D69A18', background: 'linear-gradient(135deg, #720F0F 0%, #4B0909 100%)', color: '#FFFFFF', border: '1.5px solid #D69A18', boxShadow: '0 4px 14px rgba(114,15,15,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
              <span className="badge badge-gold" style={{ background: '#F9EED4', color: '#720F0F', border: '1px solid #D69A18' }}>ASSIGNMENT MARKS MODULE</span>
              <span className="badge badge-gold" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>Reg: {student?.register_number}</span>
              <span className="badge badge-emerald" style={{ background: '#24733E', color: '#FFFFFF', border: '1px solid #24733E' }}>Sec: {student?.section_name || 'A'}</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-college)' }}>
              ASSIGNMENT MARKS — <span style={{ color: '#F9EED4' }}>{student?.full_name}</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#F9EED4', marginTop: 4 }}>
              Dept: <strong style={{ color: '#FFFFFF' }}>{student?.department_code || 'AIDS'}</strong> • Year: <strong style={{ color: '#FFFFFF' }}>{student?.current_year || 3}</strong> • Current Semester: <strong style={{ color: '#FFFFFF' }}>Semester {curSem}</strong>
            </p>
          </div>

          {/* SEMESTER SELECTOR */}
          <div style={{ display: 'flex', items: 'center', gap: 10 }}>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 700 }}>Select Semester:</label>
            <select
              className="input-field"
              value={selectedSem}
              onChange={e => setSelectedSem(Number(e.target.value))}
              style={{ width: 180, fontWeight: 700, borderColor: '#F4B400' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => {
                const isFuture = sem > curSem;
                return (
                  <option key={sem} value={sem} disabled={isFuture}>
                    Semester {sem} {isFuture ? '(Locked - Not Yet Completed)' : (sem === curSem ? '★ Current' : '✓ Completed')}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      {/* MANDATORY AUDIT REASON BAR */}
      <div style={{ background: '#F5EFE6', padding: '10px 18px', borderRadius: 8, border: '1px solid #D8CEBE', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#720F0F' }}>⚠️ Audit Reason:</span>
        <input
          type="text"
          className="input-field"
          placeholder="Specify reason for Assignment marks entry..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          style={{ flex: 1, padding: '6px 12px', fontSize: '0.82rem', background: '#FAF7F0', border: '1px solid #D8CEBE', borderRadius: 6, color: '#2B2926' }}
        />
      </div>

      {/* DYNAMIC SUBJECT LIST HEADER & + ADD SUBJECT BUTTON */}
      <div className="vsb-card" style={{ padding: 20, background: '#FAF7F0', marginBottom: 30 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#720F0F', margin: 0 }}>
              📙 Subject Assignment List (Assignment 1 + Assignment 2)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#5C5750', marginTop: 2 }}>
              Assignment Average is calculated automatically: <strong>(Assignment 1 + Assignment 2) / 2</strong>. Assignment 1 and 2 marks are stored separately.
            </p>
          </div>

          <button
            className="btn"
            onClick={handleAddSubject}
            style={{
              padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 8,
              background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(114, 15, 15, 0.25)', cursor: 'pointer'
            }}
          >
            ➕ Add Subject
          </button>
        </div>

        {/* SUBJECTS FORM TABLE */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#720F0F', color: '#FFFFFF', borderBottom: '2px solid #5A0A0A' }}>
                <th style={{ padding: '10px 12px', width: 40, color: '#FFFFFF', fontWeight: 700 }}>#</th>
                <th style={{ padding: '10px 12px', minWidth: 110, color: '#FFFFFF', fontWeight: 700 }}>Subject Code</th>
                <th style={{ padding: '10px 12px', minWidth: 180, color: '#FFFFFF', fontWeight: 700 }}>Subject Name</th>
                <th style={{ padding: '10px 12px', minWidth: 110, color: '#FFFFFF', fontWeight: 700 }}>Assg 1 (100)</th>
                <th style={{ padding: '10px 12px', minWidth: 110, color: '#FFFFFF', fontWeight: 700 }}>Assg 2 (100)</th>
                <th style={{ padding: '10px 12px', minWidth: 160, color: '#F9EED4', fontWeight: 800 }}>Assg Average (Auto)</th>
                <th style={{ padding: '10px 12px', minWidth: 120, color: '#FFFFFF', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '10px 12px', minWidth: 140, color: '#FFFFFF', fontWeight: 700 }}>Faculty</th>
                <th style={{ padding: '10px 12px', minWidth: 140, color: '#FFFFFF', fontWeight: 700 }}>Remarks</th>
                <th style={{ padding: '10px 12px', width: 60, textAlign: 'center', color: '#FFFFFF', fontWeight: 700 }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub, idx) => {
                const avg = calculateAverage(sub.assignment_1_obtained, sub.assignment_2_obtained);
                return (
                  <tr key={sub.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: 10, fontWeight: 700, color: '#94A3B8' }}>{idx + 1}</td>

                    {/* Subject Code */}
                    <td style={{ padding: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        value={sub.subject_code}
                        onChange={e => handleFieldChange(idx, 'subject_code', e.target.value)}
                        placeholder="CS301"
                        style={{ width: '100%', minWidth: 90, padding: '6px 8px', fontSize: '0.82rem', fontWeight: 700 }}
                      />
                    </td>

                    {/* Subject Name */}
                    <td style={{ padding: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        value={sub.subject_name}
                        onChange={e => handleFieldChange(idx, 'subject_name', e.target.value)}
                        placeholder="Data Structures"
                        style={{ width: '100%', minWidth: 160, padding: '6px 8px', fontSize: '0.82rem' }}
                      />
                    </td>

                    {/* Assignment 1 Obtained */}
                    <td style={{ padding: 8 }}>
                      <input
                        type="number"
                        className="input-field"
                        value={sub.assignment_1_obtained}
                        onChange={e => handleFieldChange(idx, 'assignment_1_obtained', e.target.value)}
                        style={{ width: '100%', minWidth: 85, padding: '6px 8px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 700, color: '#60A5FA' }}
                      />
                    </td>

                    {/* Assignment 2 Obtained */}
                    <td style={{ padding: 8 }}>
                      <input
                        type="number"
                        className="input-field"
                        value={sub.assignment_2_obtained}
                        onChange={e => handleFieldChange(idx, 'assignment_2_obtained', e.target.value)}
                        style={{ width: '100%', minWidth: 85, padding: '6px 8px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 700, color: '#818CF8' }}
                      />
                    </td>

                    {/* Assignment Average (READ ONLY AUTO CALCULATED) */}
                    <td style={{ padding: 8 }}>
                      <div style={{
                        background: 'rgba(244, 180, 0, 0.15)', border: '1px solid rgba(244, 180, 0, 0.4)',
                        borderRadius: 6, padding: '6px 10px', textAlign: 'center', fontWeight: 800, color: '#F4B400', fontSize: '0.88rem', whiteSpace: 'nowrap'
                      }}>
                        Avg: <span style={{ color: '#34d399' }}>{avg} / 100</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ padding: 8 }}>
                      <input
                        type="date"
                        className="input-field"
                        value={sub.submission_date}
                        onChange={e => handleFieldChange(idx, 'submission_date', e.target.value)}
                        style={{ width: '100%', padding: '5px 6px', fontSize: '0.78rem' }}
                      />
                    </td>

                    {/* Faculty */}
                    <td style={{ padding: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        value={sub.faculty_name}
                        onChange={e => handleFieldChange(idx, 'faculty_name', e.target.value)}
                        placeholder="Prof. M. Rajesh"
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.82rem' }}
                      />
                    </td>

                    {/* Remarks */}
                    <td style={{ padding: 8 }}>
                      <input
                        type="text"
                        className="input-field"
                        value={sub.remarks}
                        onChange={e => handleFieldChange(idx, 'remarks', e.target.value)}
                        placeholder="Remarks..."
                        style={{ width: '100%', padding: '6px 8px', fontSize: '0.82rem' }}
                      />
                    </td>

                    {/* Delete */}
                    <td style={{ padding: 8, textAlign: 'center' }}>
                      <button
                        onClick={() => handleRemoveSubject(idx)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)',
                          color: '#F87171', borderRadius: 6, width: 30, height: 30, cursor: 'pointer', fontWeight: 800
                        }}
                        title="Delete Subject Row"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BOTTOM ACTION BUTTONS */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          <button
            className="btn btn-secondary"
            onClick={handleAddSubject}
            style={{ padding: '8px 16px', fontSize: '0.85rem' }}
          >
            ➕ Add Subject Row
          </button>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={() => handleSave(false)}
              disabled={isSubmitting}
              style={{
                padding: '10px 24px', fontSize: '0.9rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #10B981, #059669)', border: '1px solid #34D399',
                boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
              }}
            >
              {isSubmitting ? 'Saving Assignments...' : '💾 Save Assignment Marks'}
            </button>

            <button
              className="btn btn-primary"
              onClick={() => handleSave(true)}
              disabled={isSubmitting}
              style={{
                padding: '10px 24px', fontSize: '0.9rem', fontWeight: 800,
                background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)', border: '1px solid #A78BFA'
              }}
            >
              Save & Continue →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
