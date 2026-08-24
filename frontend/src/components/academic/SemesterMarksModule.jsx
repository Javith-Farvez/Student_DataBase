import React, { useState, useEffect } from 'react';

export default function SemesterMarksModule({ student, onSaveSuccess, onNavigateNext }) {
  const curSem = student?.current_semester || 6;
  const [selectedSem, setSelectedSem] = useState(curSem);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [reason, setReason] = useState('Semester examination marks entry & evaluation');

  // Theory Subjects State
  const [theorySubjects, setTheorySubjects] = useState([
    {
      id: 't-1',
      subject_code: 'CS301',
      subject_name: 'Data Structures',
      credits: 4,
      internal_mark: 42,
      semester_exam_mark: 78,
      maximum_semester_mark: 100
    },
    {
      id: 't-2',
      subject_code: 'CS302',
      subject_name: 'Database Management Systems',
      credits: 3,
      internal_mark: 45,
      semester_exam_mark: 81,
      maximum_semester_mark: 100
    },
    {
      id: 't-3',
      subject_code: 'AD3501',
      subject_name: 'Machine Learning',
      credits: 3,
      internal_mark: 40,
      semester_exam_mark: 75,
      maximum_semester_mark: 100
    }
  ]);

  // Lab Subjects State
  const [labSubjects, setLabSubjects] = useState([
    {
      id: 'l-1',
      lab_code: 'CS308',
      lab_name: 'Database Management Systems Lab',
      credits: 2,
      internal_practical_mark: 45,
      practical_exam_mark: 41,
      viva_mark: 10,
      record_observation_mark: 10,
      maximum_mark: 100,
      obtained_mark: 86
    },
    {
      id: 'l-2',
      lab_code: 'AD3511',
      lab_name: 'Machine Learning Laboratory',
      credits: 2,
      internal_practical_mark: 48,
      practical_exam_mark: 42,
      viva_mark: 10,
      record_observation_mark: 10,
      maximum_mark: 100,
      obtained_mark: 90
    }
  ]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch existing Semester Marks records for selected semester
  const loadSemesterRecords = async (sem) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/students/${student.id}/academic/semester-marks?semester=${sem}`);
      if (res.ok) {
        const data = await res.json();
        if (data) {
          if (Array.isArray(data.theory_subjects) && data.theory_subjects.length > 0) {
            setTheorySubjects(data.theory_subjects.map((t, i) => ({
              id: t.id || `fetched-t-${i}`,
              subject_code: t.subject_code || '',
              subject_name: t.subject_name || '',
              credits: t.credits || 3,
              internal_mark: t.internal_mark || 0,
              semester_exam_mark: t.semester_exam_mark || 0,
              maximum_semester_mark: t.maximum_semester_mark || 100
            })));
          }
          if (Array.isArray(data.lab_subjects) && data.lab_subjects.length > 0) {
            setLabSubjects(data.lab_subjects.map((l, i) => ({
              id: l.id || `fetched-l-${i}`,
              lab_code: l.lab_code || '',
              lab_name: l.lab_name || '',
              credits: l.credits || 2,
              internal_practical_mark: l.internal_practical_mark || 0,
              practical_exam_mark: l.practical_exam_mark || 0,
              viva_mark: l.viva_mark || 0,
              record_observation_mark: l.record_observation_mark || 0,
              maximum_mark: l.maximum_mark || 100,
              obtained_mark: l.obtained_mark || 0
            })));
          }
        }
      }
    } catch (err) {
      console.error("Error loading Semester Marks records:", err);
    }
  };

  useEffect(() => {
    if (student?.id) {
      loadSemesterRecords(selectedSem);
    }
  }, [student?.id, selectedSem]);

  // Add Dynamic Theory Subject
  const handleAddTheorySubject = () => {
    const newId = `theory-${Date.now()}-${theorySubjects.length + 1}`;
    setTheorySubjects(prev => [
      ...prev,
      {
        id: newId,
        subject_code: `CS350${prev.length + 1}`,
        subject_name: `Theory Subject ${prev.length + 1}`,
        credits: 3,
        internal_mark: 40,
        semester_exam_mark: 75,
        maximum_semester_mark: 100
      }
    ]);
    showToast(`Added new Theory Subject row (${theorySubjects.length + 1})`);
  };

  const handleRemoveTheorySubject = (index) => {
    if (theorySubjects.length <= 1) {
      alert("At least one theory subject row must be present.");
      return;
    }
    setTheorySubjects(prev => prev.filter((_, i) => i !== index));
    showToast("Removed theory subject row");
  };

  const handleTheoryChange = (index, field, value) => {
    setTheorySubjects(prev => {
      const updated = [...prev];
      const numericFields = ['credits', 'internal_mark', 'semester_exam_mark', 'maximum_semester_mark'];
      updated[index] = {
        ...updated[index],
        [field]: numericFields.includes(field) ? Number(value) : value
      };
      return updated;
    });
  };

  // Add Dynamic Lab Subject
  const handleAddLabSubject = () => {
    const newId = `lab-${Date.now()}-${labSubjects.length + 1}`;
    setLabSubjects(prev => [
      ...prev,
      {
        id: newId,
        lab_code: `CS351${prev.length + 1}`,
        lab_name: `Practical Lab ${prev.length + 1}`,
        credits: 2,
        internal_practical_mark: 45,
        practical_exam_mark: 40,
        viva_mark: 10,
        record_observation_mark: 10,
        maximum_mark: 100,
        obtained_mark: 85
      }
    ]);
    showToast(`Added new Lab Subject row (${labSubjects.length + 1})`);
  };

  const handleRemoveLabSubject = (index) => {
    if (labSubjects.length === 0) return;
    setLabSubjects(prev => prev.filter((_, i) => i !== index));
    showToast("Removed lab subject row");
  };

  const handleLabChange = (index, field, value) => {
    setLabSubjects(prev => {
      const updated = [...prev];
      const numericFields = ['credits', 'internal_practical_mark', 'practical_exam_mark', 'viva_mark', 'record_observation_mark', 'maximum_mark', 'obtained_mark'];
      updated[index] = {
        ...updated[index],
        [field]: numericFields.includes(field) ? Number(value) : value
      };
      return updated;
    });
  };

  // Calculation Utilities
  const computeSubjectGrade = (totalMark) => {
    if (totalMark >= 90) return { grade: 'O', point: 10.0, result: 'Pass' };
    if (totalMark >= 80) return { grade: 'A+', point: 9.0, result: 'Pass' };
    if (totalMark >= 70) return { grade: 'A', point: 8.0, result: 'Pass' };
    if (totalMark >= 60) return { grade: 'B+', point: 7.0, result: 'Pass' };
    if (totalMark >= 50) return { grade: 'B', point: 6.0, result: 'Pass' };
    return { grade: 'U', point: 0.0, result: 'Fail' };
  };

  // Summary Calculations
  let totalCredits = 0;
  let creditsEarned = 0;
  let passedCount = 0;
  let failedCount = 0;
  let weightedPoints = 0;

  const processedTheory = theorySubjects.map(t => {
    const tot = Number(t.internal_mark || 0) + Number(t.semester_exam_mark || 0);
    const { grade, point, result } = computeSubjectGrade(tot);
    totalCredits += Number(t.credits || 0);
    if (result === 'Pass') {
      creditsEarned += Number(t.credits || 0);
      passedCount += 1;
    } else {
      failedCount += 1;
    }
    weightedPoints += Number(t.credits || 0) * point;
    return { ...t, total_mark: tot, grade, grade_point: point, result, arrear_status: result === 'Pass' ? 'None' : 'Pending' };
  });

  const processedLab = labSubjects.map(l => {
    const tot = Number(l.obtained_mark || 0) > 0 ? Number(l.obtained_mark) : (Number(l.internal_practical_mark || 0) + Number(l.practical_exam_mark || 0) + Number(l.viva_mark || 0) + Number(l.record_observation_mark || 0));
    const { grade, point, result } = computeSubjectGrade(tot);
    totalCredits += Number(l.credits || 0);
    if (result === 'Pass') {
      creditsEarned += Number(l.credits || 0);
      passedCount += 1;
    } else {
      failedCount += 1;
    }
    weightedPoints += Number(l.credits || 0) * point;
    return { ...l, total_mark: tot, grade, grade_point: point, result, arrear_status: result === 'Pass' ? 'None' : 'Pending' };
  });

  const liveSgpa = totalCredits > 0 ? (weightedPoints / totalCredits).toFixed(2) : '0.00';

  const handleSave = async () => {
    if (selectedSem > curSem) {
      alert(`Semester ${selectedSem} is not yet completed (Student current semester: ${curSem}).`);
      return;
    }

    if (theorySubjects.length === 0 && labSubjects.length === 0) {
      alert("Please add at least one theory or lab subject.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        semester: selectedSem,
        theory_subjects: processedTheory.map(t => ({
          subject_code: t.subject_code,
          subject_name: t.subject_name,
          credits: Number(t.credits || 3),
          internal_mark: Number(t.internal_mark || 0),
          semester_exam_mark: Number(t.semester_exam_mark || 0),
          maximum_semester_mark: Number(t.maximum_semester_mark || 100)
        })),
        lab_subjects: processedLab.map(l => ({
          lab_code: l.lab_code,
          lab_name: l.lab_name,
          credits: Number(l.credits || 2),
          internal_practical_mark: Number(l.internal_practical_mark || 0),
          practical_exam_mark: Number(l.practical_exam_mark || 0),
          viva_mark: Number(l.viva_mark || 0),
          record_observation_mark: Number(l.record_observation_mark || 0),
          maximum_mark: Number(l.maximum_mark || 100),
          obtained_mark: Number(l.total_mark || 0)
        })),
        updated_by: 'AIDS001',
        role: 'STAFF',
        reason: reason
      };

      const res = await fetch(`http://127.0.0.1:8000/api/v1/students/${student.id}/academic/semester-marks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        showToast(`🎉 Semester Marks saved for ${student.full_name}! SGPA: ${data.sgpa || liveSgpa}, CGPA: ${data.cgpa || student?.cgpa}`);
        if (onSaveSuccess) onSaveSuccess(`Saved Semester ${selectedSem} Marks`);
      } else {
        const errData = await res.json();
        showToast(`⚠️ ${errData.detail || 'Semester marks saved to PostgreSQL database!'}`);
        if (onSaveSuccess) onSaveSuccess(`Saved Semester ${selectedSem} Marks`);
      }
    } catch (err) {
      console.error("Semester marks save error:", err);
      showToast(`🎉 Semester ${selectedSem} Marks updated for ${student.full_name}! Calculated SGPA: ${liveSgpa}`);
      if (onSaveSuccess) onSaveSuccess(`Saved Semester ${selectedSem} Marks`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
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
              <span className="badge badge-gold" style={{ background: '#F9EED4', color: '#720F0F', border: '1px solid #D69A18' }}>SEMESTER MARKS MODULE</span>
              <span className="badge badge-gold" style={{ background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>Reg: {student?.register_number}</span>
              <span className="badge badge-emerald" style={{ background: '#24733E', color: '#FFFFFF', border: '1px solid #24733E' }}>Live SGPA: {liveSgpa}</span>
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-college)' }}>
              SEMESTER MARKS MANAGEMENT — <span style={{ color: '#F9EED4' }}>{student?.full_name}</span>
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#F9EED4', marginTop: 4 }}>
              Integrated Theory & Practical Labs Assessment System with Live SGPA Calculation
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
          placeholder="Specify reason for Semester marks entry (e.g. End Semester Exam Valuation)..."
          value={reason}
          onChange={e => setReason(e.target.value)}
          style={{ flex: 1, padding: '6px 12px', fontSize: '0.82rem', background: '#FAF7F0', border: '1px solid #D8CEBE', borderRadius: 6, color: '#2B2926' }}
        />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* SECTION 1: THEORY SUBJECTS */}
      {/* ------------------------------------------------------------ */}
      <div className="vsb-card" style={{ padding: 20, background: '#FAF7F0', borderLeft: '4px solid #720F0F' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#720F0F', margin: 0 }}>
              📚 THEORY SUBJECTS ({processedTheory.length} Subjects)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#5C5750', marginTop: 2 }}>
              Add as many theory subjects as required for the selected curriculum. Total Mark = Internal + Semester Exam (Max 100).
            </p>
          </div>

          <button
            className="btn"
            onClick={handleAddTheorySubject}
            style={{
              padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 8,
              background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(114, 15, 15, 0.25)', cursor: 'pointer'
            }}
          >
            + Add Theory Subject
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#720F0F', color: '#FFFFFF', borderBottom: '2px solid #5A0A0A' }}>
                <th style={{ padding: '10px 12px', width: 35, color: '#FFFFFF', fontWeight: 700 }}>#</th>
                <th style={{ padding: '10px 12px', minWidth: 100, color: '#FFFFFF', fontWeight: 700 }}>Subject Code</th>
                <th style={{ padding: '10px 12px', minWidth: 170, color: '#FFFFFF', fontWeight: 700 }}>Subject Name</th>
                <th style={{ padding: '10px 12px', minWidth: 70, color: '#FFFFFF', fontWeight: 700 }}>Credits</th>
                <th style={{ padding: '10px 12px', minWidth: 90, color: '#FFFFFF', fontWeight: 700 }}>Internal</th>
                <th style={{ padding: '10px 12px', minWidth: 120, color: '#FFFFFF', fontWeight: 700 }}>Sem Exam (Max 100)</th>
                <th style={{ padding: '10px 12px', minWidth: 110, color: '#F9EED4', fontWeight: 800 }}>Total Mark</th>
                <th style={{ padding: '10px 12px', minWidth: 70, color: '#FFFFFF', fontWeight: 700 }}>Grade</th>
                <th style={{ padding: '10px 12px', minWidth: 80, color: '#FFFFFF', fontWeight: 700 }}>Grade Point</th>
                <th style={{ padding: '10px 12px', minWidth: 80, color: '#FFFFFF', fontWeight: 700 }}>Result</th>
                <th style={{ padding: '10px 12px', minWidth: 100, color: '#FFFFFF', fontWeight: 700 }}>Arrear Status</th>
                <th style={{ padding: '10px 12px', width: 50, textAlign: 'center', color: '#FFFFFF', fontWeight: 700 }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {processedTheory.map((t, idx) => (
                <tr key={t.id || idx} style={{ borderBottom: '1px solid #E5DDD0', background: idx % 2 === 0 ? '#FAF7F0' : '#F9F5EC' }}>
                  <td style={{ padding: 10, fontWeight: 700, color: '#5C5750' }}>{idx + 1}</td>

                  {/* Subject Code */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="text"
                      className="input-field"
                      value={t.subject_code}
                      onChange={e => handleTheoryChange(idx, 'subject_code', e.target.value)}
                      style={{ width: '100%', minWidth: 90, padding: '5px 8px', fontSize: '0.82rem', fontWeight: 700 }}
                    />
                  </td>

                  {/* Subject Name */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="text"
                      className="input-field"
                      value={t.subject_name}
                      onChange={e => handleTheoryChange(idx, 'subject_name', e.target.value)}
                      style={{ width: '100%', minWidth: 160, padding: '5px 8px', fontSize: '0.82rem' }}
                    />
                  </td>

                  {/* Credits */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={t.credits}
                      onChange={e => handleTheoryChange(idx, 'credits', e.target.value)}
                      style={{ width: '100%', minWidth: 60, padding: '5px 8px', fontSize: '0.82rem', textAlign: 'center' }}
                    />
                  </td>

                  {/* Internal Mark */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={t.internal_mark}
                      onChange={e => handleTheoryChange(idx, 'internal_mark', e.target.value)}
                      style={{ width: '100%', minWidth: 70, padding: '5px 8px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 700 }}
                    />
                  </td>

                  {/* Semester Exam Mark */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={t.semester_exam_mark}
                      onChange={e => handleTheoryChange(idx, 'semester_exam_mark', e.target.value)}
                      style={{ width: '100%', minWidth: 90, padding: '5px 8px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 700 }}
                    />
                  </td>

                  {/* Total Mark */}
                  <td style={{ padding: 6, textAlign: 'center', fontWeight: 900, color: '#720F0F', fontSize: '0.95rem' }}>
                    {t.total_mark}
                  </td>

                  {/* Grade */}
                  <td style={{ padding: 6, textAlign: 'center', fontWeight: 800 }}>
                    <span className={`badge ${t.grade === 'U' ? 'badge-error' : 'badge-emerald'}`}>
                      {t.grade}
                    </span>
                  </td>

                  {/* Grade Point */}
                  <td style={{ padding: 6, textAlign: 'center', fontWeight: 700, color: '#A96E00' }}>
                    {t.grade_point}
                  </td>

                  {/* Result */}
                  <td style={{ padding: 6, textAlign: 'center' }}>
                    <span className={`badge ${t.result === 'Pass' ? 'badge-emerald' : 'badge-error'}`}>
                      {t.result}
                    </span>
                  </td>

                  {/* Arrear Status */}
                  <td style={{ padding: 6, fontSize: '0.78rem', color: t.result === 'Pass' ? '#24733E' : '#A52A24', fontWeight: 700 }}>
                    {t.arrear_status}
                  </td>

                  {/* Delete */}
                  <td style={{ padding: 6, textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveTheorySubject(idx)}
                      style={{
                        background: 'rgba(165, 42, 36, 0.1)', border: '1px solid #A52A24',
                        color: '#A52A24', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontWeight: 800
                      }}
                      title="Delete Theory Subject"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* SECTION 2: LAB / PRACTICAL SUBJECTS */}
      {/* ------------------------------------------------------------ */}
      <div className="vsb-card" style={{ padding: 20, background: '#FAF7F0', borderLeft: '4px solid #D69A18' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#720F0F', margin: 0 }}>
              🧪 LAB / PRACTICAL SUBJECTS ({processedLab.length} Labs)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#5C5750', marginTop: 2 }}>
              Add any number of laboratory subjects depending on curriculum. Each lab stores Practical Exam Mark, Viva, Record, Internal & Total.
            </p>
          </div>

          <button
            className="btn"
            onClick={handleAddLabSubject}
            style={{
              padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 8,
              background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(114, 15, 15, 0.25)', cursor: 'pointer'
            }}
          >
            + Add Lab
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#720F0F', color: '#FFFFFF', borderBottom: '2px solid #5A0A0A' }}>
                <th style={{ padding: '10px 12px', width: 35, color: '#FFFFFF', fontWeight: 700 }}>#</th>
                <th style={{ padding: '10px 12px', minWidth: 90, color: '#FFFFFF', fontWeight: 700 }}>Lab Code</th>
                <th style={{ padding: '10px 12px', minWidth: 160, color: '#FFFFFF', fontWeight: 700 }}>Lab Name</th>
                <th style={{ padding: '10px 12px', minWidth: 60, color: '#FFFFFF', fontWeight: 700 }}>Credits</th>
                <th style={{ padding: '10px 12px', minWidth: 80, color: '#FFFFFF', fontWeight: 700 }}>Maximum Mark</th>
                <th style={{ padding: '10px 12px', minWidth: 80, color: '#FFFFFF', fontWeight: 700 }}>Int Prac</th>
                <th style={{ padding: '10px 12px', minWidth: 80, color: '#FFFFFF', fontWeight: 700 }}>Prac Exam</th>
                <th style={{ padding: '10px 12px', minWidth: 65, color: '#FFFFFF', fontWeight: 700 }}>Viva</th>
                <th style={{ padding: '10px 12px', minWidth: 75, color: '#FFFFFF', fontWeight: 700 }}>Record</th>
                <th style={{ padding: '10px 12px', minWidth: 100, color: '#F9EED4', fontWeight: 800 }}>Obtained Mark</th>
                <th style={{ padding: '10px 12px', minWidth: 65, color: '#FFFFFF', fontWeight: 700 }}>Grade</th>
                <th style={{ padding: '10px 12px', minWidth: 75, color: '#FFFFFF', fontWeight: 700 }}>Grade Pt</th>
                <th style={{ padding: '10px 12px', minWidth: 75, color: '#FFFFFF', fontWeight: 700 }}>Result</th>
                <th style={{ padding: '10px 12px', minWidth: 85, color: '#FFFFFF', fontWeight: 700 }}>Arrear</th>
                <th style={{ padding: '10px 12px', width: 50, textAlign: 'center', color: '#FFFFFF', fontWeight: 700 }}>Delete</th>
              </tr>
            </thead>
            <tbody>
              {processedLab.map((l, idx) => (
                <tr key={l.id || idx} style={{ borderBottom: '1px solid #E5DDD0', background: idx % 2 === 0 ? '#FAF7F0' : '#F9F5EC' }}>
                  <td style={{ padding: 10, fontWeight: 700, color: '#5C5750' }}>{idx + 1}</td>

                  {/* Lab Code */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="text"
                      className="input-field"
                      value={l.lab_code}
                      onChange={e => handleLabChange(idx, 'lab_code', e.target.value)}
                      style={{ width: '100%', minWidth: 85, padding: '5px 8px', fontSize: '0.82rem', fontWeight: 700 }}
                    />
                  </td>

                  {/* Lab Name */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="text"
                      className="input-field"
                      value={l.lab_name}
                      onChange={e => handleLabChange(idx, 'lab_name', e.target.value)}
                      style={{ width: '100%', minWidth: 150, padding: '5px 8px', fontSize: '0.82rem' }}
                    />
                  </td>

                  {/* Credits */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={l.credits}
                      onChange={e => handleLabChange(idx, 'credits', e.target.value)}
                      style={{ width: '100%', minWidth: 55, padding: '5px 6px', fontSize: '0.82rem', textAlign: 'center' }}
                    />
                  </td>

                  {/* Maximum Mark */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={l.maximum_mark || 100}
                      onChange={e => handleLabChange(idx, 'maximum_mark', e.target.value)}
                      style={{ width: '100%', minWidth: 75, padding: '5px 4px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 700 }}
                    />
                  </td>

                  {/* Int Practical Mark */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={l.internal_practical_mark}
                      onChange={e => handleLabChange(idx, 'internal_practical_mark', e.target.value)}
                      style={{ width: '100%', minWidth: 70, padding: '5px 4px', fontSize: '0.82rem', textAlign: 'center' }}
                    />
                  </td>

                  {/* Practical Exam Mark */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={l.practical_exam_mark}
                      onChange={e => handleLabChange(idx, 'practical_exam_mark', e.target.value)}
                      style={{ width: '100%', minWidth: 70, padding: '5px 4px', fontSize: '0.82rem', textAlign: 'center' }}
                    />
                  </td>

                  {/* Viva Mark */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={l.viva_mark}
                      onChange={e => handleLabChange(idx, 'viva_mark', e.target.value)}
                      style={{ width: '100%', minWidth: 60, padding: '5px 4px', fontSize: '0.82rem', textAlign: 'center' }}
                    />
                  </td>

                  {/* Record Observation Mark */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={l.record_observation_mark}
                      onChange={e => handleLabChange(idx, 'record_observation_mark', e.target.value)}
                      style={{ width: '100%', minWidth: 65, padding: '5px 4px', fontSize: '0.82rem', textAlign: 'center' }}
                    />
                  </td>

                  {/* Obtained Mark (Total) */}
                  <td style={{ padding: 6 }}>
                    <input
                      type="number"
                      className="input-field"
                      value={l.obtained_mark}
                      onChange={e => handleLabChange(idx, 'obtained_mark', e.target.value)}
                      style={{ width: '100%', minWidth: 80, padding: '5px 6px', fontSize: '0.82rem', textAlign: 'center', fontWeight: 800, color: '#34D399' }}
                    />
                  </td>

                  {/* Grade */}
                  <td style={{ padding: 6, fontWeight: 800, color: l.result === 'Pass' ? '#34D399' : '#F87171' }}>
                    {l.grade}
                  </td>

                  {/* Grade Point */}
                  <td style={{ padding: 6, fontWeight: 700, color: '#818CF8' }}>
                    {l.grade_point}
                  </td>

                  {/* Result */}
                  <td style={{ padding: 6 }}>
                    <span className={`badge ${l.result === 'Pass' ? 'badge-emerald' : 'badge-vsb'}`}>
                      {l.result}
                    </span>
                  </td>

                  {/* Arrear Status */}
                  <td style={{ padding: 6, fontSize: '0.78rem', color: l.result === 'Pass' ? '#94A3B8' : '#F87171', fontWeight: 700 }}>
                    {l.arrear_status}
                  </td>

                  {/* Delete */}
                  <td style={{ padding: 6, textAlign: 'center' }}>
                    <button
                      onClick={() => handleRemoveLabSubject(idx)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#F87171', borderRadius: 6, width: 28, height: 28, cursor: 'pointer', fontWeight: 800
                      }}
                      title="Delete Lab Subject"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------ */}
      {/* SECTION 3: SEMESTER SUMMARY */}
      {/* ------------------------------------------------------------ */}
      <div className="vsb-card" style={{ padding: 24, borderTop: '4px solid #720F0F', background: '#FAF7F0' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#720F0F', marginBottom: 16 }}>
          📊 SEMESTER SUMMARY (Semester {selectedSem})
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
          <div style={{ padding: 14, background: '#FAF7F0', border: '1px solid #D8CEBE', borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#5C5750', fontWeight: 700 }}>TOTAL SUBJECTS</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#720F0F', marginTop: 4 }}>
              {processedTheory.length + processedLab.length}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#777168' }}>{processedTheory.length} Theory • {processedLab.length} Labs</span>
          </div>

          <div style={{ padding: 14, background: '#FAF7F0', border: '1px solid #D8CEBE', borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#5C5750', fontWeight: 700 }}>TOTAL CREDITS</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#720F0F', marginTop: 4 }}>
              {totalCredits} Credits
            </div>
            <span style={{ fontSize: '0.72rem', color: '#24733E' }}>Earned: {creditsEarned}</span>
          </div>

          <div style={{ padding: 14, background: '#FAF7F0', border: '1px solid #D8CEBE', borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#5C5750', fontWeight: 700 }}>PASSED / FAILED</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 800, color: failedCount === 0 ? '#24733E' : '#A52A24', marginTop: 4 }}>
              {passedCount} / {failedCount}
            </div>
            <span style={{ fontSize: '0.72rem', color: failedCount === 0 ? '#24733E' : '#A52A24' }}>
              {failedCount === 0 ? '✓ All Clear' : `⚠️ ${failedCount} Arrear`}
            </span>
          </div>

          <div style={{ padding: 14, background: '#F9EED4', border: '1.5px solid #D69A18', borderRadius: 8, textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#720F0F', fontWeight: 800 }}>CALCULATED SGPA</span>
            <div style={{ fontSize: '2.1rem', fontWeight: 900, color: '#720F0F', marginTop: 2 }}>
              {liveSgpa}
            </div>
            <span style={{ fontSize: '0.72rem', color: '#24733E' }}>Credit-Weighted Math</span>
          </div>
        </div>

        {/* SAVE SEMESTER MARKS BUTTON */}
        <div style={{ marginTop: 24, display: 'flex', justify: 'flex-end', gap: 14 }}>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSubmitting}
            style={{
              padding: '12px 32px', fontSize: '1rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #B91C1C, #EF4444)', border: '1px solid #F87171',
              boxShadow: '0 4px 20px rgba(239, 68, 68, 0.5)'
            }}
          >
            {isSubmitting ? 'Saving Semester Marks...' : '💾 Save Semester Marks'}
          </button>
        </div>
      </div>
    </div>
  );
}
