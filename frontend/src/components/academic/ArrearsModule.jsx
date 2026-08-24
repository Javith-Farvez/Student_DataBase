import React, { useState, useEffect } from 'react';

export default function ArrearsModule({ student }) {
  const [arrears, setArrears] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadArrears = async () => {
    if (!student?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/students/${student.id}/academic/arrears`);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.records)) {
          setArrears(data.records);
        }
      }
    } catch (err) {
      console.error("Error loading arrears:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadArrears();
  }, [student?.id]);

  const pendingList = arrears.filter(a => a.arrear_status === 'Pending');
  const clearedList = arrears.filter(a => a.arrear_status === 'Cleared');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header Banner */}
      <div style={{ padding: 24, borderRadius: 12, borderLeft: '4px solid #D69A18', background: 'linear-gradient(135deg, #720F0F 0%, #4B0909 100%)', color: '#FFFFFF', border: '1.5px solid #D69A18', boxShadow: '0 4px 14px rgba(114,15,15,0.2)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', margin: 0, fontFamily: 'var(--font-college)' }}>
          ⚠️ AUTOMATIC ARREAR TRACKING & STANDING LEDGER
        </h2>
        <p style={{ fontSize: '0.88rem', color: '#F9EED4', marginTop: 6, lineHeight: 1.5 }}>
          If Subject Result = FAIL, an arrear record is automatically created. Single active standing arrear tracked per subject across attempts.
        </p>
      </div>

      {/* Summary Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
        <div className="vsb-card" style={{ padding: 20, textAlign: 'center', borderLeft: '4px solid #D69A18', background: '#FAF7F0' }}>
          <span style={{ fontSize: '0.8rem', color: '#5C5750', fontWeight: 700 }}>HISTORICAL ARREARS EVER</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#A96E00', margin: '4px 0' }}>{arrears.length}</div>
          <span className="badge badge-gold">Total Subject Fails</span>
        </div>

        <div className="vsb-card" style={{ padding: 20, textAlign: 'center', borderLeft: '4px solid #720F0F', background: '#FAF7F0' }}>
          <span style={{ fontSize: '0.8rem', color: '#5C5750', fontWeight: 700 }}>PENDING STANDING ARREARS</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: pendingList.length === 0 ? '#24733E' : '#A52A24', margin: '4px 0' }}>
            {pendingList.length}
          </div>
          <span className={`badge ${pendingList.length === 0 ? 'badge-emerald' : 'badge-vsb'}`}>
            {pendingList.length === 0 ? 'All Clear' : 'Requires Re-attempt'}
          </span>
        </div>

        <div className="vsb-card" style={{ padding: 20, textAlign: 'center', borderLeft: '4px solid #24733E', background: '#FAF7F0' }}>
          <span style={{ fontSize: '0.8rem', color: '#5C5750', fontWeight: 700 }}>CLEARED ARREARS</span>
          <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#24733E', margin: '4px 0' }}>{clearedList.length}</div>
          <span className="badge badge-emerald">Passed in Subsequent Exam</span>
        </div>
      </div>

      {/* Arrears List Table */}
      <div className="vsb-card" style={{ padding: 24, background: '#FAF7F0', marginBottom: 30 }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#720F0F', marginBottom: 16 }}>
          📋 Subject Arrear Records & Attempt History
        </h3>

        <div style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #D8CEBE' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left', minWidth: 780 }}>
            <thead>
              <tr style={{ background: '#720F0F', color: '#FFFFFF', borderBottom: '2px solid #5A0A0A' }}>
                <th style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 700 }}>Semester</th>
                <th style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 700 }}>Subject Code</th>
                <th style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 700 }}>Subject Name</th>
                <th style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 700 }}>Type</th>
                <th style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 700 }}>Credits</th>
                <th style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 700 }}>Original Mark</th>
                <th style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 700 }}>Attempt</th>
                <th style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '12px 14px', color: '#FFFFFF', fontWeight: 700 }}>Cleared Details</th>
              </tr>
            </thead>
            <tbody>
              {arrears.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ padding: 30, textAlign: 'center', color: '#24733E', fontWeight: 700 }}>
                    🎉 No standing arrears found for {student?.full_name}! Excellent academic standing.
                  </td>
                </tr>
              ) : (
                arrears.map((arr, idx) => (
                  <tr key={arr.id || idx} style={{ borderBottom: '1px solid #E5DDD0', background: idx % 2 === 0 ? '#FAF7F0' : '#F9F5EC' }}>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#720F0F' }}>Sem {arr.semester}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2B2926' }}>{arr.subject_code}</td>
                    <td style={{ padding: '12px 14px', color: '#2B2926', lineHeight: 1.4 }}>{arr.subject_name}</td>
                    <td style={{ padding: '12px 14px', color: '#5C5750' }}>{arr.subject_type}</td>
                    <td style={{ padding: '12px 14px', color: '#5C5750' }}>{arr.credits}</td>
                    <td style={{ padding: '12px 14px', fontWeight: 700, color: '#A52A24' }}>{arr.original_mark}</td>
                    <td style={{ padding: '12px 14px', color: '#5C5750' }}>Attempt #{arr.attempt_number}</td>
                    <td style={{ padding: '12px 14px' }}>
                      <span className={`badge ${arr.arrear_status === 'Cleared' ? 'badge-emerald' : 'badge-error'}`}>
                        {arr.arrear_status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', color: '#5C5750' }}>
                      {arr.cleared_semester ? `Sem ${arr.cleared_semester} (Mark: ${arr.cleared_mark})` : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
