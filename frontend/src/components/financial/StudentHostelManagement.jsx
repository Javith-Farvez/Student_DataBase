import React, { useState, useEffect } from 'react';

export default function StudentHostelManagement({ student, showToast }) {
  const [loading, setLoading] = useState(false);
  const [hostelRecords, setHostelRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState(student?.current_year || 3);

  // Form State
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [isHosteller, setIsHosteller] = useState(student?.residenceType === 'HOSTELLER' || true);
  const [hostelRequired, setHostelRequired] = useState('Yes');
  const [hostelName, setHostelName] = useState('VSB Main Boys Hostel');
  const [hostelBlock, setHostelBlock] = useState('A Block');
  const [floor, setFloor] = useState('2nd Floor');
  const [roomNumber, setRoomNumber] = useState('204');
  const [bedNumber, setBedNumber] = useState('B1');
  const [messType, setMessType] = useState('Non-Veg');
  const [allocationDate, setAllocationDate] = useState('2024-07-15');
  const [vacatedDate, setVacatedDate] = useState('');
  const [hostelStatus, setHostelStatus] = useState('Active'); // Active, Vacated, Suspended

  // Hostel Fee State
  const [hostelFee, setHostelFee] = useState(45000);
  const [messFee, setMessFee] = useState(35000);
  const [otherHostelFee, setOtherHostelFee] = useState(2000);
  const [scholarshipWaiver, setScholarshipWaiver] = useState(0);
  const [paidAmount, setPaidAmount] = useState(82000);
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [receiptNumber, setReceiptNumber] = useState('HST-REC-2024-089');
  const [remarks, setRemarks] = useState('Hostel room allocated for 3rd year');

  const studentId = student?.id || student?.register_number;

  // Fetch hostel history from FastAPI
  const fetchHostelSummary = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setHostelRecords(data.hostel_records || []);
      }
    } catch (e) {
      console.error("Error loading hostel records:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHostelSummary();
  }, [studentId]);

  // Sync state when selectedYear changes or hostelRecords update
  useEffect(() => {
    if (hostelRecords.length > 0) {
      const rec = hostelRecords.find(r => r.year === selectedYear);
      if (rec) {
        setAcademicYear(rec.academic_year || '2024-2025');
        setIsHosteller(rec.is_hosteller);
        setHostelRequired(rec.hostel_required || 'Yes');
        setHostelName(rec.hostel_name || 'VSB Main Boys Hostel');
        setHostelBlock(rec.hostel_block || 'A Block');
        setFloor(rec.floor || '2nd Floor');
        setRoomNumber(rec.room_number || '204');
        setBedNumber(rec.bed_number || 'B1');
        setMessType(rec.mess_type || 'Non-Veg');
        setHostelStatus(rec.hostel_status || 'Active');
        setHostelFee(rec.hostel_fee || 45000);
        setMessFee(rec.mess_fee || 35000);
        setPaidAmount(rec.paid_amount || 80000);
        setPaymentStatus(rec.payment_status || 'Paid');
      }
    }
  }, [selectedYear, hostelRecords]);

  // Handle Save Hostel Record
  const handleSaveHostelRecord = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/hostel-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          academic_year: academicYear,
          is_hosteller: isHosteller,
          hostel_required: hostelRequired,
          hostel_name: hostelName,
          hostel_block: hostelBlock,
          floor: floor,
          room_number: roomNumber,
          bed_number: bedNumber,
          mess_type: messType,
          allocation_date: allocationDate,
          vacated_date: vacatedDate || null,
          hostel_status: hostelStatus,
          hostel_fee: Number(hostelFee),
          mess_fee: Number(messFee),
          other_hostel_fee: Number(otherHostelFee),
          scholarship_waiver: Number(scholarshipWaiver),
          paid_amount: Number(paidAmount),
          payment_status: paymentStatus,
          receipt_number: receiptNumber,
          remarks: remarks,
          updated_by: 'STAFF_WARDEN'
        })
      });
      if (res.ok) {
        if (showToast) showToast(`🏢 Year ${selectedYear} Hostel record updated for ${student?.full_name || 'student'}!`);
        fetchHostelSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const calculatedHostelTotal = Number(hostelFee) + Number(messFee) + Number(otherHostelFee);
  const calculatedPending = Math.max(0, calculatedHostelTotal - Number(scholarshipWaiver) - Number(paidAmount));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* HEADER BANNER */}
      <div className="glass-panel" style={{ padding: 20, borderLeft: '4px solid #F59E0B' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#F59E0B', fontWeight: 700, textTransform: 'uppercase' }}>
              VSB SMARTCAMPUS — STRUCTURED HOSTEL ALLOCATION & ACCOMMODATION HISTORY
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFF', marginTop: 4 }}>
              🏢 Hostel Allocation: {student?.full_name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#9CA3AF', marginTop: 4 }}>
              Reg No: <strong style={{ color: '#F59E0B' }}>{student?.register_number}</strong> • Dept: <strong style={{ color: '#FFF' }}>{student?.department_name || 'AIDS'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#0B1120', padding: '8px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#D1D5DB' }}>Residence Status:</span>
            <button
              onClick={() => { setIsHosteller(true); setHostelRequired('Yes'); }}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none',
                background: isHosteller ? 'linear-gradient(135deg, #B91C1C, #991B1B)' : 'transparent',
                color: isHosteller ? '#FFF' : '#9CA3AF', fontWeight: 700, cursor: 'pointer'
              }}
            >
              🏢 Hosteller
            </button>
            <button
              onClick={() => { setIsHosteller(false); setHostelRequired('No'); }}
              style={{
                padding: '6px 12px', borderRadius: 6, border: 'none',
                background: !isHosteller ? '#374151' : 'transparent',
                color: !isHosteller ? '#FFF' : '#9CA3AF', fontWeight: 700, cursor: 'pointer'
              }}
            >
              🏠 Day Scholar
            </button>
          </div>
        </div>
      </div>

      {/* YEAR-WISE HOSTEL HISTORY SWITCHER */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#F59E0B' }}>ACADEMIC YEAR HISTORY:</span>
        {[1, 2, 3, 4].map(y => {
          const rec = hostelRecords.find(r => r.year === y);
          return (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: selectedYear === y ? 'linear-gradient(135deg, #EA580C, #F59E0B)' : 'rgba(255,255,255,0.05)',
                color: selectedYear === y ? '#FFF' : '#9CA3AF',
                fontWeight: selectedYear === y ? 800 : 500,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Year {y}</span>
              {rec && <span style={{ fontSize: '0.72rem', background: rec.is_hosteller ? '#B91C1C' : '#374151', padding: '2px 6px', borderRadius: 4, color: '#FFF' }}>{rec.is_hosteller ? 'Hostel' : 'Day'}</span>}
            </button>
          );
        })}
      </div>

      {/* HOSTEL DETAILS FORM FOR SELECTED YEAR */}
      <div className="glass-panel" style={{ padding: 20 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F59E0B', marginBottom: 16 }}>
          🏢 YEAR {selectedYear} HOSTEL ALLOCATION & ROOM DETAILS
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Academic Year</label>
            <input type="text" className="input-field" value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Hostel Required?</label>
            <select className="input-field" value={hostelRequired} onChange={e => setHostelRequired(e.target.value)} style={{ width: '100%' }}>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Hostel Name</label>
            <input type="text" className="input-field" value={hostelName} onChange={e => setHostelName(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Hostel Block</label>
            <select className="input-field" value={hostelBlock} onChange={e => setHostelBlock(e.target.value)} style={{ width: '100%' }}>
              <option value="A Block">A Block (Senior Boys)</option>
              <option value="B Block">B Block (Junior Boys)</option>
              <option value="C Block">C Block (Executive Hostel)</option>
              <option value="D Block">D Block (Ladies Hostel 1)</option>
              <option value="E Block">E Block (Ladies Hostel 2)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Floor</label>
            <input type="text" className="input-field" value={floor} onChange={e => setFloor(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Room Number</label>
            <input type="text" className="input-field" value={roomNumber} onChange={e => setRoomNumber(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Bed Number</label>
            <input type="text" className="input-field" value={bedNumber} onChange={e => setBedNumber(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Mess Preference</label>
            <select className="input-field" value={messType} onChange={e => setMessType(e.target.value)} style={{ width: '100%' }}>
              <option value="Non-Veg">Non-Veg Mess</option>
              <option value="Pure Veg">Pure Veg Mess</option>
              <option value="Special Veg">Special South Indian Veg</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Allocation Date</label>
            <input type="date" className="input-field" value={allocationDate} onChange={e => setAllocationDate(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Vacated Date (if applicable)</label>
            <input type="date" className="input-field" value={vacatedDate} onChange={e => setVacatedDate(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Hostel Status</label>
            <select className="input-field" value={hostelStatus} onChange={e => setHostelStatus(e.target.value)} style={{ width: '100%' }}>
              <option value="Active">Active Resident</option>
              <option value="Vacated">Vacated / Checked Out</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Receipt Number</label>
            <input type="text" className="input-field" value={receiptNumber} onChange={e => setReceiptNumber(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        {/* HOSTEL FEE BREAKDOWN */}
        <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFF', marginBottom: 12 }}>
            💰 YEAR {selectedYear} HOSTEL & MESS FEE RECORD
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Room Hostel Fee (₹)</label>
              <input type="number" className="input-field" value={hostelFee} onChange={e => setHostelFee(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Mess Charges (₹)</label>
              <input type="number" className="input-field" value={messFee} onChange={e => setMessFee(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#9CA3AF', marginBottom: 4 }}>Caution Deposit / Maintenance (₹)</label>
              <input type="number" className="input-field" value={otherHostelFee} onChange={e => setOtherHostelFee(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#F59E0B', marginBottom: 4, fontWeight: 700 }}>Hostel Scholarship / Waiver (₹)</label>
              <input type="number" className="input-field" value={scholarshipWaiver} onChange={e => setScholarshipWaiver(e.target.value)} style={{ width: '100%' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', color: '#10B981', marginBottom: 4, fontWeight: 700 }}>Paid Amount (₹)</label>
              <input type="number" className="input-field" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} style={{ width: '100%' }} />
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: '0.88rem', color: '#D1D5DB' }}>
            Total Hostel & Mess: <strong style={{ color: '#3B82F6' }}>₹{calculatedHostelTotal.toLocaleString()}</strong> •
            Pending Balance: <strong style={{ color: calculatedPending > 0 ? '#EF4444' : '#10B981' }}>₹{calculatedPending.toLocaleString()}</strong>
          </div>

          <button className="btn btn-primary" onClick={handleSaveHostelRecord}>
            + Add / Update Hostel Record for Year {selectedYear}
          </button>
        </div>
      </div>

    </div>
  );
}
