import React, { useState } from 'react';

export default function StaffMarkEntryModal({ student = {}, onClose, onSaveSuccess }) {
  const currentSem = student.current_semester || 6;
  const [selectedSem, setSelectedSem] = useState(currentSem > 8 ? 8 : currentSem);
  const [subjectCode, setSubjectCode] = useState('AD3651');
  const [subjectName, setSubjectName] = useState('Generative AI & LLM Engineering');
  const [credits, setCredits] = useState(4);
  
  // Mark Form States
  const [ia1Mark, setIa1Mark] = useState(45);
  const [ia2Mark, setIa2Mark] = useState(48);
  const [assign1Mark, setAssign1Mark] = useState(10);
  const [assign2Mark, setAssign2Mark] = useState(10);
  const [semesterMark, setSemesterMark] = useState(88);
  const [reasonForChange, setReasonForChange] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Live total & grade calculation
  const finalInternal = Math.round((Number(ia1Mark || 0) + Number(ia2Mark || 0)) / 2 * 0.4 + (Number(assign1Mark || 0) + Number(assign2Mark || 0)));
  const totalMark = Math.min(100, Math.round(finalInternal + Number(semesterMark || 0) * 0.6));
  let calculatedGrade = 'RA';
  let gradePoint = 0;

  if (totalMark >= 90) { calculatedGrade = 'O'; gradePoint = 10; }
  else if (totalMark >= 80) { calculatedGrade = 'A+'; gradePoint = 9; }
  else if (totalMark >= 70) { calculatedGrade = 'A'; gradePoint = 8; }
  else if (totalMark >= 60) { calculatedGrade = 'B+'; gradePoint = 7; }
  else if (totalMark >= 50) { calculatedGrade = 'B'; gradePoint = 6; }
  else if (totalMark >= 45) { calculatedGrade = 'C'; gradePoint = 5; }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (selectedSem > currentSem) {
      setErrorMessage(`🔒 Future Semester Locked: Student is currently in Semester ${currentSem}. Marks for Semester ${selectedSem} are "Not Yet Completed".`);
      return;
    }

    if (!reasonForChange.trim()) {
      setErrorMessage('⚠️ Mandatory Audit Policy: Please specify a Reason for Change to populate audit log history.');
      return;
    }

    setIsSaving(true);

    const payload = {
      student_id: student.id || student.register_number || '922521104001',
      semester: Number(selectedSem),
      subject_code: subjectCode,
      subject_name: subjectName,
      credits: Number(credits),
      internal_mark: finalInternal,
      semester_exam_mark: Number(semesterMark),
      total_mark: totalMark,
      grade: calculatedGrade,
      grade_point: gradePoint,
      result: totalMark >= 50 ? 'Pass' : 'Arrear',
      updated_by: 'STAFF_HOD_ADMIN',
      reason_for_change: reasonForChange.trim()
    };

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/phase2/marks/semester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to update semester mark');
      }

      setIsSaving(false);
      if (onSaveSuccess) {
        onSaveSuccess(data.message || `🎉 Sem ${selectedSem} Mark updated for ${student.full_name || 'Student'}! Recalculated SGPA & CGPA.`);
      } else {
        alert(`🎉 Sem ${selectedSem} Mark updated! Audit log created.`);
      }
      onClose();
    } catch (err) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to connect to backend server!');
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(75,9,9,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="vsb-card" style={{ width: 620, maxHeight: '92vh', overflowY: 'auto', padding: 32, position: 'relative', borderLeft: '4px solid #720F0F', background: '#FAF7F0', border: '1.5px solid #720F0F', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: '#720F0F', fontSize: 20, cursor: 'pointer', fontWeight: 800 }}
        >
          ✕
        </button>

        <div style={{ marginBottom: 16 }}>
          <span className="badge badge-vsb">STAFF & HOD ASSESSMENT ENGINE</span>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: 4, color: '#720F0F', fontFamily: 'var(--font-college)' }}>
            Update Marks & Live SGPA/CGPA Calculation
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#5C5750', marginTop: 2 }}>
            Student: <strong style={{ color: '#720F0F' }}>{student.full_name || 'Aarav Sharma'}</strong> ({student.register_number || '922521104001'})
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div style={{ padding: 12, borderRadius: 8, background: '#FDF2F2', color: '#A52A24', fontWeight: 600, fontSize: '0.84rem', marginBottom: 16, border: '1px solid #A52A24' }}>
            {errorMessage}
          </div>
        )}

        {/* Semester Selector with Future Semester Locking */}
        <div style={{ background: '#F5EFE6', padding: 14, borderRadius: 8, marginBottom: 16, border: '1px solid #D8CEBE' }}>
          <label style={{ fontSize: '0.78rem', color: '#720F0F', display: 'block', marginBottom: 8, fontWeight: 700 }}>
            SELECT COMPLETED SEMESTER (Semester 1 to {currentSem})
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map(s => {
              const isLocked = s > currentSem;
              return (
                <button
                  key={s}
                  type="button"
                  disabled={isLocked}
                  onClick={() => setSelectedSem(s)}
                  style={{
                    padding: '8px 0',
                    borderRadius: 6,
                    border: selectedSem === s ? '2px solid #D69A18' : '1px solid #D8CEBE',
                    background: selectedSem === s ? '#720F0F' : isLocked ? '#EAE3D5' : '#FAF7F0',
                    color: selectedSem === s ? '#FFFFFF' : isLocked ? '#A89F91' : '#2B2926',
                    fontWeight: selectedSem === s ? 800 : 600,
                    fontSize: '0.78rem',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                  }}
                >
                  Sem {s}
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#5C5750', fontWeight: 700 }}>Subject Code *</label>
              <input type="text" className="input-field" value={subjectCode} onChange={e => setSubjectCode(e.target.value)} required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#5C5750', fontWeight: 700 }}>Subject Name *</label>
              <input type="text" className="input-field" value={subjectName} onChange={e => setSubjectName(e.target.value)} required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#5C5750', fontWeight: 700 }}>Internal IA 1 (50)</label>
              <input type="number" className="input-field" value={ia1Mark} onChange={e => setIa1Mark(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#5C5750', fontWeight: 700 }}>Internal IA 2 (50)</label>
              <input type="number" className="input-field" value={ia2Mark} onChange={e => setIa2Mark(e.target.value)} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.76rem', color: '#5C5750', fontWeight: 700 }}>Sem Exam (100)</label>
              <input type="number" className="input-field" value={semesterMark} onChange={e => setSemesterMark(e.target.value)} />
            </div>
          </div>

          {/* Live Grade Calculation Box */}
          <div style={{ background: '#F5EFE6', padding: 14, borderRadius: 8, border: '1px solid #D8CEBE', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#5C5750', display: 'block' }}>Calculated Total & Grade</span>
              <strong style={{ fontSize: '1.2rem', color: '#720F0F' }}>{totalMark} / 100 — Grade: {calculatedGrade} ({gradePoint} Points)</strong>
            </div>
            <span className={`badge ${totalMark >= 50 ? 'badge-emerald' : 'badge-vsb'}`}>{totalMark >= 50 ? 'PASS' : 'RE-APPEAR (ARREAR)'}</span>
          </div>

          {/* Mandatory Reason for Change for Audit Trail */}
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#720F0F', fontWeight: 700, marginBottom: 4 }}>
              Mandatory Reason for Change (Audit Trail Log) *
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. Revaluation grade update approved by HOD / Controller of Exams"
              value={reasonForChange}
              onChange={e => setReasonForChange(e.target.value)}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving || selectedSem > currentSem} style={{ background: '#720F0F', borderColor: '#4B0909', color: '#FFFFFF' }}>
              {isSaving ? '⏳ Saving & Recalculating...' : '💾 Save & Recalculate SGPA/CGPA'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
