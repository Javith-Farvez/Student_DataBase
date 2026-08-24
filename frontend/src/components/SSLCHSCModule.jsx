import React, { useState, useEffect, useCallback } from 'react';
import {
  upsertSSLC, upsertHSC, deleteSSLC, deleteHSC,
  listSSLCRecords, listHSCRecords, getSummaryReport, getTopPerformers,
  calculateHSCCutoff, calculateSSLCPercentage
} from '../api/sslcHscService';

const BOARDS = ['State Board', 'CBSE', 'ICSE', 'Matric', 'Anglo Indian', 'Other'];
const YEARS = Array.from({ length: 20 }, (_, i) => 2026 - i);
const API_BASE = 'http://127.0.0.1:8000/api/v1';

// ─────────────────────────────────────────────────────────────
// SSLC Form Fields
// ─────────────────────────────────────────────────────────────
const SSLC_SUBJECTS = [
  { key: 'tamil', label: 'Tamil (Part I)', icon: 'த' },
  { key: 'english', label: 'English (Part II)', icon: 'E' },
  { key: 'mathematics', label: 'Mathematics', icon: '∑' },
  { key: 'science', label: 'Science', icon: '⚗' },
  { key: 'social_science', label: 'Social Science', icon: '🌍' },
];
const HSC_SUBJECTS = [
  { key: 'language1', label: 'Tamil / Language I', icon: 'L1' },
  { key: 'language2', label: 'English / Language II', icon: 'L2' },
  { key: 'physics', label: 'Physics', icon: '⚛' },
  { key: 'chemistry', label: 'Chemistry', icon: '🧪' },
  { key: 'mathematics', label: 'Mathematics', icon: '∑' },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
function gradeColor(pct) {
  if (pct >= 90) return '#34d399';
  if (pct >= 75) return '#60a5fa';
  if (pct >= 60) return '#fbbf24';
  return '#f87171';
}

function getGrade(pct) {
  if (pct >= 90) return { grade: 'O', label: 'Outstanding' };
  if (pct >= 80) return { grade: 'A+', label: 'Excellent' };
  if (pct >= 70) return { grade: 'A', label: 'Very Good' };
  if (pct >= 60) return { grade: 'B+', label: 'Good' };
  if (pct >= 50) return { grade: 'B', label: 'Average' };
  return { grade: 'C', label: 'Pass' };
}

function ProgressBar({ value, max = 100, color }) {
  const pct = Math.min(100, ((value || 0) / max) * 100);
  return (
    <div style={{ width: '100%', background: 'rgba(255,255,255,0.06)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || gradeColor(pct), borderRadius: 6, transition: 'width 0.6s ease' }} />
    </div>
  );
}

function StatCard({ icon, label, value, sub, color }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
      <span style={{ fontSize: '2rem' }}>{icon}</span>
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: color || '#F4B400' }}>{value}</div>
        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fff' }}>{label}</div>
        {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SSLC Form Component
// ─────────────────────────────────────────────────────────────
function SSLCForm({ studentId, initialData, onSaved, onCancel }) {
  const empty = { student_id: studentId, school_name: '', board: 'State Board', passing_year: 2021, register_number: '', total_marks: '', max_marks: 500, percentage: '', tamil: '', english: '', mathematics: '', science: '', social_science: '', optional_subject: '', optional_marks: '', remarks: '' };
  const [form, setForm] = useState(initialData ? { ...empty, ...initialData, ...initialData.subjects } : empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(p => {
    const next = { ...p, [k]: v };
    // Auto-compute total + pct from subjects
    const subKeys = ['tamil', 'english', 'mathematics', 'science', 'social_science'];
    const subVals = subKeys.map(sk => Number(next[sk]) || 0);
    const filled = subKeys.filter(sk => next[sk] !== '' && next[sk] !== null && next[sk] !== undefined);
    if (filled.length > 0) {
      next.total_marks = subVals.reduce((a, b) => a + b, 0);
      const max = Number(next.max_marks) || 500;
      next.percentage = Math.round((next.total_marks / max) * 10000) / 100;
    }
    return next;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError(null);
    try {
      const payload = { ...form, passing_year: Number(form.passing_year), total_marks: Number(form.total_marks) || null, max_marks: Number(form.max_marks) || 500, percentage: Number(form.percentage) || null, tamil: Number(form.tamil) || null, english: Number(form.english) || null, mathematics: Number(form.mathematics) || null, science: Number(form.science) || null, social_science: Number(form.social_science) || null, optional_marks: Number(form.optional_marks) || null };
      const res = await upsertSSLC(payload);
      onSaved(res.data || res);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: 8, fontSize: '0.9rem' }}>⚠️ {error}</div>}

      {/* School Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={lbl}>School Name</label>
          <input style={inp} value={form.school_name} onChange={e => set('school_name', e.target.value)} placeholder="e.g. Govt. Higher Secondary School, Karur" />
        </div>
        <div>
          <label style={lbl}>Board</label>
          <select style={inp} value={form.board} onChange={e => set('board', e.target.value)}>
            {BOARDS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Passing Year</label>
          <select style={inp} value={form.passing_year} onChange={e => set('passing_year', e.target.value)}>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Register Number</label>
          <input style={inp} value={form.register_number} onChange={e => set('register_number', e.target.value)} placeholder="Hall ticket / Register No" />
        </div>
      </div>

      {/* Subject Marks */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F4B400', marginBottom: 12 }}>📚 Subject-wise Marks (out of 100 each)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {SSLC_SUBJECTS.map(s => (
            <div key={s.key}>
              <label style={lbl}>{s.label}</label>
              <input style={inp} type="number" min="0" max="100" value={form[s.key]} onChange={e => set(s.key, e.target.value)} placeholder="0–100" />
            </div>
          ))}
          <div>
            <label style={lbl}>Optional Subject Name</label>
            <input style={inp} value={form.optional_subject} onChange={e => set('optional_subject', e.target.value)} placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label style={lbl}>Optional Marks</label>
            <input style={inp} type="number" min="0" max="100" value={form.optional_marks} onChange={e => set('optional_marks', e.target.value)} placeholder="0–100" />
          </div>
        </div>
      </div>

      {/* Computed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <div>
          <label style={lbl}>Total Marks (auto-calculated)</label>
          <input style={{ ...inp, color: '#34d399', fontWeight: 700 }} value={form.total_marks} readOnly />
        </div>
        <div>
          <label style={lbl}>Max Marks</label>
          <input style={inp} type="number" value={form.max_marks} onChange={e => set('max_marks', e.target.value)} />
        </div>
        <div>
          <label style={lbl}>Percentage (auto-calculated)</label>
          <input style={{ ...inp, color: '#60a5fa', fontWeight: 700 }} value={form.percentage} readOnly />
        </div>
      </div>

      <div>
        <label style={lbl}>Remarks</label>
        <textarea style={{ ...inp, resize: 'vertical', minHeight: 60 }} value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes..." />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={btnSec}>Cancel</button>
        <button type="submit" style={btnPrimary} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save SSLC Record'}</button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// HSC Form Component
// ─────────────────────────────────────────────────────────────
function HSCForm({ studentId, initialData, onSaved, onCancel }) {
  const empty = { student_id: studentId, school_name: '', board: 'State Board', passing_year: 2023, register_number: '', stream: 'Science', total_marks: '', max_marks: 600, percentage: '', cutoff: '', physics: '', chemistry: '', mathematics: '', biology: '', computer_science: '', language1: '', language2: '', bio_cs_subject: 'Biology', remarks: '' };
  const [form, setForm] = useState(initialData ? { ...empty, ...initialData, ...initialData.subjects } : empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setForm(p => {
    const next = { ...p, [k]: v };
    // Auto-compute total + pct
    const subKeys = ['language1', 'language2', 'physics', 'chemistry', 'mathematics', next.bio_cs_subject === 'Computer Science' ? 'computer_science' : 'biology'];
    const subVals = subKeys.map(sk => Number(next[sk]) || 0);
    const filled = subKeys.filter(sk => next[sk] !== '' && next[sk] !== null);
    if (filled.length > 0) {
      next.total_marks = subVals.reduce((a, b) => a + b, 0);
      const maxM = Number(next.max_marks) || 600;
      next.percentage = Math.round((next.total_marks / maxM) * 10000) / 100;
    }
    // Auto-compute cutoff
    const cutoff = calculateHSCCutoff({ physics: next.physics, chemistry: next.chemistry, mathematics: next.mathematics, biology: next.biology, computer_science: next.computer_science, bio_cs_subject: next.bio_cs_subject });
    next.cutoff = cutoff || '';
    return next;
  });

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true); setError(null);
    try {
      const payload = { ...form, passing_year: Number(form.passing_year), total_marks: Number(form.total_marks) || null, max_marks: Number(form.max_marks) || 600, percentage: Number(form.percentage) || null, cutoff: Number(form.cutoff) || null, physics: Number(form.physics) || null, chemistry: Number(form.chemistry) || null, mathematics: Number(form.mathematics) || null, biology: Number(form.biology) || null, computer_science: Number(form.computer_science) || null, language1: Number(form.language1) || null, language2: Number(form.language2) || null };
      const res = await upsertHSC(payload);
      onSaved(res.data || res);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {error && <div style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#f87171', borderRadius: 8, fontSize: '0.9rem' }}>⚠️ {error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div><label style={lbl}>School Name</label><input style={inp} value={form.school_name} onChange={e => set('school_name', e.target.value)} placeholder="Higher Secondary School name" /></div>
        <div>
          <label style={lbl}>Board</label>
          <select style={inp} value={form.board} onChange={e => set('board', e.target.value)}>
            {BOARDS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Passing Year</label>
          <select style={inp} value={form.passing_year} onChange={e => set('passing_year', e.target.value)}>
            {YEARS.map(y => <option key={y}>{y}</option>)}
          </select>
        </div>
        <div><label style={lbl}>Register Number</label><input style={inp} value={form.register_number} onChange={e => set('register_number', e.target.value)} placeholder="Hall ticket / Register No" /></div>
        <div>
          <label style={lbl}>Stream</label>
          <select style={inp} value={form.stream} onChange={e => set('stream', e.target.value)}>
            {['Science', 'Commerce', 'Arts', 'Vocational'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Biology / Computer Science</label>
          <select style={inp} value={form.bio_cs_subject} onChange={e => set('bio_cs_subject', e.target.value)}>
            <option value="Biology">Biology</option>
            <option value="Computer Science">Computer Science</option>
          </select>
        </div>
      </div>

      {/* Subject Marks */}
      <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16, border: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', marginBottom: 12 }}>📚 Subject-wise Marks (out of 100 each)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {HSC_SUBJECTS.map(s => (
            <div key={s.key}>
              <label style={lbl}>{s.label}</label>
              <input style={inp} type="number" min="0" max="100" value={form[s.key]} onChange={e => set(s.key, e.target.value)} placeholder="0–100" />
            </div>
          ))}
          <div>
            <label style={lbl}>{form.bio_cs_subject}</label>
            <input style={inp} type="number" min="0" max="100"
              value={form.bio_cs_subject === 'Computer Science' ? form.computer_science : form.biology}
              onChange={e => set(form.bio_cs_subject === 'Computer Science' ? 'computer_science' : 'biology', e.target.value)}
              placeholder="0–100" />
          </div>
        </div>
      </div>

      {/* Computed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <div><label style={lbl}>Total Marks</label><input style={{ ...inp, color: '#34d399', fontWeight: 700 }} value={form.total_marks} readOnly /></div>
        <div><label style={lbl}>Max Marks</label><input style={inp} type="number" value={form.max_marks} onChange={e => set('max_marks', e.target.value)} /></div>
        <div><label style={lbl}>Percentage</label><input style={{ ...inp, color: '#60a5fa', fontWeight: 700 }} value={form.percentage} readOnly /></div>
        <div>
          <label style={lbl}>Cutoff (/ 200) <span style={{ color: '#fbbf24', fontSize: '0.72rem' }}>TN Formula</span></label>
          <input style={{ ...inp, color: '#F4B400', fontWeight: 800, fontSize: '1.05rem' }} value={form.cutoff} readOnly />
        </div>
      </div>

      <div><label style={lbl}>Remarks</label><textarea style={{ ...inp, resize: 'vertical', minHeight: 60 }} value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Any additional notes..." /></div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" onClick={onCancel} style={btnSec}>Cancel</button>
        <button type="submit" style={btnPrimary} disabled={saving}>{saving ? '⏳ Saving...' : '💾 Save HSC Record'}</button>
      </div>
    </form>
  );
}

// ─────────────────────────────────────────────────────────────
// Subject Mark Card (display)
// ─────────────────────────────────────────────────────────────
function SubjectCard({ label, marks, max = 100 }) {
  const pct = marks != null ? (marks / max) * 100 : null;
  const color = pct != null ? gradeColor(pct) : '#666';
  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: '10px 14px' }}>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: '1.15rem', fontWeight: 800, color }}>
        {marks != null ? `${marks} / ${max}` : <span style={{ color: '#555' }}>—</span>}
      </div>
      {pct != null && <ProgressBar value={pct} max={100} color={color} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Academic History Tab (Student Profile integration)
// ─────────────────────────────────────────────────────────────
export function SSLCHSCProfileTab({ studentId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // 'sslc' | 'hsc' | null

  const load = useCallback(async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/sslc-hsc/student/${studentId}`);
      if (res.ok) setData(await res.json());
    } catch (_) {}
    finally { setLoading(false); }
  }, [studentId]);

  useEffect(() => { load(); }, [load]);

  const handleSaved = () => { setEditing(null); load(); };

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading school history...</div>;

  if (editing === 'sslc') return (
    <div className="glass-panel" style={{ padding: 28 }}>
      <h3 style={{ color: '#F4B400', marginBottom: 20, fontSize: '1.1rem', fontWeight: 700 }}>📘 Edit SSLC (10th) Record</h3>
      <SSLCForm studentId={studentId} initialData={data?.sslc} onSaved={handleSaved} onCancel={() => setEditing(null)} />
    </div>
  );
  if (editing === 'hsc') return (
    <div className="glass-panel" style={{ padding: 28 }}>
      <h3 style={{ color: '#818cf8', marginBottom: 20, fontSize: '1.1rem', fontWeight: 700 }}>📗 Edit HSC (12th) Record</h3>
      <HSCForm studentId={studentId} initialData={data?.hsc} onSaved={handleSaved} onCancel={() => setEditing(null)} />
    </div>
  );

  const sslc = data?.sslc;
  const hsc = data?.hsc;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* SSLC Card */}
      <div className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F4B400' }}>📘 SSLC — 10th Standard</h3>
            {sslc && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{sslc.school_name} • {sslc.board} • {sslc.passing_year}</span>}
          </div>
          <button onClick={() => setEditing('sslc')} style={{ ...btnPrimary, padding: '8px 18px', fontSize: '0.82rem' }}>
            {sslc ? '✏️ Edit' : '➕ Add SSLC'}
          </button>
        </div>

        {sslc ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ textAlign: 'center', background: 'rgba(244,180,0,0.08)', borderRadius: 10, padding: '12px 10px', border: '1px solid rgba(244,180,0,0.2)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#F4B400' }}>{sslc.percentage?.toFixed(1)}%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Percentage</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(52,211,153,0.08)', borderRadius: 10, padding: '12px 10px', border: '1px solid rgba(52,211,153,0.2)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399' }}>{sslc.total_marks}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total / {sslc.max_marks}</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(99,102,241,0.08)', borderRadius: 10, padding: '12px 10px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#818cf8' }}>{getGrade(sslc.percentage).grade}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Grade</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(178,34,34,0.08)', borderRadius: 10, padding: '12px 10px', border: '1px solid rgba(178,34,34,0.2)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{sslc.board}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Board</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              {SSLC_SUBJECTS.map(s => <SubjectCard key={s.key} label={s.label} marks={sslc.subjects?.[s.key]} />)}
            </div>
            {sslc.subjects?.optional_subject && <SubjectCard label={sslc.subjects.optional_subject} marks={sslc.subjects.optional_marks} />}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📘</div>
            <p>No SSLC record found. Click <strong>Add SSLC</strong> to enter 10th details.</p>
          </div>
        )}
      </div>

      {/* HSC Card */}
      <div className="glass-panel" style={{ padding: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#818cf8' }}>📗 HSC — 12th Standard</h3>
            {hsc && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{hsc.school_name} • {hsc.board} • {hsc.passing_year}</span>}
          </div>
          <button onClick={() => setEditing('hsc')} style={{ ...btnPrimary, padding: '8px 18px', fontSize: '0.82rem', background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>
            {hsc ? '✏️ Edit' : '➕ Add HSC'}
          </button>
        </div>

        {hsc ? (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 20 }}>
              <div style={{ textAlign: 'center', background: 'rgba(129,140,248,0.08)', borderRadius: 10, padding: '12px 10px', border: '1px solid rgba(129,140,248,0.2)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#818cf8' }}>{hsc.percentage?.toFixed(1)}%</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Percentage</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(244,180,0,0.1)', borderRadius: 10, padding: '12px 10px', border: '2px solid rgba(244,180,0,0.4)' }}>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#F4B400' }}>{hsc.cutoff?.toFixed(2)}</div>
                <div style={{ fontSize: '0.72rem', color: '#F4B400', fontWeight: 700 }}>Cutoff / 200</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(52,211,153,0.08)', borderRadius: 10, padding: '12px 10px', border: '1px solid rgba(52,211,153,0.2)' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399' }}>{hsc.total_marks}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total / {hsc.max_marks}</div>
              </div>
              <div style={{ textAlign: 'center', background: 'rgba(178,34,34,0.08)', borderRadius: 10, padding: '12px 10px', border: '1px solid rgba(178,34,34,0.2)' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff' }}>{hsc.board}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{hsc.stream} Stream</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <SubjectCard label="Language I (Tamil)" marks={hsc.subjects?.language1} />
              <SubjectCard label="Language II (English)" marks={hsc.subjects?.language2} />
              <SubjectCard label="Physics" marks={hsc.subjects?.physics} />
              <SubjectCard label="Chemistry" marks={hsc.subjects?.chemistry} />
              <SubjectCard label="Mathematics" marks={hsc.subjects?.mathematics} />
              <SubjectCard label={hsc.bio_cs_subject || 'Biology'} marks={hsc.bio_cs_subject === 'Computer Science' ? hsc.subjects?.computer_science : hsc.subjects?.biology} />
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>📗</div>
            <p>No HSC record found. Click <strong>Add HSC</strong> to enter 12th details.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Main SSLC/HSC Management Module
// ─────────────────────────────────────────────────────────────
export default function SSLCHSCModule() {
  const [activeTab, setActiveTab] = useState('overview');
  const [students, setStudents] = useState([]);
  const [allSSLC, setAllSSLC] = useState([]);
  const [allHSC, setAllHSC] = useState([]);
  const [report, setReport] = useState(null);
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [editMode, setEditMode] = useState(null); // 'sslc' | 'hsc'
  const [studentData, setStudentData] = useState(null);
  const [toast, setToast] = useState(null);
  const [filters, setFilters] = useState({ board: '', year: '', minPct: '', exam: 'hsc' });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Load students
  useEffect(() => {
    fetch(`${API_BASE}/students?limit=500`)
      .then(r => r.ok ? r.json() : [])
      .then(d => setStudents(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  // Load lists
  const loadLists = useCallback(async () => {
    setLoading(true);
    try {
      const [sslcData, hscData] = await Promise.all([
        listSSLCRecords({ board: filters.board, passingYear: filters.year || undefined, minPercentage: filters.minPct || undefined }),
        listHSCRecords({ board: filters.board, passingYear: filters.year || undefined, minPercentage: filters.minPct || undefined }),
      ]);
      setAllSSLC(Array.isArray(sslcData) ? sslcData : []);
      setAllHSC(Array.isArray(hscData) ? hscData : []);
    } catch (_) {}
    finally { setLoading(false); }
  }, [filters.board, filters.year, filters.minPct]);

  // Load report
  const loadReport = useCallback(async () => {
    try { setReport(await getSummaryReport()); } catch (_) {}
  }, []);

  // Load top performers
  const loadTopPerformers = useCallback(async () => {
    try { setTopPerformers(await getTopPerformers(filters.exam, 20)); } catch (_) {}
  }, [filters.exam]);

  useEffect(() => {
    if (activeTab === 'sslc' || activeTab === 'hsc') loadLists();
    if (activeTab === 'overview') { loadReport(); loadTopPerformers(); }
  }, [activeTab, loadLists, loadReport, loadTopPerformers]);

  // Load student history
  useEffect(() => {
    if (!selectedStudent) { setStudentData(null); return; }
    fetch(`${API_BASE}/sslc-hsc/student/${selectedStudent.id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => setStudentData(d))
      .catch(() => {});
  }, [selectedStudent]);

  const handleSaved = (type) => {
    showToast(`✅ ${type === 'sslc' ? 'SSLC' : 'HSC'} record saved successfully!`);
    setEditMode(null);
    if (selectedStudent) {
      fetch(`${API_BASE}/sslc-hsc/student/${selectedStudent.id}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => setStudentData(d)).catch(() => {});
    }
    loadLists();
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type.toUpperCase()} record? This cannot be undone.`)) return;
    try {
      if (type === 'sslc') await deleteSSLC(id);
      else await deleteHSC(id);
      showToast(`🗑️ ${type.toUpperCase()} record deleted`);
      if (selectedStudent) {
        fetch(`${API_BASE}/sslc-hsc/student/${selectedStudent.id}`)
          .then(r => r.ok ? r.json() : null)
          .then(d => setStudentData(d)).catch(() => {});
      }
      loadLists();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const filteredStudents = students.filter(s => {
    if (!studentSearch.trim()) return true;
    const q = studentSearch.toLowerCase();
    return s.full_name?.toLowerCase().includes(q) || s.register_number?.toLowerCase().includes(q) || s.roll_number?.toLowerCase().includes(q);
  });

  const tabs = [
    { id: 'overview', label: '📊 Overview & Reports', color: '#F4B400' },
    { id: 'student', label: '🎓 Student SSLC/HSC', color: '#34d399' },
    { id: 'sslc', label: '📘 All SSLC Records', color: '#60a5fa' },
    { id: 'hsc', label: '📗 All HSC Records', color: '#818cf8' },
    { id: 'toppers', label: '🏆 Top Performers', color: '#fbbf24' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', top: 24, right: 24, padding: '12px 22px', borderRadius: 10, background: toast.type === 'error' ? '#7f1d1d' : '#14532d', color: '#fff', fontWeight: 700, boxShadow: '0 8px 24px rgba(0,0,0,0.4)', zIndex: 9999, border: `1px solid ${toast.type === 'error' ? '#ef4444' : '#22c55e'}` }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="glass-panel" style={{ padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>
            <span style={{ color: '#F4B400' }}>📚</span> SSLC & HSC Academic Module
          </h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            10th & 12th School Academic History — Linked to Student Master
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-vsb">{allSSLC.length} SSLC Records</span>
          <span className="badge badge-gold">{allHSC.length} HSC Records</span>
        </div>
      </div>

      {/* Tab Bar */}
      <div style={{ display: 'flex', gap: 6, background: 'rgba(255,255,255,0.03)', padding: 6, borderRadius: 12, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: activeTab === t.id ? `linear-gradient(135deg, ${t.color}22, ${t.color}11)` : 'transparent', color: activeTab === t.id ? t.color : 'var(--text-muted)', fontWeight: activeTab === t.id ? 700 : 500, fontSize: '0.85rem', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: activeTab === t.id ? `0 0 12px ${t.color}44, inset 0 0 0 1px ${t.color}55` : 'none' }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: OVERVIEW ─── */}
      {activeTab === 'overview' && report && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Overview stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
            <StatCard icon="🏫" label="Active Students" value={report.overview.total_active_students} sub="Registered in system" color="#60a5fa" />
            <StatCard icon="📘" label="SSLC Records" value={report.overview.students_with_sslc_record} sub={`${report.overview.sslc_coverage_pct}% coverage`} color="#F4B400" />
            <StatCard icon="📗" label="HSC Records" value={report.overview.students_with_hsc_record} sub={`${report.overview.hsc_coverage_pct}% coverage`} color="#818cf8" />
            <StatCard icon="📊" label="Avg SSLC %" value={`${report.sslc_stats.avg_percentage}%`} sub={`Max: ${report.sslc_stats.max_percentage}%`} color="#34d399" />
            <StatCard icon="✂️" label="Avg HSC Cutoff" value={report.hsc_stats.avg_cutoff} sub="Out of 200" color="#fbbf24" />
          </div>

          {/* SSLC + HSC stats side by side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* SSLC stats */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ color: '#F4B400', fontWeight: 700, marginBottom: 18, fontSize: '1rem' }}>📘 SSLC Statistics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Average %', report.sslc_stats.avg_percentage], ['Highest %', report.sslc_stats.max_percentage], ['Lowest %', report.sslc_stats.min_percentage], ['Avg Maths', report.sslc_stats.avg_mathematics], ['Avg Science', report.sslc_stats.avg_science]].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 700, color: gradeColor(val) }}>{val}%</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Board Distribution</div>
                {Object.entries(report.sslc_stats.board_distribution || {}).map(([b, c]) => (
                  <div key={b} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                    <span style={{ color: '#fff' }}>{b}</span>
                    <span className="badge badge-gold">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* HSC stats */}
            <div className="glass-panel" style={{ padding: 24 }}>
              <h3 style={{ color: '#818cf8', fontWeight: 700, marginBottom: 18, fontSize: '1rem' }}>📗 HSC Statistics</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[['Average %', report.hsc_stats.avg_percentage], ['Highest %', report.hsc_stats.max_percentage], ['Lowest %', report.hsc_stats.min_percentage], ['Avg Cutoff', report.hsc_stats.avg_cutoff], ['Avg Physics', report.hsc_stats.avg_physics], ['Avg Chemistry', report.hsc_stats.avg_chemistry]].map(([label, val]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>{label}</span>
                    <span style={{ fontWeight: 700, color: gradeColor(val) }}>{val}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8 }}>Board Distribution</div>
                {Object.entries(report.hsc_stats.board_distribution || {}).map(([b, c]) => (
                  <div key={b} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 6 }}>
                    <span style={{ color: '#fff' }}>{b}</span>
                    <span className="badge badge-indigo">{c}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Percentage distribution buckets */}
          <div className="glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 18, fontSize: '1rem', color: '#fff' }}>📊 Percentage Distribution</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {['sslc', 'hsc'].map(exam => {
                const bk = report[`${exam}_stats`].percentage_buckets;
                const total = Object.values(bk).reduce((a, b) => a + b, 0) || 1;
                return (
                  <div key={exam}>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: exam === 'sslc' ? '#F4B400' : '#818cf8', marginBottom: 10 }}>{exam.toUpperCase()} Distribution</div>
                    {[['90–100%', bk['90_100'], '#34d399'], ['80–89%', bk['80_89'], '#60a5fa'], ['70–79%', bk['70_79'], '#fbbf24'], ['60–69%', bk['60_69'], '#fb923c'], ['Below 60%', bk['below_60'], '#f87171']].map(([label, count, color]) => (
                      <div key={label} style={{ marginBottom: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 3 }}>
                          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
                          <span style={{ color, fontWeight: 700 }}>{count} students</span>
                        </div>
                        <ProgressBar value={count} max={total} color={color} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB: STUDENT SSLC/HSC ─── */}
      {activeTab === 'student' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Student Selector */}
          <div className="glass-panel" style={{ padding: 20 }}>
            <div style={{ fontWeight: 700, color: '#fff', marginBottom: 12 }}>🔍 Select Student</div>
            <input className="input-field" placeholder="Search by name, register number or roll number..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} style={{ marginBottom: 12 }} />
            {studentSearch && (
              <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 8 }}>
                {filteredStudents.slice(0, 15).map(s => (
                  <div key={s.id} onClick={() => { setSelectedStudent(s); setStudentSearch(''); setEditMode(null); }}
                    style={{ padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.04)', background: selectedStudent?.id === s.id ? 'rgba(244,180,0,0.1)' : 'transparent', display: 'flex', gap: 12, alignItems: 'center' }}>
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.full_name)}&background=B22222&color=F4B400&size=36`} alt={s.full_name} style={{ width: 32, height: 32, borderRadius: '50%' }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>{s.full_name}</div>
                      <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{s.register_number} • {s.department_name}</div>
                    </div>
                  </div>
                ))}
                {filteredStudents.length === 0 && <div style={{ padding: 16, color: 'var(--text-muted)', fontSize: '0.85rem' }}>No students found.</div>}
              </div>
            )}
            {selectedStudent && (
              <div style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', padding: '10px 14px', background: 'rgba(178,34,34,0.1)', borderRadius: 8, border: '1px solid rgba(178,34,34,0.3)' }}>
                <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.full_name)}&background=B22222&color=F4B400&size=40`} alt={selectedStudent.full_name} style={{ width: 38, height: 38, borderRadius: '50%' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ color: '#fff' }}>{selectedStudent.full_name}</strong>
                  <span style={{ color: '#F4B400', fontSize: '0.8rem', marginLeft: 10 }}>{selectedStudent.register_number}</span>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{selectedStudent.department_name}</div>
                </div>
                <button onClick={() => setSelectedStudent(null)} style={{ ...btnSec, padding: '4px 10px', fontSize: '0.78rem' }}>✕ Clear</button>
              </div>
            )}
          </div>

          {selectedStudent && studentData !== null && (
            <>
              {editMode === 'sslc' && (
                <div className="glass-panel" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ color: '#F4B400', fontWeight: 800, fontSize: '1.1rem' }}>📘 SSLC (10th) — {selectedStudent.full_name}</h3>
                    <button onClick={() => setEditMode(null)} style={{ ...btnSec, padding: '6px 14px', fontSize: '0.8rem' }}>✕ Cancel</button>
                  </div>
                  <SSLCForm studentId={selectedStudent.id} initialData={studentData?.sslc} onSaved={() => handleSaved('sslc')} onCancel={() => setEditMode(null)} />
                </div>
              )}
              {editMode === 'hsc' && (
                <div className="glass-panel" style={{ padding: 28 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ color: '#818cf8', fontWeight: 800, fontSize: '1.1rem' }}>📗 HSC (12th) — {selectedStudent.full_name}</h3>
                    <button onClick={() => setEditMode(null)} style={{ ...btnSec, padding: '6px 14px', fontSize: '0.8rem' }}>✕ Cancel</button>
                  </div>
                  <HSCForm studentId={selectedStudent.id} initialData={studentData?.hsc} onSaved={() => handleSaved('hsc')} onCancel={() => setEditMode(null)} />
                </div>
              )}

              {!editMode && (
                <SSLCHSCProfileTab studentId={selectedStudent.id} />
              )}

              {!editMode && (
                <div style={{ display: 'flex', gap: 12 }}>
                  <button onClick={() => setEditMode('sslc')} style={{ ...btnPrimary, flex: 1 }}>{studentData?.sslc ? '✏️ Edit SSLC (10th)' : '➕ Add SSLC (10th)'}</button>
                  <button onClick={() => setEditMode('hsc')} style={{ ...btnPrimary, flex: 1, background: 'linear-gradient(135deg, #6366f1, #4338ca)' }}>{studentData?.hsc ? '✏️ Edit HSC (12th)' : '➕ Add HSC (12th)'}</button>
                  {studentData?.sslc && <button onClick={() => handleDelete('sslc', studentData.sslc.id)} style={{ ...btnDanger }}>🗑️ Delete SSLC</button>}
                  {studentData?.hsc && <button onClick={() => handleDelete('hsc', studentData.hsc.id)} style={{ ...btnDanger }}>🗑️ Delete HSC</button>}
                </div>
              )}
            </>
          )}
          {selectedStudent && studentData === null && (
            <div style={{ padding: 30, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          )}
        </div>
      )}

      {/* ─── TAB: ALL SSLC RECORDS ─── */}
      {activeTab === 'sslc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Filters */}
          <div className="glass-panel" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select style={{ ...inp, width: 150 }} value={filters.board} onChange={e => setFilters(p => ({ ...p, board: e.target.value }))}>
              <option value="">All Boards</option>
              {BOARDS.map(b => <option key={b}>{b}</option>)}
            </select>
            <select style={{ ...inp, width: 120 }} value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
            <input style={{ ...inp, width: 140 }} type="number" placeholder="Min % (e.g. 75)" value={filters.minPct} onChange={e => setFilters(p => ({ ...p, minPct: e.target.value }))} />
            <button onClick={loadLists} style={btnPrimary}>{loading ? '⏳' : '🔍'} Filter</button>
            <button onClick={() => setFilters(p => ({ ...p, board: '', year: '', minPct: '' }))} style={btnSec}>Clear</button>
            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{allSSLC.length} records</span>
          </div>

          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(244,180,0,0.06)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {['#', 'Student', 'School', 'Board', 'Year', 'Reg No', 'Maths', 'Science', 'Total', 'Percentage', 'Grade'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allSSLC.map((r, i) => {
                  const stu = students.find(s => s.id === r.student_id);
                  const g = getGrade(r.percentage || 0);
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.84rem' }}>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{stu?.full_name || r.student_id.slice(0, 8)}</div>
                        <div style={{ fontSize: '0.72rem', color: '#F4B400' }}>{stu?.register_number || ''}</div>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.school_name || '—'}</td>
                      <td style={{ padding: '10px 14px' }}><span className="badge badge-gold" style={{ fontSize: '0.72rem' }}>{r.board}</span></td>
                      <td style={{ padding: '10px 14px', color: '#fff' }}>{r.passing_year}</td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{r.register_number || '—'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: gradeColor(r.subjects?.mathematics) }}>{r.subjects?.mathematics ?? '—'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: gradeColor(r.subjects?.science) }}>{r.subjects?.science ?? '—'}</td>
                      <td style={{ padding: '10px 14px', color: '#fff' }}>{r.total_marks} / {r.max_marks}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: 800, color: gradeColor(r.percentage) }}>{r.percentage?.toFixed(1)}%</span>
                        <ProgressBar value={r.percentage} color={gradeColor(r.percentage)} />
                      </td>
                      <td style={{ padding: '10px 14px' }}><span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>{g.grade}</span></td>
                    </tr>
                  );
                })}
                {allSSLC.length === 0 && (
                  <tr><td colSpan={11} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>{loading ? '⏳ Loading...' : 'No SSLC records found.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: ALL HSC RECORDS ─── */}
      {activeTab === 'hsc' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-panel" style={{ padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <select style={{ ...inp, width: 150 }} value={filters.board} onChange={e => setFilters(p => ({ ...p, board: e.target.value }))}>
              <option value="">All Boards</option>
              {BOARDS.map(b => <option key={b}>{b}</option>)}
            </select>
            <select style={{ ...inp, width: 120 }} value={filters.year} onChange={e => setFilters(p => ({ ...p, year: e.target.value }))}>
              <option value="">All Years</option>
              {YEARS.map(y => <option key={y}>{y}</option>)}
            </select>
            <input style={{ ...inp, width: 140 }} type="number" placeholder="Min % (e.g. 75)" value={filters.minPct} onChange={e => setFilters(p => ({ ...p, minPct: e.target.value }))} />
            <button onClick={loadLists} style={btnPrimary}>{loading ? '⏳' : '🔍'} Filter</button>
            <button onClick={() => setFilters(p => ({ ...p, board: '', year: '', minPct: '' }))} style={btnSec}>Clear</button>
            <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)' }}>{allHSC.length} records</span>
          </div>

          <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(129,140,248,0.06)', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {['#', 'Student', 'School', 'Board', 'Year', 'Stream', 'Physics', 'Chemistry', 'Maths', 'Bio/CS', 'Cutoff', 'Percentage', 'Grade'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allHSC.map((r, i) => {
                  const stu = students.find(s => s.id === r.student_id);
                  const g = getGrade(r.percentage || 0);
                  const bioCs = r.bio_cs_subject === 'Computer Science' ? r.subjects?.computer_science : r.subjects?.biology;
                  return (
                    <tr key={r.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: '0.84rem' }}>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)' }}>{i + 1}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: 700, color: '#fff' }}>{stu?.full_name || r.student_id.slice(0, 8)}</div>
                        <div style={{ fontSize: '0.72rem', color: '#F4B400' }}>{stu?.register_number || ''}</div>
                      </td>
                      <td style={{ padding: '10px 14px', color: 'var(--text-muted)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.school_name || '—'}</td>
                      <td style={{ padding: '10px 14px' }}><span className="badge badge-indigo" style={{ fontSize: '0.72rem' }}>{r.board}</span></td>
                      <td style={{ padding: '10px 14px', color: '#fff' }}>{r.passing_year}</td>
                      <td style={{ padding: '10px 14px' }}><span style={{ fontSize: '0.76rem', color: '#818cf8' }}>{r.stream}</span></td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: gradeColor(r.subjects?.physics) }}>{r.subjects?.physics ?? '—'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: gradeColor(r.subjects?.chemistry) }}>{r.subjects?.chemistry ?? '—'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: gradeColor(r.subjects?.mathematics) }}>{r.subjects?.mathematics ?? '—'}</td>
                      <td style={{ padding: '10px 14px', fontWeight: 700, color: gradeColor(bioCs) }}>{bioCs ?? '—'}<div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{r.bio_cs_subject}</div></td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#F4B400' }}>{r.cutoff?.toFixed(2)}</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>/200</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontWeight: 800, color: gradeColor(r.percentage) }}>{r.percentage?.toFixed(1)}%</span>
                        <ProgressBar value={r.percentage} color={gradeColor(r.percentage)} />
                      </td>
                      <td style={{ padding: '10px 14px' }}><span className="badge badge-emerald" style={{ fontSize: '0.72rem' }}>{g.grade}</span></td>
                    </tr>
                  );
                })}
                {allHSC.length === 0 && (
                  <tr><td colSpan={13} style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>{loading ? '⏳ Loading...' : 'No HSC records found.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── TAB: TOP PERFORMERS ─── */}
      {activeTab === 'toppers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="glass-panel" style={{ padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontWeight: 700, color: '#fbbf24', fontSize: '0.88rem' }}>Exam:</span>
            {['sslc', 'hsc'].map(e => (
              <button key={e} onClick={() => setFilters(p => ({ ...p, exam: e }))} style={{ padding: '6px 18px', borderRadius: 8, border: 'none', background: filters.exam === e ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'rgba(255,255,255,0.06)', color: filters.exam === e ? '#000' : '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}>
                {e.toUpperCase()}
              </button>
            ))}
            <button onClick={loadTopPerformers} style={{ ...btnPrimary, padding: '6px 16px', fontSize: '0.82rem', marginLeft: 8 }}>🔄 Refresh</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
            {topPerformers.map((r, i) => {
              const stu = students.find(s => s.id === r.student_id);
              return (
                <div key={r.id} style={{ background: i < 3 ? 'linear-gradient(135deg, rgba(244,180,0,0.08), rgba(178,34,34,0.04))' : 'rgba(255,255,255,0.03)', border: `1px solid ${i < 3 ? 'rgba(244,180,0,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: '16px 18px', display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div style={{ fontSize: i === 0 ? '2rem' : '1.4rem', minWidth: 36, textAlign: 'center' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 800, color: '#fff', fontSize: '0.92rem' }}>{stu?.full_name || 'Student'}</div>
                    <div style={{ fontSize: '0.74rem', color: '#F4B400' }}>{stu?.register_number}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.school_name} • {r.board} • {r.passing_year}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: gradeColor(r.percentage) }}>{r.percentage?.toFixed(1)}%</div>
                    {filters.exam === 'hsc' && r.cutoff && <div style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>Cutoff: {r.cutoff}</div>}
                  </div>
                </div>
              );
            })}
            {topPerformers.length === 0 && (
              <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                No top performer data available. Add SSLC/HSC records first.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Shared Style Objects
// ─────────────────────────────────────────────────────────────
const lbl = { fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 5, fontWeight: 600 };
const inp = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' };
const btnPrimary = { padding: '10px 22px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg, #B22222, #8B0000)', color: '#fff', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', whiteSpace: 'nowrap' };
const btnSec = { padding: '10px 18px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' };
const btnDanger = { padding: '10px 16px', borderRadius: 8, border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.12)', color: '#f87171', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer' };
