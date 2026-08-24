import React, { useState, useEffect } from 'react';

export default function StudentTransportManagement({ student, showToast }) {
  const [loading, setLoading] = useState(false);
  const [transportRecords, setTransportRecords] = useState([]);
  const [selectedYear, setSelectedYear] = useState(student?.current_year || 3);

  // Form State
  const [academicYear, setAcademicYear] = useState('2024-2025');
  const [transportRequired, setTransportRequired] = useState('Yes');
  const [busNumber, setBusNumber] = useState('BUS-03');
  const [routeNumber, setRouteNumber] = useState('R-05');
  const [routeName, setRouteName] = useState('Karur Central & Bus Stand Route');
  const [boardingPoint, setBoardingPoint] = useState('Karur Bus Stand Stop A');
  const [pickupPoint, setPickupPoint] = useState('07:35 AM Pickup');
  const [dropPoint, setDropPoint] = useState('VSB Main Gate (08:15 AM)');
  const [driverName, setDriverName] = useState('Murugan K');
  const [driverContact, setDriverContact] = useState('9876543210');
  const [transportStatus, setTransportStatus] = useState('Active');

  // Transport Fee State
  const [transportFee, setTransportFee] = useState(18000);
  const [concessionAmount, setConcessionAmount] = useState(0);
  const [paidAmount, setPaidAmount] = useState(18000);
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [receiptNumber, setReceiptNumber] = useState('BUS-REC-2024-041');
  const [remarks, setRemarks] = useState('Bus pass issued for 3rd year');

  const studentId = student?.id || student?.register_number;

  const fetchTransportSummary = async () => {
    if (!studentId) return;
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/summary`);
      if (res.ok) {
        const data = await res.json();
        setTransportRecords(data.transport_records || []);
      }
    } catch (e) {
      console.error("Error loading transport records:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransportSummary();
  }, [studentId]);

  useEffect(() => {
    if (transportRecords.length > 0) {
      const rec = transportRecords.find(r => r.year === selectedYear);
      if (rec) {
        setAcademicYear(rec.academic_year || '2024-2025');
        setTransportRequired(rec.transport_required || 'Yes');
        setBusNumber(rec.bus_number || 'BUS-03');
        setRouteNumber(rec.route_number || 'R-05');
        setRouteName(rec.route_name || 'Karur Central & Bus Stand Route');
        setBoardingPoint(rec.boarding_point || 'Karur Bus Stand Stop A');
        setPickupPoint(rec.pickup_point || '07:35 AM Pickup');
        setDropPoint(rec.drop_point || 'VSB Main Gate (08:15 AM)');
        setDriverName(rec.driver_name || 'Murugan K');
        setDriverContact(rec.driver_contact || '9876543210');
        setTransportStatus(rec.transport_status || 'Active');
        setTransportFee(rec.transport_fee || 18000);
        setPaidAmount(rec.paid_amount || 18000);
        setPaymentStatus(rec.payment_status || 'Paid');
      }
    }
  }, [selectedYear, transportRecords]);

  const handleSaveTransportRecord = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v1/financial/students/${studentId}/transport-record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: selectedYear,
          academic_year: academicYear,
          transport_required: transportRequired,
          bus_number: busNumber,
          route_number: routeNumber,
          route_name: routeName,
          boarding_point: boardingPoint,
          pickup_point: pickupPoint,
          drop_point: dropPoint,
          driver_name: driverName,
          driver_contact: driverContact,
          transport_status: transportStatus,
          transport_fee: Number(transportFee),
          concession_amount: Number(concessionAmount),
          paid_amount: Number(paidAmount),
          payment_status: paymentStatus,
          receipt_number: receiptNumber,
          remarks: remarks,
          updated_by: 'STAFF_TRANSPORT'
        })
      });
      if (res.ok) {
        if (showToast) showToast(`🚌 Year ${selectedYear} Transport record updated: Bus ${busNumber} (${routeName})!`);
        fetchTransportSummary();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const pendingBusFee = Math.max(0, Number(transportFee) - Number(concessionAmount) - Number(paidAmount));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      
      {/* HEADER BANNER */}
      <div style={{ padding: 20, borderRadius: 12, borderLeft: '4px solid #D69A18', background: 'linear-gradient(135deg, #720F0F 0%, #4B0909 100%)', color: '#FFFFFF', border: '1.5px solid #D69A18', boxShadow: '0 4px 14px rgba(114,15,15,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontSize: '0.8rem', color: '#F9EED4', fontWeight: 700, textTransform: 'uppercase' }}>
              VSB SMARTCAMPUS — STRUCTURED TRANSPORT & BUS ALLOCATION HISTORY
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginTop: 4, fontFamily: 'var(--font-college)' }}>
              🚌 Transport & Bus Route: {student?.full_name}
            </h2>
            <div style={{ fontSize: '0.85rem', color: '#F9EED4', marginTop: 4 }}>
              Reg No: <strong style={{ color: '#FFFFFF' }}>{student?.register_number}</strong> • Dept: <strong style={{ color: '#FFFFFF' }}>{student?.department_name || 'AIDS'}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.1)', padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFFFFF' }}>Transport Required:</span>
            <button
              onClick={() => setTransportRequired('Yes')}
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid #D69A18',
                background: transportRequired === 'Yes' ? '#D69A18' : 'transparent',
                color: transportRequired === 'Yes' ? '#4B0909' : '#FFFFFF', fontWeight: 700, cursor: 'pointer'
              }}
            >
              🚌 YES
            </button>
            <button
              onClick={() => setTransportRequired('No')}
              style={{
                padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
                background: transportRequired === 'No' ? 'rgba(0,0,0,0.3)' : 'transparent',
                color: '#FFFFFF', fontWeight: 700, cursor: 'pointer'
              }}
            >
              🚫 NO
            </button>
          </div>
        </div>
      </div>

      {/* YEAR-WISE TRANSPORT HISTORY SWITCHER */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#720F0F' }}>ACADEMIC YEAR TRANSPORT HISTORY:</span>
        {[1, 2, 3, 4].map(y => {
          const rec = transportRecords.find(r => r.year === y);
          return (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: selectedYear === y ? '1.5px solid #D69A18' : '1px solid #D8CEBE',
                background: selectedYear === y ? '#720F0F' : '#FAF7F0',
                color: selectedYear === y ? '#FFFFFF' : '#5C5750',
                fontWeight: selectedYear === y ? 800 : 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}
            >
              <span>Year {y}</span>
              {rec && <span style={{ fontSize: '0.72rem', background: rec.transport_required === 'Yes' ? '#24733E' : '#777168', padding: '2px 6px', borderRadius: 4, color: '#FFF' }}>{rec.transport_required === 'Yes' ? rec.bus_number : 'No Bus'}</span>}
            </button>
          );
        })}
      </div>

      {/* TRANSPORT FORM FOR SELECTED YEAR */}
      <div className="vsb-card" style={{ padding: 20, background: '#FAF7F0' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#720F0F', marginBottom: 16 }}>
          🚌 YEAR {selectedYear} TRANSPORT ALLOCATION & BUS ROUTE DETAILS
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Academic Year</label>
            <input type="text" className="input-field" value={academicYear} onChange={e => setAcademicYear(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Bus Number</label>
            <select className="input-field" value={busNumber} onChange={e => setBusNumber(e.target.value)} style={{ width: '100%' }}>
              <option value="BUS-01">BUS-01 (Karur Central)</option>
              <option value="BUS-02">BUS-02 (Trichy Highway)</option>
              <option value="BUS-03">BUS-03 (Vellakovil & Kangeyam)</option>
              <option value="BUS-04">BUS-04 (Erode Highway)</option>
              <option value="BUS-05">BUS-05 (Dindigul Route)</option>
              <option value="BUS-06">BUS-06 (Namakkal Route)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Route Number</label>
            <input type="text" className="input-field" value={routeNumber} onChange={e => setRouteNumber(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Route Name</label>
            <input type="text" className="input-field" value={routeName} onChange={e => setRouteName(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Boarding Point</label>
            <input type="text" className="input-field" value={boardingPoint} onChange={e => setBoardingPoint(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Pickup Time / Point</label>
            <input type="text" className="input-field" value={pickupPoint} onChange={e => setPickupPoint(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Drop Point</label>
            <input type="text" className="input-field" value={dropPoint} onChange={e => setDropPoint(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Transport Status</label>
            <select className="input-field" value={transportStatus} onChange={e => setTransportStatus(e.target.value)} style={{ width: '100%' }}>
              <option value="Active">Active Bus Pass Holder</option>
              <option value="Inactive">Inactive / Cancelled</option>
              <option value="Changed Route">Route Changed</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Driver Name</label>
            <input type="text" className="input-field" value={driverName} onChange={e => setDriverName(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Driver Contact Mobile</label>
            <input type="text" className="input-field" value={driverContact} onChange={e => setDriverContact(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#5C5750', marginBottom: 4 }}>Transport Fee (₹)</label>
            <input type="number" className="input-field" value={transportFee} onChange={e => setTransportFee(e.target.value)} style={{ width: '100%' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: '#24733E', marginBottom: 4, fontWeight: 700 }}>Paid Amount (₹)</label>
            <input type="number" className="input-field" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>

        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontSize: '0.88rem', color: '#2B2926' }}>
            Transport Fee: <strong style={{ color: '#720F0F' }}>₹{Number(transportFee).toLocaleString()}</strong> •
            Paid: <strong style={{ color: '#24733E' }}>₹{Number(paidAmount).toLocaleString()}</strong> •
            Pending Balance: <strong style={{ color: pendingBusFee > 0 ? '#A52A24' : '#24733E' }}>₹{pendingBusFee.toLocaleString()}</strong>
          </div>

          <button
            onClick={handleSaveTransportRecord}
            style={{
              padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700, borderRadius: 8,
              background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF',
              boxShadow: '0 2px 8px rgba(114, 15, 15, 0.25)', cursor: 'pointer'
            }}
          >
            + Add / Update Transport Record for Year {selectedYear}
          </button>
        </div>
      </div>

    </div>
  );
}
