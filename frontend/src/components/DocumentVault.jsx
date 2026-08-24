import React, { useState, useEffect } from 'react';

const ALL_31_DOCUMENT_TYPES = [
  // Identity
  { id: 'aadhaar_card', title: 'Aadhaar Card', category: 'Identity Documents', required: true, icon: '🪪' },
  { id: 'passport', title: 'Passport', category: 'Identity Documents', required: false, icon: '✈️' },
  { id: 'pan_card', title: 'PAN Card', category: 'Identity Documents', required: false, icon: '💳' },
  { id: 'driving_licence', title: 'Driving Licence', category: 'Identity Documents', required: false, icon: '🚗' },
  { id: 'voter_id', title: 'Voter ID', category: 'Identity Documents', required: false, icon: '🗳️' },

  // Academic
  { id: 'mark_10th', title: '10th SSLC Marksheet', category: 'Academic Documents', required: true, icon: '📜' },
  { id: 'mark_12th', title: '12th HSC Marksheet', category: 'Academic Documents', required: true, icon: '📜' },
  { id: 'transfer_certificate', title: 'Transfer Certificate (TC)', category: 'Academic Documents', required: true, icon: '🏛️' },
  { id: 'bonafide_certificate', title: 'Bonafide Certificate', category: 'Academic Documents', required: true, icon: '🎓' },
  { id: 'migration_certificate', title: 'Migration Certificate', category: 'Academic Documents', required: false, icon: '📄' },
  { id: 'birth_certificate', title: 'Birth Certificate', category: 'Academic Documents', required: true, icon: '👶' },
  { id: 'admission_certificate', title: 'Admission Allotment Order', category: 'Academic Documents', required: true, icon: '📝' },
  { id: 'diploma_certificate', title: 'Diploma Certificate (Lateral Entry)', category: 'Academic Documents', required: false, icon: '📜' },

  // Community & Category
  { id: 'community_certificate', title: 'Community Certificate', category: 'Government & Community Certificates', required: true, icon: '📄' },
  { id: 'income_certificate', title: 'Income Certificate', category: 'Government & Community Certificates', required: true, icon: '💰' },
  { id: 'nativity_certificate', title: 'Nativity Certificate', category: 'Government & Community Certificates', required: true, icon: '🏠' },
  { id: 'residence_certificate', title: 'Residence Certificate', category: 'Government & Community Certificates', required: false, icon: '🏘️' },

  // Scholarship & First Graduate
  { id: 'first_graduate_certificate', title: 'First Graduate Certificate', category: 'Scholarship Documents', required: true, icon: '🎓' },
  { id: 'scholarship_document', title: 'Scholarship Approval Proof', category: 'Scholarship Documents', required: false, icon: '🪙' },

  // Medical
  { id: 'medical_certificate', title: 'Medical Fitness Certificate', category: 'Medical Documents', required: true, icon: '🏥' },
  { id: 'blood_group_certificate', title: 'Blood Group Certificate', category: 'Medical Documents', required: false, icon: '🩸' },

  // Achievements
  { id: 'hackathon_winner', title: 'Hackathon Winning Certificate', category: 'Achievement Documents', required: false, icon: '🏆' },
  { id: 'hackathon_participation', title: 'Hackathon Participation Certificate', category: 'Achievement Documents', required: false, icon: '🎗️' },
  { id: 'coding_contest', title: 'Coding Contest Award Certificate', category: 'Achievement Documents', required: false, icon: '💻' },
  { id: 'paper_presentation', title: 'Paper Presentation Certificate', category: 'Achievement Documents', required: false, icon: '📑' },
  { id: 'workshop', title: 'Workshop / Seminar Certificate', category: 'Achievement Documents', required: false, icon: '🎙️' },
  { id: 'sports', title: 'Sports & Games Certificate', category: 'Achievement Documents', required: false, icon: '⚽' },
  { id: 'nss', title: 'NSS Service Certificate', category: 'Achievement Documents', required: false, icon: '🎖️' },
  { id: 'ncc', title: 'NCC Cadet Certificate', category: 'Achievement Documents', required: false, icon: '🎖️' },

  // Internships
  { id: 'internship_offer', title: 'Internship Offer Letter', category: 'Internship Documents', required: false, icon: '💼' },
  { id: 'internship_completion', title: 'Internship Completion Certificate', category: 'Internship Documents', required: false, icon: '💼' },

  // Online Courses
  { id: 'online_course_nptel', title: 'NPTEL / SWAYAM Online Course Cert', category: 'Other Documents', required: false, icon: '🖥️' },
  { id: 'online_course_coursera', title: 'Coursera / edX / Infosys Cert', category: 'Other Documents', required: false, icon: '🌐' }
];

export default function DocumentVault({ studentId, registerNumber, studentName }) {
  const [vaultData, setVaultData] = useState(null);
  const [uploadingType, setUploadingType] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [selectedUploadDocType, setSelectedUploadDocType] = useState('aadhaar_card');
  const [searchFilter, setSearchFilter] = useState('');
  const [activeCategoryTab, setActiveCategoryTab] = useState('ALL');

  useEffect(() => {
    fetchVaultData();
  }, [studentId]);

  const fetchVaultData = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/documents/student/${studentId || 'st-1'}/full-vault`);
      if (res.ok) {
        const data = await res.json();
        setVaultData(data);
      }
    } catch (e) {
      console.log("Full vault fetch error:", e);
    }
  };

  const handleFileUpload = async (docType, file) => {
    if (!file) return;
    setUploadingType(docType);
    setStatusMsg(null);

    const formData = new FormData();
    formData.append('doc_type', docType);
    formData.append('reason', 'Faculty Vault Upload');
    formData.append('file', file);

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/documents/upload/${studentId || 'st-1'}`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const data = await res.json();
        setStatusMsg({ type: 'success', text: `🎉 ${data.message || 'Document uploaded successfully!'}` });
        fetchVaultData();
      } else {
        const err = await res.json();
        setStatusMsg({ type: 'error', text: err.detail || 'Upload failed' });
      }
    } catch (e) {
      setStatusMsg({ type: 'error', text: `Upload error: ${e.message}` });
    } finally {
      setUploadingType(null);
    }
  };

  // Printable Document Vault Report
  const handlePrintDocumentReport = () => {
    const printWin = window.open('', '_blank', 'width=900,height=750');
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    
    printWin.document.write(`
      <html>
        <head>
          <title>V.S.B ENGINEERING COLLEGE — Official Student Document Vault Report</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; }
            .header { text-align: center; border-bottom: 3px double #b91c1c; padding-bottom: 16px; margin-bottom: 24px; }
            .header h1 { color: #b91c1c; margin: 0; font-size: 24px; font-weight: 800; }
            .header h2 { margin: 4px 0; font-size: 15px; color: #475569; font-weight: 700; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; font-size: 13px; border: 1px solid #cbd5e1; padding: 14px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
            th { background: #f8fafc; color: #0f172a; font-weight: 700; }
            .sec-title { margin-top: 24px; font-size: 14px; font-weight: 800; color: #b91c1c; border-bottom: 1px solid #b91c1c; padding-bottom: 4px; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>V.S.B. ENGINEERING COLLEGE (AUTONOMOUS)</h1>
            <h2>Karur - 639 111, Tamil Nadu • Accredited by NAAC with 'A' Grade</h2>
            <h3 style="margin: 8px 0 0; color: #0f172a;">OFFICIAL STUDENT DOCUMENT & SCHOLARSHIP AUDIT REPORT</h3>
          </div>
          
          <div class="meta">
            <div>Student Name: <strong>${studentName || 'Aarav Sharma'}</strong></div>
            <div>Register Number: <strong>${registerNumber || '922521104001'}</strong></div>
            <div>Scholarship Status: <strong>${vaultData?.scholarship_profile?.scholarship_name || 'Government First Graduate Waiver'} (Approved)</strong></div>
            <div>First Graduate Status: <strong>YES (Cert No: ${vaultData?.first_graduate_profile?.certificate_number || 'FG2021004921'})</strong></div>
            <div>Native Details: <strong>${vaultData?.native_profile?.native_district || 'Karur'}, ${vaultData?.native_profile?.native_state || 'Tamil Nadu'}</strong></div>
            <div>Generated Date: <strong>${currentDate}</strong></div>
          </div>

          <div class="sec-title">MANDATORY DOCUMENT CHECKLIST & VERIFICATION STATUS</div>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Required Document</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${(vaultData?.checklist || []).map((item, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${item.label}</strong></td>
                  <td>${item.category}</td>
                  <td><strong style="color: ${item.status === 'Uploaded' ? '#15803d' : '#b91c1c'};">${item.status}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <div>Verification Officer Signature</div>
            <div>Head of Department (HOD) Signature</div>
            <div>Principal Executive Seal</div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, borderLeft: '4px solid #F4B400' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span className="badge badge-vsb">V.S.B ENGINEERING COLLEGE</span>
            <span className="badge badge-gold">Cloud-Ready Document Storage (31+ Types)</span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, margin: 0, color: '#fff' }}>
            🔒 Secure Document Vault — {studentName || 'Aarav Sharma'}
          </h2>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Register Number: <strong style={{ color: '#F4B400' }}>{registerNumber || '922521104001'}</strong> • PostgreSQL Encrypted Metadata Vault
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button className="btn btn-primary" onClick={handlePrintDocumentReport} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            🖨️ Print Document Report
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{
          padding: '12px 18px',
          borderRadius: 10,
          background: statusMsg.type === 'success' ? 'rgba(52,211,153,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${statusMsg.type === 'success' ? 'rgba(52,211,153,0.4)' : 'rgba(239,68,68,0.4)'}`,
          color: statusMsg.type === 'success' ? '#34d399' : '#f87171',
          fontWeight: 600,
          fontSize: '0.88rem'
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* SUMMARY HEADER CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
        <div className="glass-panel" style={{ padding: 18, textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Vault Items</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '2px 0' }}>{vaultData?.summary?.total_documents || 7}</div>
          <span className="badge badge-gold">Configured Storage</span>
        </div>

        <div className="glass-panel" style={{ padding: 18, textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Uploaded & Verified</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', margin: '2px 0' }}>{vaultData?.summary?.verified || 7}</div>
          <span className="badge badge-emerald">Verified Original</span>
        </div>

        <div className="glass-panel" style={{ padding: 18, textAlign: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pending Verification</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F4B400', margin: '2px 0' }}>{vaultData?.summary?.pending_verification || 0}</div>
          <span className="badge badge-gold">Under Review</span>
        </div>

        <div className="glass-panel" style={{ padding: 18, textAlign: 'center', borderLeft: (vaultData?.summary?.missing_required || 0) > 0 ? '4px solid #EF4444' : '4px solid #10B981' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Missing Required</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: (vaultData?.summary?.missing_required || 0) > 0 ? '#F87171' : '#34d399', margin: '2px 0' }}>
            {vaultData?.summary?.missing_required || 0}
          </div>
          <span className={`badge ${(vaultData?.summary?.missing_required || 0) > 0 ? 'badge-vsb' : 'badge-emerald'}`}>
            {(vaultData?.summary?.missing_required || 0) > 0 ? 'Action Required' : 'Complete Vault'}
          </span>
        </div>
      </div>

      {/* QUICK UPLOD BAR FOR ANY OF THE 31+ DOCUMENT TYPES */}
      <div className="glass-panel" style={{ padding: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', background: 'rgba(244, 180, 0, 0.05)', border: '1px solid rgba(244, 180, 0, 0.2)' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#F4B400' }}>📤 Universal Document Upload Center</h4>
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Select any document type from 31+ official categories and upload PDF/PNG file.</p>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            className="input-field"
            value={selectedUploadDocType}
            onChange={e => setSelectedUploadDocType(e.target.value)}
            style={{ width: 280, fontSize: '0.85rem' }}
          >
            {ALL_31_DOCUMENT_TYPES.map(doc => (
              <option key={doc.id} value={doc.id}>
                {doc.icon} {doc.title} ({doc.category})
              </option>
            ))}
          </select>

          <label className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem', cursor: 'pointer' }}>
            {uploadingType === selectedUploadDocType ? 'Uploading...' : '📤 Select & Upload File'}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              onChange={e => e.target.files[0] && handleFileUpload(selectedUploadDocType, e.target.files[0])}
            />
          </label>
        </div>
      </div>

      {/* MANDATORY CHECKLIST & ACTIONS */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F4B400', margin: 0 }}>
            📋 Mandatory Document Checklist & Verification
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Configured Institutional Checklist • Interactive Upload Actions
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
          {(vaultData?.checklist || []).map((item, idx) => (
            <div key={idx} style={{
              padding: 14,
              borderRadius: 8,
              background: '#FAF7F0',
              border: item.status === 'Uploaded' ? '1.5px solid #24733E' : '1.5px solid #A52A24',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 10
            }}>
              <div>
                <strong style={{ fontSize: '0.88rem', color: '#2B2926', display: 'block' }}>📄 {item.label}</strong>
                <span style={{ fontSize: '0.75rem', color: item.status === 'Uploaded' ? '#24733E' : '#A52A24', fontWeight: 700 }}>
                  {item.status === 'Uploaded' ? '✓ Uploaded & Verified' : '⚠️ DOCUMENT REQUIRED'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                {item.document_id && (
                  <a
                    href={`http://127.0.0.1:8000/api/v1/documents/preview/${item.document_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    👁️ Preview
                  </a>
                )}

                <label className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>
                  {item.status === 'Uploaded' ? '🔄 Replace' : '📤 Upload'}
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files[0] && handleFileUpload(item.type, e.target.files[0])}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3 DEDICATED PROFILES: SCHOLARSHIP, FIRST GRADUATE, NATIVITY */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        
        {/* SCHOLARSHIP PROFILE */}
        <div className="glass-panel" style={{ padding: 22, borderLeft: '4px solid #F4B400' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#F4B400' }}>📜 Scholarship Profile</h3>
            <span className="badge badge-emerald">Approved</span>
          </div>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p><strong>Scholarship Name:</strong> {vaultData?.scholarship_profile?.scholarship_name || 'Government First Graduate Tuition Fee Waiver'}</p>
            <p><strong>Provider:</strong> {vaultData?.scholarship_profile?.scholarship_provider || 'Government of Tamil Nadu'}</p>
            <p><strong>Academic Year:</strong> {vaultData?.scholarship_profile?.academic_year || '2024-2025'}</p>
            <p><strong>Sanctioned Amount:</strong> <strong style={{ color: '#34d399' }}>₹{vaultData?.scholarship_profile?.amount || 25000} / Year</strong></p>
            <p><strong>Renewal Status:</strong> <span className="badge badge-emerald">{vaultData?.scholarship_profile?.renewal_status || 'Renewed'}</span></p>
          </div>
        </div>

        {/* FIRST GRADUATE PROFILE */}
        <div className="glass-panel" style={{ padding: 22, borderLeft: '4px solid #10B981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#34d399' }}>🎓 First Graduate Profile</h3>
            <span className="badge badge-emerald">First Graduate: YES</span>
          </div>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p><strong>First Graduate Status:</strong> <strong style={{ color: '#34d399' }}>YES (Eligible for Fee Waiver)</strong></p>
            <p><strong>Certificate Number:</strong> {vaultData?.first_graduate_profile?.certificate_number || 'FG2021004921'}</p>
            <p><strong>Issue Date:</strong> {vaultData?.first_graduate_profile?.issue_date || '2021-06-15'}</p>
            <p><strong>Fee Waiver Benefit:</strong> <strong style={{ color: '#34d399' }}>₹25,000 / Year</strong></p>
            <p><strong>Verification Status:</strong> <span className="badge badge-emerald">{vaultData?.first_graduate_profile?.verification_status || 'Verified'}</span></p>
          </div>
        </div>

        {/* NATIVE DETAILS PROFILE */}
        <div className="glass-panel" style={{ padding: 22, borderLeft: '4px solid #818CF8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#818cf8' }}>🏠 Native & Nativity Profile</h3>
            <span className="badge badge-indigo">TN Native</span>
          </div>
          <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <p><strong>Native State:</strong> {vaultData?.native_profile?.native_state || 'Tamil Nadu'}</p>
            <p><strong>Native District / Taluk:</strong> {vaultData?.native_profile?.native_district || 'Karur'} / {vaultData?.native_profile?.native_taluk || 'Karur'}</p>
            <p><strong>Native Village / City:</strong> {vaultData?.native_profile?.native_village || 'Thanthonimalai'} ({vaultData?.native_profile?.native_pincode || '639005'})</p>
            <p><strong>Nativity Status:</strong> <span className="badge badge-indigo">{vaultData?.native_profile?.nativity_status || 'Native of Tamil Nadu'}</span></p>
            <p><strong>Verification Status:</strong> <span className="badge badge-emerald">{vaultData?.native_profile?.verification_status || 'Verified'}</span></p>
          </div>
        </div>

      </div>

      {/* CATEGORY TABS & SEARCH FOR VAULT EXPLORER */}
      <div className="glass-panel" style={{ padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F4B400', margin: 0 }}>
            🗂️ Document Vault Explorer (All 31+ Types)
          </h3>
          <input
            type="text"
            placeholder="🔍 Filter Document Name..."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="input-field"
            style={{ width: 240, fontSize: '0.82rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {['ALL', 'Identity Documents', 'Academic Documents', 'Government & Community Certificates', 'Scholarship Documents', 'Medical Documents', 'Achievement Documents', 'Internship Documents', 'Other Documents'].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryTab(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                background: activeCategoryTab === cat ? '#F4B400' : 'rgba(255,255,255,0.05)',
                color: activeCategoryTab === cat ? '#000' : '#94A3B8',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* DOCUMENT CATEGORIES VAULT GRID */}
        {vaultData?.categories && Object.entries(vaultData.categories)
          .filter(([catTitle]) => activeCategoryTab === 'ALL' || catTitle === activeCategoryTab)
          .map(([catTitle, catDocs]) => (
            <div key={catTitle} style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#818cf8', marginBottom: 10 }}>
                📂 {catTitle} ({catDocs.length} Uploaded)
              </h4>

              {catDocs.length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic', margin: '6px 0 16px 0' }}>
                  No document files currently uploaded in {catTitle}. Use the upload button above to add documents.
                </p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                  {catDocs
                    .filter(d => d.document_name.toLowerCase().includes(searchFilter.toLowerCase()))
                    .map(d => (
                      <div key={d.id} style={{ padding: 14, borderRadius: 8, background: '#FAF7F0', border: '1px solid #D8CEBE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 10, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <strong style={{ fontSize: '0.9rem', color: '#720F0F' }}>📄 {d.document_name}</strong>
                            <span className="badge badge-emerald" style={{ fontSize: '0.7rem' }}>V{d.version} Verified</span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#5C5750' }}>
                            Uploaded: {new Date(d.uploaded_at).toLocaleDateString()} • Size: {(d.file_size_bytes / 1024).toFixed(1)} KB
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <a
                            href={`http://127.0.0.1:8000/api/v1/documents/preview/${d.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            👁️ Preview
                          </a>
                          <a
                            href={`http://127.0.0.1:8000/api/v1/documents/download/${d.id}`}
                            className="btn btn-secondary"
                            style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                          >
                            📥 Download
                          </a>
                          <label className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem', cursor: 'pointer' }}>
                            🔄 Replace
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              style={{ display: 'none' }}
                              onChange={e => e.target.files[0] && handleFileUpload(d.document_type, e.target.files[0])}
                            />
                          </label>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          ))}
      </div>

    </div>
  );
}
