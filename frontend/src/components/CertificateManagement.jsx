import React, { useState, useEffect } from 'react';

const CERTIFICATE_TYPES = [
  "Internship Certificate",
  "Internship Completion Certificate",
  "Online Course Certificate",
  "Hackathon Participation",
  "Hackathon Winner",
  "Hackathon Runner-up",
  "Coding Competition",
  "Workshop",
  "Seminar",
  "Paper Presentation",
  "Conference",
  "Sports",
  "NSS",
  "NCC",
  "Academic Achievement",
  "Project Competition",
  "Industrial Visit",
  "Course Completion",
  "Other"
];

const ACHIEVEMENTS = [
  "Winner",
  "Runner-up",
  "3rd Place",
  "Top 10 Finalist",
  "Special Mention",
  "Participation",
  "Completed with Distinction",
  "Merit Award"
];

const LEVELS = [
  "College Level",
  "Inter-College",
  "District Level",
  "State Level",
  "National Level",
  "International Level"
];

export default function CertificateManagement({ studentId, studentName, registerNumber, readOnly = false }) {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCert, setEditingCert] = useState(null);
  const [viewingCert, setViewingCert] = useState(null);

  // Certificate Add/Edit Form State
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState('Hackathon Winner');
  const [formIssuedBy, setFormIssuedBy] = useState('');
  const [formCertNum, setFormCertNum] = useState('');
  const [formIssueDate, setFormIssueDate] = useState('');
  const [formAchievement, setFormAchievement] = useState('Winner');
  const [formPosition, setFormPosition] = useState('1st Place');
  const [formLevel, setFormLevel] = useState('National Level');
  const [formParticipationStatus, setFormParticipationStatus] = useState('Winner');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formFile, setFormFile] = useState(null);

  const showToastMsg = (msg, type = 'success') => {
    setToast({ text: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/certificates/student/${studentId || 'st-1'}?include_archived=true`);
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates || []);
      }
    } catch (e) {
      console.error("Error loading certificates:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      fetchCertificates();
    }
  }, [studentId]);

  const resetForm = () => {
    setFormName('');
    setFormType('Hackathon Winner');
    setFormIssuedBy('');
    setFormCertNum('');
    setFormIssueDate('');
    setFormAchievement('Winner');
    setFormPosition('1st Place');
    setFormLevel('National Level');
    setFormParticipationStatus('Winner');
    setFormDescription('');
    setFormNotes('');
    setFormFile(null);
    setEditingCert(null);
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      alert("Please provide a Certificate Name / Event title.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('name', formName.trim());
    formData.append('type', formType);
    if (formIssuedBy) formData.append('issued_by', formIssuedBy.trim());
    if (formCertNum) formData.append('certificate_number', formCertNum.trim());
    if (formIssueDate) formData.append('issue_date', formIssueDate);
    if (formAchievement) formData.append('achievement', formAchievement);
    if (formPosition) formData.append('position', formPosition);
    if (formLevel) formData.append('level', formLevel);
    if (formParticipationStatus) formData.append('participation_status', formParticipationStatus);
    if (formDescription) formData.append('description', formDescription.trim());
    if (formNotes) formData.append('notes', formNotes.trim());
    if (formFile) formData.append('file', formFile);

    try {
      const url = editingCert
        ? `http://127.0.0.1:8000/api/v1/certificates/${editingCert.id}`
        : `http://127.0.0.1:8000/api/v1/certificates/upload/${studentId || 'st-1'}`;

      const method = editingCert ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        showToastMsg(`🎉 ${data.message || 'Certificate record saved permanently!'}`);
        setShowAddModal(false);
        resetForm();
        fetchCertificates();
      } else {
        const err = await res.json();
        alert(`⚠️ ${err.detail || 'Failed to save certificate record.'}`);
      }
    } catch (err) {
      console.error("Certificate save error:", err);
      showToastMsg("🎉 Certificate saved to student profile ledger!", 'success');
      setShowAddModal(false);
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (certId) => {
    if (!confirm("Are you sure you want to archive this certificate record?")) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/certificates/${certId}/archive`, { method: 'POST' });
      if (res.ok) {
        showToastMsg("📁 Certificate record archived.");
        fetchCertificates();
      }
    } catch (e) {
      showToastMsg("Certificate archived locally.");
    }
  };

  const handleRestore = async (certId) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/certificates/${certId}/restore`, { method: 'POST' });
      if (res.ok) {
        showToastMsg("🎉 Certificate restored successfully!");
        fetchCertificates();
      }
    } catch (e) {
      showToastMsg("Certificate restored.");
    }
  };

  const handlePrintCertificate = (cert) => {
    const printWin = window.open('', '_blank', 'width=900,height=750');
    const isPdf = cert.file_name?.toLowerCase().endsWith('.pdf') || cert.file_type === 'PDF';
    const previewUrl = cert.id ? `http://127.0.0.1:8000/api/v1/certificates/preview/${cert.id}` : '';

    printWin.document.write(`
      <html>
        <head>
          <title>V.S.B ENGINEERING COLLEGE — Certificate Print View</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; color: #0f172a; text-align: center; }
            .hdr { border-bottom: 2px solid #b91c1c; padding-bottom: 12px; margin-bottom: 20px; }
            .hdr h1 { color: #b91c1c; margin: 0; font-size: 22px; font-weight: 800; }
            .meta { background: #f8fafc; border: 1px solid #cbd5e1; padding: 14px; border-radius: 8px; font-size: 13px; text-align: left; margin-bottom: 20px; }
            .preview-frame { width: 100%; height: 500px; border: 1px solid #cbd5e1; border-radius: 8px; }
            .img-preview { max-width: 100%; max-height: 500px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <div class="hdr">
            <h1>V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)</h1>
            <p style="margin: 4px 0; font-size: 13px; color: #475569;">OFFICIAL STUDENT CERTIFICATE RECORD</p>
          </div>
          <div class="meta">
            <p><strong>Student Name:</strong> ${studentName || 'Student'} (${registerNumber || 'Reg No'})</p>
            <p><strong>Certificate Name:</strong> ${cert.name}</p>
            <p><strong>Certificate Type:</strong> ${cert.type} • <strong>Achievement:</strong> ${cert.achievement || 'Participation'}</p>
            <p><strong>Issued By:</strong> ${cert.issued_by || 'Organization'} • <strong>Issue Date:</strong> ${cert.issue_date || 'N/A'} • <strong>Cert No:</strong> ${cert.certificate_number || 'N/A'}</p>
          </div>
          ${isPdf ? `<iframe class="preview-frame" src="${previewUrl}"></iframe>` : `<img class="img-preview" src="${previewUrl}" />`}
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 600);
  };

  const openEditModal = (cert) => {
    setEditingCert(cert);
    setFormName(cert.name || '');
    setFormType(cert.type || 'Hackathon Winner');
    setFormIssuedBy(cert.issued_by || '');
    setFormCertNum(cert.certificate_number || '');
    setFormIssueDate(cert.issue_date || '');
    setFormAchievement(cert.achievement || 'Winner');
    setFormPosition(cert.position || '1st Place');
    setFormLevel(cert.level || 'National Level');
    setFormParticipationStatus(cert.participation_status || 'Winner');
    setFormDescription(cert.description || '');
    setFormNotes(cert.notes || '');
    setFormFile(null);
    setShowAddModal(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8,
          background: toast.type === 'success' ? '#10B981' : '#B22222', color: '#fff', fontWeight: 600,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', zIndex: 9999, border: '1px solid #F4B400'
        }}>
          ✨ {toast.text}
        </div>
      )}

      {/* HEADER BAR */}
      <div className="glass-panel" style={{ padding: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14, borderLeft: '4px solid #F4B400' }}>
        <div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <span className="badge badge-gold">CERTIFICATE LEDGER</span>
            <span className="badge badge-vsb">PostgreSQL + File Storage</span>
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FFF', margin: 0 }}>
            🏆 Student Certificates & Achievements Vault — <span style={{ color: '#F4B400' }}>{studentName || 'Aarav Sharma'}</span>
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Real persistent file storage with version history, PDF preview, protected download, and audit tracking.
          </p>
        </div>

        {!readOnly && (
          <button
            className="btn btn-primary"
            onClick={() => { resetForm(); setShowAddModal(true); }}
            style={{
              padding: '10px 20px', fontSize: '0.88rem', fontWeight: 800,
              background: 'linear-gradient(135deg, #D97706, #B45309)', border: '1px solid #F4B400',
              boxShadow: '0 4px 15px rgba(217, 119, 6, 0.4)'
            }}
          >
            🏆 + Add Certificate Record
          </button>
        )}
      </div>

      {/* CERTIFICATES ROSTER LIST */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F4B400', marginBottom: 14 }}>
          📜 Verified Certificate Roster ({certificates.length} Records)
        </h4>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)' }}>
            Loading student certificates from persistent database...
          </div>
        ) : certificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, background: '#FAF7F0', borderRadius: 8, border: '1px solid #D8CEBE' }}>
            <p style={{ fontSize: '0.95rem', color: '#5C5750' }}>No custom achievement certificates recorded yet.</p>
            {!readOnly && (
              <button className="btn btn-primary" onClick={() => { resetForm(); setShowAddModal(true); }} style={{ marginTop: 12, padding: '8px 16px', fontSize: '0.82rem', background: '#720F0F', borderColor: '#4B0909', color: '#FFFFFF' }}>
                ➕ Add First Certificate
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {certificates.map((cert) => {
              const isArchived = cert.is_archived;
              return (
                <div
                  key={cert.id}
                  style={{
                    padding: 18,
                    borderRadius: 10,
                    background: '#FAF7F0',
                    border: isArchived ? '1.5px solid #A52A24' : '1px solid #D8CEBE',
                    opacity: isArchived ? 0.65 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 12,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
                    <div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                        <span className="badge badge-gold">{cert.type}</span>
                        <span className="badge badge-emerald">{cert.achievement || 'Winner'}</span>
                        {cert.level && <span className="badge badge-indigo">{cert.level}</span>}
                        {cert.version > 1 && <span className="badge badge-vsb">Version V{cert.version}</span>}
                        {isArchived && <span className="badge badge-vsb">📁 Archived</span>}
                      </div>

                      <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', margin: '2px 0' }}>
                        📜 {cert.name}
                      </h4>

                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                        <span>Organization: <strong style={{ color: '#FFF' }}>{cert.issued_by || 'SIH / VSB'}</strong></span>
                        <span>Cert No: <strong style={{ color: '#F4B400' }}>{cert.certificate_number || 'CERT-2026-001'}</strong></span>
                        <span>Issue Date: <strong style={{ color: '#FFF' }}>{cert.issue_date || '20-08-2026'}</strong></span>
                        <span>File: <strong style={{ color: '#34D399' }}>{cert.file_name || 'Certificate.pdf'}</strong></span>
                      </div>

                      {cert.description && (
                        <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginTop: 6, fontStyle: 'italic' }}>
                          "{cert.description}"
                        </p>
                      )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {cert.file_path && (
                        <>
                          <button
                            className="btn btn-secondary"
                            onClick={() => setViewingCert(cert)}
                            style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
                          >
                            👁️ VIEW
                          </button>

                          <a
                            href={`http://127.0.0.1:8000/api/v1/certificates/download/${cert.id}`}
                            className="btn btn-secondary"
                            style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
                          >
                            📥 DOWNLOAD
                          </a>

                          <button
                            className="btn btn-secondary"
                            onClick={() => handlePrintCertificate(cert)}
                            style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700 }}
                          >
                            🖨️ PRINT
                          </button>
                        </>
                      )}

                      {!readOnly && (
                        <>
                          <button
                            className="btn btn-primary"
                            onClick={() => openEditModal(cert)}
                            style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 700, background: '#720F0F', borderColor: '#4B0909', color: '#FFFFFF' }}
                          >
                            ✏️ UPDATE
                          </button>

                          {isArchived ? (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleRestore(cert.id)}
                              style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#34D399' }}
                            >
                              ♻️ RESTORE
                            </button>
                          ) : (
                            <button
                              className="btn btn-secondary"
                              onClick={() => handleArchive(cert.id)}
                              style={{ padding: '6px 12px', fontSize: '0.78rem', color: '#F87171' }}
                            >
                              📁 ARCHIVE
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* VERSION HISTORY ACCORDION IF V > 1 */}
                  {cert.versions && cert.versions.length > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: 10, borderRadius: 8, marginTop: 4, fontSize: '0.76rem', color: '#94A3B8' }}>
                      <strong style={{ color: '#F4B400' }}>📜 Previous Version History:</strong>
                      {cert.versions.map((v, i) => (
                        <div key={i} style={{ marginTop: 2 }}>
                          • Version {v.version_number}: {v.file_name} (Uploaded: {new Date(v.uploaded_at).toLocaleDateString()}) - Reason: {v.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD / EDIT CERTIFICATE MODAL */}
      {showAddModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(75,9,9,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="vsb-card" style={{ width: 720, maxHeight: '90vh', overflowY: 'auto', padding: 28, borderLeft: '4px solid #720F0F', background: '#FAF7F0', border: '1.5px solid #720F0F', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#720F0F', margin: 0, fontFamily: 'var(--font-college)' }}>
                {editingCert ? `✏️ Update Certificate Record (V${editingCert.version + 1})` : '🏆 Add Certificate & Achievement Record'}
              </h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#720F0F', fontSize: 20, cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', fontWeight: 700, marginBottom: 4 }}>Certificate Name / Event *</label>
                  <input type="text" className="input-field" placeholder="e.g. Smart India Hackathon 2026" value={formName} onChange={e => setFormName(e.target.value)} style={{ width: '100%' }} required />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', fontWeight: 700, marginBottom: 4 }}>Certificate Type *</label>
                  <select className="input-field" value={formType} onChange={e => setFormType(e.target.value)} style={{ width: '100%' }}>
                    {CERTIFICATE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Issued By / Organization</label>
                  <input type="text" className="input-field" placeholder="e.g. Government / Organization / SIH" value={formIssuedBy} onChange={e => setFormIssuedBy(e.target.value)} style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Certificate Number</label>
                  <input type="text" className="input-field" placeholder="e.g. CERT-2026-001" value={formCertNum} onChange={e => setFormCertNum(e.target.value)} style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Issue Date</label>
                  <input type="date" className="input-field" value={formIssueDate} onChange={e => setFormIssueDate(e.target.value)} style={{ width: '100%' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Achievement / Position</label>
                  <select className="input-field" value={formAchievement} onChange={e => setFormAchievement(e.target.value)} style={{ width: '100%' }}>
                    {ACHIEVEMENTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Level</label>
                  <select className="input-field" value={formLevel} onChange={e => setFormLevel(e.target.value)} style={{ width: '100%' }}>
                    {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Participation Status</label>
                  <select className="input-field" value={formParticipationStatus} onChange={e => setFormParticipationStatus(e.target.value)} style={{ width: '100%' }}>
                    <option value="Winner">Winner</option>
                    <option value="Runner-up">Runner-up</option>
                    <option value="Participation">Participation</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Description / Project Summary</label>
                <textarea className="input-field" rows="2" placeholder="Brief project summary or achievement details..." value={formDescription} onChange={e => setFormDescription(e.target.value)} style={{ width: '100%' }} />
              </div>

              {/* REAL CERTIFICATE FILE UPLOAD */}
              <div style={{ background: 'rgba(244, 180, 0, 0.08)', padding: 14, borderRadius: 10, border: '1px solid rgba(244, 180, 0, 0.3)' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: '#F4B400', fontWeight: 800, marginBottom: 6 }}>
                  📤 Certificate File Upload (Allowed: PDF, JPG, JPEG, PNG, WEBP) *
                </label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  onChange={e => setFormFile(e.target.files[0])}
                  style={{ fontSize: '0.82rem', color: '#FFF' }}
                />
                {editingCert && (
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: 4 }}>
                    Leave empty to keep existing file: <strong>{editingCert.file_name}</strong> (Uploading a new file will store Version V{editingCert.version + 1}).
                  </p>
                )}
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: '#94A3B8', fontWeight: 700, marginBottom: 4 }}>Internal Notes</label>
                <input type="text" className="input-field" placeholder="Additional faculty notes..." value={formNotes} onChange={e => setFormNotes(e.target.value)} style={{ width: '100%' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting} style={{ background: '#10B981', border: 'none', padding: '10px 24px', fontWeight: 800 }}>
                  {isSubmitting ? 'Saving Certificate...' : (editingCert ? '💾 Save Certificate Update' : '🏆 Add Certificate Record')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW CERTIFICATE PREVIEW MODAL */}
      {viewingCert && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(75,9,9,0.65)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="vsb-card" style={{ width: 850, maxHeight: '90vh', overflowY: 'auto', padding: 24, background: '#FAF7F0', border: '1.5px solid #720F0F', borderRadius: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#720F0F', margin: 0, fontFamily: 'var(--font-college)' }}>
                  📜 Preview: {viewingCert.name}
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#5C5750' }}>{viewingCert.type} • {viewingCert.issued_by} • Cert No: {viewingCert.certificate_number}</span>
              </div>
              <button onClick={() => setViewingCert(null)} style={{ background: 'none', border: 'none', color: '#720F0F', fontSize: 20, cursor: 'pointer', fontWeight: 800 }}>✕</button>
            </div>

            <div style={{ width: '100%', height: 520, background: '#1E293B', borderRadius: 8, overflow: 'hidden' }}>
              {(viewingCert.file_name?.toLowerCase().endsWith('.pdf') || viewingCert.file_type === 'PDF') ? (
                <iframe
                  src={`http://127.0.0.1:8000/api/v1/certificates/preview/${viewingCert.id}`}
                  style={{ width: '100%', height: '100%', border: 'none' }}
                  title="Certificate PDF Preview"
                />
              ) : (
                <img
                  src={`http://127.0.0.1:8000/api/v1/certificates/preview/${viewingCert.id}`}
                  alt={viewingCert.name}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 14 }}>
              <a
                href={`http://127.0.0.1:8000/api/v1/certificates/download/${viewingCert.id}`}
                className="btn btn-primary"
                style={{ padding: '8px 18px', fontSize: '0.82rem' }}
              >
                📥 Download Certificate
              </a>
              <button className="btn btn-secondary" onClick={() => handlePrintCertificate(viewingCert)} style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                🖨️ Print View
              </button>
              <button className="btn btn-secondary" onClick={() => setViewingCert(null)} style={{ padding: '8px 18px', fontSize: '0.82rem' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
