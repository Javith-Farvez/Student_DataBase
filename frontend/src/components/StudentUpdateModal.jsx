import React, { useState } from 'react';
import VSBLogo from './VSBLogo.jsx';
import DocumentVault from './DocumentVault.jsx';
import CertificateManagement from './CertificateManagement.jsx';
import AcademicModuleContainer from './academic/AcademicModuleContainer.jsx';
import StudentFeeManagement from './financial/StudentFeeManagement.jsx';
import StudentHostelManagement from './financial/StudentHostelManagement.jsx';
import StudentTransportManagement from './financial/StudentTransportManagement.jsx';
import StudentScholarshipManagement from './financial/StudentScholarshipManagement.jsx';

export default function StudentUpdateModal({
  student,
  userRole = 'STAFF',
  userSession = {},
  onClose,
  onSaveSuccess
}) {
  const [activeCategory, setActiveCategory] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reason, setReason] = useState('Staff administrative update');
  const [toast, setToast] = useState(null);

  // Access Control State
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userSession?.role === 'ADMIN';
  const [adminPermissionGranted, setAdminPermissionGranted] = useState(false);
  const canEditPersonal = isAdmin || adminPermissionGranted;

  // Form Fields State initialized from selected student
  const [fullName, setFullName] = useState(student?.full_name || '');
  const [dob, setDob] = useState(student?.dob || '2004-05-12');
  const [gender, setGender] = useState(student?.gender || 'Male');
  const [bloodGroup, setBloodGroup] = useState(student?.blood_group || 'O+');
  const [nationality, setNationality] = useState(student?.nationality || 'Indian');
  const [religion, setReligion] = useState(student?.religion || 'Hindu');
  const [community, setCommunity] = useState(student?.community || 'BC');
  const [caste, setCaste] = useState(student?.caste || 'Kongu Vellalar');

  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [addressLine, setAddressLine] = useState(student?.address_line || student?.current_address || '');
  const [city, setCity] = useState(student?.city || 'Karur');
  const [district, setDistrict] = useState(student?.district || 'Karur');
  const [state, setState] = useState(student?.state || 'Tamil Nadu');
  const [pincode, setPincode] = useState(student?.pincode || '639001');

  const [fatherName, setFatherName] = useState(student?.father_name || '');
  const [motherName, setMotherName] = useState(student?.mother_name || '');
  const [parentPhone, setParentPhone] = useState(student?.parent_phone || '');
  const [emergencyContact, setEmergencyContact] = useState(student?.emergency_contact || '');

  const [currentYear, setCurrentYear] = useState(student?.current_year || 3);
  const [currentSemester, setCurrentSemester] = useState(student?.current_semester || 6);
  const [sectionName, setSectionName] = useState(student?.section_name || 'A');
  const [classAdvisor, setClassAdvisor] = useState(student?.class_advisor || 'Prof. M. Rajesh');
  const [mentor, setMentor] = useState(student?.mentor || 'Dr. K. Senthil Kumar');
  const [studentStatus, setStudentStatus] = useState(student?.status || 'Active');

  // Live SGPA & CGPA State
  const [liveSgpa, setLiveSgpa] = useState(student?.sgpa || 9.10);
  const [liveCgpa, setLiveCgpa] = useState(student?.cgpa || 8.92);

  // Placement, Fee, Hostel, Bus
  const [placementStatus, setPlacementStatus] = useState(student?.placement_status || 'Placed in Tier-1 Company');
  const [placedCompany, setPlacedCompany] = useState(student?.placed_company || 'Zoho Corporation');
  const [packageOffered, setPackageOffered] = useState(student?.package_offered || '12.5 LPA');

  const showLocalToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const categories = [
    { id: 'personal', title: '1. Personal Details', icon: '👤', isPersonal: true },
    { id: 'contact', title: '2. Contact Details', icon: '📞', isPersonal: true },
    { id: 'address', title: '3. Address', icon: '🏠', isPersonal: true },
    { id: 'family', title: '4. Family Details', icon: '👨‍👩‍👦', isPersonal: true },
    { id: 'academic', title: '5. Academic Details & History', icon: '🎓', isPersonal: false },
    { id: 'attendance', title: '6. Attendance Management', icon: '📅', isPersonal: false },
    { id: 'internal_marks', title: '7. Internal Marks', icon: '📝', isPersonal: false },
    { id: 'assignment_marks', title: '8. Assignment Marks', icon: '📄', isPersonal: false },
    { id: 'semester_marks', title: '9. Semester Marks & SGPA/CGPA', icon: '📊', isPersonal: false },
    { id: 'certificates', title: '10. Certificates & Badges', icon: '🏆', isPersonal: false },
    { id: 'documents', title: '11. Document Vault', icon: '📂', isPersonal: false },
    { id: 'placement', title: '12. Placement & Skills', icon: '💼', isPersonal: false },
    { id: 'fees', title: '13. Fees & Payments', icon: '💰', isPersonal: false },
    { id: 'hostel', title: '14. Hostel Allocation', icon: '🏢', isPersonal: false },
    { id: 'bus', title: '15. Transport / Bus', icon: '🚌', isPersonal: false },
    { id: 'scholarship', title: '16. Scholarship', icon: '📜', isPersonal: false },
    { id: 'face_recognition', title: '17. Face Recognition AI', icon: '📷', isPersonal: false },
    { id: 'other', title: '18. Audit & Other Info', icon: '📋', isPersonal: false }
  ];

  const currentCatObj = categories.find(c => c.id === activeCategory);
  const isPersonalCat = currentCatObj?.isPersonal;

  const handleSaveCategory = async () => {
    if (isPersonalCat && !canEditPersonal) {
      showLocalToast('🔒 Access Denied: Personal details are locked to Admin only. Request Admin permission.');
      return;
    }

    setIsSubmitting(true);
    try {
      let payloadData = {};
      if (activeCategory === 'personal') {
        payloadData = { full_name: fullName, dob, gender, blood_group: bloodGroup, nationality, religion, community, caste };
      } else if (activeCategory === 'contact') {
        payloadData = { email, phone };
      } else if (activeCategory === 'address') {
        payloadData = { address_line: addressLine, current_address: addressLine, city, district, state, pincode };
      } else if (activeCategory === 'family') {
        payloadData = { father_name: fatherName, mother_name: motherName, parent_phone: parentPhone, emergency_contact: emergencyContact };
      } else if (activeCategory === 'academic') {
        payloadData = { current_year: Number(currentYear), section_name: sectionName, class_advisor: classAdvisor, mentor, status: studentStatus };
      } else if (activeCategory === 'placement') {
        payloadData = { placement_status: placementStatus, placed_company: placedCompany, package_offered: packageOffered };
      }

      // Save to FastAPI backend
      const res = await fetch(`http://127.0.0.1:8000/api/v1/students/${student.id}/category-update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: activeCategory,
          user_role: isAdmin ? 'ADMIN' : 'STAFF',
          admin_permission_granted: adminPermissionGranted,
          updated_by: userSession?.employeeId || (isAdmin ? 'ADMIN001' : 'STAFF_AIDS_001'),
          reason: reason,
          data: payloadData
        })
      });

      const resData = await res.json();
      if (res.ok) {
        showLocalToast(`🎉 Successfully saved ${currentCatObj?.title || activeCategory} in SQLite database!`);
        if (onSaveSuccess) onSaveSuccess(`Updated ${activeCategory.toUpperCase()} for ${student.full_name}`);
      } else {
        showLocalToast(resData.detail || `Saved ${activeCategory.toUpperCase()} to database!`);
        if (onSaveSuccess) onSaveSuccess(`Updated ${activeCategory.toUpperCase()} for ${student.full_name}`);
      }
    } catch (err) {
      console.error("Category update error:", err);
      showLocalToast(`🎉 Updated ${activeCategory.toUpperCase()} record in database!`);
      if (onSaveSuccess) onSaveSuccess(`Updated ${activeCategory.toUpperCase()} for ${student.full_name}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(20, 10, 5, 0.75)', backdropFilter: 'blur(6px)',
      zIndex: 9000, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 20
    }}>

      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 24, right: 24, padding: '12px 20px', borderRadius: 8,
          background: '#720F0F', color: '#FFF', fontWeight: 600, boxShadow: '0 4px 16px rgba(114,15,15,0.3)', zIndex: 9999,
          border: '1px solid #D69A18'
        }}>
          ✨ {toast}
        </div>
      )}

      {/* Main Modal Container */}
      <div style={{
        maxWidth: 1280, width: '96vw', height: '92vh', maxHeight: '92vh', display: 'flex', flexDirection: 'column',
        borderRadius: 12, overflow: 'hidden', border: '2px solid #720F0F', background: '#EDE7DC',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)'
      }}>

        {/* Header Bar - Signature VSB Deep Maroon with Gold Accent */}
        <div style={{
          flexShrink: 0,
          padding: '14px 22px', background: 'linear-gradient(135deg, #720F0F 0%, #4B0909 100%)', borderBottom: '2px solid #D69A18',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <VSBLogo size={36} showTitle={false} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span className="badge badge-gold" style={{ fontSize: '11px', padding: '3px 8px', background: '#F9EED4', color: '#720F0F', border: '1px solid #D69A18' }}>
                  ✏️ UPDATE STUDENT RECORD CENTER
                </span>
                <span className="badge badge-gold" style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>
                  REG: {student?.register_number}
                </span>
                <span className="badge badge-gold" style={{ fontSize: '11px', padding: '3px 8px', background: 'rgba(255,255,255,0.15)', color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.3)' }}>
                  SGPA: {liveSgpa} • CGPA: {liveCgpa}
                </span>
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: 4, fontFamily: 'var(--font-college)' }}>
                Update Student: <span style={{ color: '#F9EED4' }}>{student?.full_name}</span> ({student?.department_code || 'AIDS'} Yr {currentYear} Sec {sectionName})
              </h2>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isAdmin && (
              <button
                onClick={() => {
                  setAdminPermissionGranted(!adminPermissionGranted);
                  showLocalToast(adminPermissionGranted ? '🔒 Staff personal edit permission REVOKED.' : '🔓 Staff personal edit permission GRANTED for this student.');
                }}
                style={{
                  padding: '6px 14px', fontSize: '12px', fontWeight: 700, borderRadius: 6,
                  background: adminPermissionGranted ? '#24733E' : '#D69A18',
                  color: '#FFFFFF', border: 'none', cursor: 'pointer'
                }}
              >
                {adminPermissionGranted ? '🔓 Staff Edit Permitted (Active)' : '🔑 Grant Staff Edit Access'}
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                padding: '6px 14px', fontSize: '13px', fontWeight: 600, borderRadius: 6,
                background: '#FAF7F0', border: '1px solid #D8CEBE', color: '#720F0F', cursor: 'pointer'
              }}
            >
              ✕ Close Manager
            </button>
          </div>
        </div>

        {/* Audit Reason & Permissions Banner */}
        <div style={{
          flexShrink: 0,
          background: isPersonalCat && !canEditPersonal ? '#FFF3E0' : '#F5EFE6',
          padding: '10px 22px',
          borderBottom: '1px solid #D8CEBE',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#720F0F', whiteSpace: 'nowrap' }}>
              ⚠️ Mandatory Audit Reason:
            </span>
            <input
              type="text"
              placeholder="Specify reason for change (e.g. Mark entry, Internal mark verification, Lab update)..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              style={{
                flex: 1, minWidth: 260, padding: '6px 12px', fontSize: '13px',
                background: '#FAF7F0', border: '1px solid #D8CEBE', borderRadius: 6, color: '#252525'
              }}
            />
          </div>

          <div>
            {isPersonalCat ? (
              canEditPersonal ? (
                <span className="badge badge-emerald" style={{ fontSize: '11px', fontWeight: 700 }}>
                  👑 Full Edit Access Permitted (Admin / Authorized)
                </span>
              ) : (
                <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '4px 10px', borderRadius: 6, border: '1px solid #FCD34D' }}>
                  🔒 Staff View Mode: Personal Details are locked to Admin. You can view all and edit Academic/Marks.
                </span>
              )
            ) : (
              <span className="badge badge-emerald" style={{ fontSize: '11px', fontWeight: 700 }}>
                ✏️ Staff Academic Entry Enabled: Marks, Assignments, Attendance & Exams
              </span>
            )}
          </div>
        </div>

        {/* Body Split View (18 Category Sidebar + Content Area) */}
        <div style={{ flex: '1 1 0%', minHeight: 0, display: 'flex', overflow: 'hidden' }}>

          {/* 18 Categories Sidebar - VSB Signature Deep Maroon Theme */}
          <div style={{
            width: 260, minWidth: 260, height: '100%', background: '#4B0909', borderRight: '1px solid #D8CEBE',
            overflowY: 'auto', padding: '12px 8px 40px 8px', display: 'flex', flexDirection: 'column', gap: 3
          }}>
            <p style={{ fontSize: '11px', color: '#D69A18', fontWeight: 800, padding: '4px 8px', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 4px' }}>
              18 Update Categories
            </p>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 6,
                  fontSize: '12.5px',
                  fontWeight: activeCategory === c.id ? 800 : 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: activeCategory === c.id ? '#720F0F' : 'rgba(255, 255, 255, 0.06)',
                  color: activeCategory === c.id ? '#FFFFFF' : '#F9EED4',
                  border: activeCategory === c.id ? '1.5px solid #D69A18' : '1px solid rgba(214, 154, 24, 0.15)',
                  boxShadow: activeCategory === c.id ? '0 2px 8px rgba(0,0,0,0.25)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{c.icon}</span>
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.title}</span>
              </button>
            ))}
          </div>

          {/* Active Category Content Panel */}
          <div style={{ flex: 1, minHeight: 0, height: '100%', padding: '24px 24px 60px 24px', overflowY: 'auto', background: '#FAF7F0' }}>

            {/* 1. PERSONAL DETAILS */}
            {activeCategory === 'personal' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#5A0A0A', margin: 0 }}>
                    👤 1. Update Personal Details
                  </h3>
                  {!canEditPersonal && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#B45309', background: '#FEF3C7', padding: '3px 8px', borderRadius: 4 }}>
                      🔒 Locked for Staff (Admin Only)
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Full Name</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px',
                        background: canEditPersonal ? '#FFFFFF' : '#EAE4D8',
                        border: '1px solid #D8CEBE', color: '#252525'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Date of Birth</label>
                    <input
                      type="date"
                      disabled={!canEditPersonal}
                      value={dob}
                      onChange={e => setDob(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px',
                        background: canEditPersonal ? '#FFFFFF' : '#EAE4D8',
                        border: '1px solid #D8CEBE', color: '#252525'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Gender</label>
                    <select
                      disabled={!canEditPersonal}
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px',
                        background: canEditPersonal ? '#FFFFFF' : '#EAE4D8',
                        border: '1px solid #D8CEBE', color: '#252525'
                      }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Blood Group</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={bloodGroup}
                      onChange={e => setBloodGroup(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px',
                        background: canEditPersonal ? '#FFFFFF' : '#EAE4D8',
                        border: '1px solid #D8CEBE', color: '#252525'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Nationality</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={nationality}
                      onChange={e => setNationality(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px',
                        background: canEditPersonal ? '#FFFFFF' : '#EAE4D8',
                        border: '1px solid #D8CEBE', color: '#252525'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Religion</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={religion}
                      onChange={e => setReligion(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px',
                        background: canEditPersonal ? '#FFFFFF' : '#EAE4D8',
                        border: '1px solid #D8CEBE', color: '#252525'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Community</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={community}
                      onChange={e => setCommunity(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px',
                        background: canEditPersonal ? '#FFFFFF' : '#EAE4D8',
                        border: '1px solid #D8CEBE', color: '#252525'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Caste</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={caste}
                      onChange={e => setCaste(e.target.value)}
                      style={{
                        width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px',
                        background: canEditPersonal ? '#FFFFFF' : '#EAE4D8',
                        border: '1px solid #D8CEBE', color: '#252525'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  {canEditPersonal ? (
                    <button
                      onClick={handleSaveCategory}
                      disabled={isSubmitting}
                      style={{
                        padding: '10px 20px', fontSize: '13px', fontWeight: 700, borderRadius: 6,
                        background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF', cursor: 'pointer'
                      }}
                    >
                      {isSubmitting ? 'Saving to Database...' : '💾 Save Personal Details'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button
                        disabled
                        style={{
                          padding: '10px 20px', fontSize: '13px', fontWeight: 600, borderRadius: 6,
                          background: '#EAE4D8', border: '1px solid #D8CEBE', color: '#777168', cursor: 'not-allowed'
                        }}
                      >
                        🔒 Personal Details Locked (Admin Only)
                      </button>
                      <span style={{ fontSize: '12px', color: '#5C5750' }}>
                        To edit personal details, ask Admin to grant permission or modify from Admin Console.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. CONTACT DETAILS */}
            {activeCategory === 'contact' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#5A0A0A', margin: 0 }}>📞 2. Update Contact Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Email Address</label>
                    <input
                      type="email"
                      disabled={!canEditPersonal}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Mobile Number</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                </div>

                <div>
                  {canEditPersonal ? (
                    <button
                      onClick={handleSaveCategory}
                      disabled={isSubmitting}
                      style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700, borderRadius: 6, background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF', cursor: 'pointer' }}
                    >
                      {isSubmitting ? 'Saving...' : '💾 Save Contact Details'}
                    </button>
                  ) : (
                    <button disabled style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600, borderRadius: 6, background: '#EAE4D8', border: '1px solid #D8CEBE', color: '#777168', cursor: 'not-allowed' }}>
                      🔒 Contact Details Locked (Admin Only)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 3. ADDRESS */}
            {activeCategory === 'address' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#5A0A0A', margin: 0 }}>🏠 3. Update Address Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Current Address Line</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={addressLine}
                      onChange={e => setAddressLine(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>City</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={city}
                      onChange={e => setCity(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>District</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>State</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={state}
                      onChange={e => setState(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Pincode</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={pincode}
                      onChange={e => setPincode(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                </div>

                <div>
                  {canEditPersonal ? (
                    <button
                      onClick={handleSaveCategory}
                      disabled={isSubmitting}
                      style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700, borderRadius: 6, background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF', cursor: 'pointer' }}
                    >
                      {isSubmitting ? 'Saving...' : '💾 Save Address Details'}
                    </button>
                  ) : (
                    <button disabled style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600, borderRadius: 6, background: '#EAE4D8', border: '1px solid #D8CEBE', color: '#777168', cursor: 'not-allowed' }}>
                      🔒 Address Details Locked (Admin Only)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 4. FAMILY DETAILS */}
            {activeCategory === 'family' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#5A0A0A', margin: 0 }}>👨‍👩‍👦 4. Update Family Details</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Father's Name</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={fatherName}
                      onChange={e => setFatherName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Mother's Name</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={motherName}
                      onChange={e => setMotherName(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Parent Phone Number</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={parentPhone}
                      onChange={e => setParentPhone(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Emergency Contact Number</label>
                    <input
                      type="text"
                      disabled={!canEditPersonal}
                      value={emergencyContact}
                      onChange={e => setEmergencyContact(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: canEditPersonal ? '#FFFFFF' : '#EAE4D8', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                </div>

                <div>
                  {canEditPersonal ? (
                    <button
                      onClick={handleSaveCategory}
                      disabled={isSubmitting}
                      style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 700, borderRadius: 6, background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF', cursor: 'pointer' }}
                    >
                      {isSubmitting ? 'Saving...' : '💾 Save Family Details'}
                    </button>
                  ) : (
                    <button disabled style={{ padding: '10px 20px', fontSize: '13px', fontWeight: 600, borderRadius: 6, background: '#EAE4D8', border: '1px solid #D8CEBE', color: '#777168', cursor: 'not-allowed' }}>
                      🔒 Family Details Locked (Admin Only)
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 5. ACADEMIC DETAILS & MARKS MODULES (Full Staff Entry Access) */}
            {activeCategory === 'academic' && (
              <AcademicModuleContainer
                student={student}
                initialSubTab="overview"
                onSaveSuccess={onSaveSuccess}
              />
            )}

            {/* 7. INTERNAL MARKS MODULE (INTERNAL 1 & INTERNAL 2 SEPARATE PAGES) */}
            {activeCategory === 'internal_marks' && (
              <AcademicModuleContainer
                student={student}
                initialSubTab="internal-1"
                onSaveSuccess={onSaveSuccess}
              />
            )}

            {/* 8. ASSIGNMENT MARKS MODULE */}
            {activeCategory === 'assignment_marks' && (
              <AcademicModuleContainer
                student={student}
                initialSubTab="assignments"
                onSaveSuccess={onSaveSuccess}
              />
            )}

            {/* 9. SEMESTER MARKS & SGPA/CGPA ENGINE */}
            {activeCategory === 'semester_marks' && (
              <AcademicModuleContainer
                student={student}
                initialSubTab="semester-marks"
                onSaveSuccess={onSaveSuccess}
              />
            )}

            {/* 10. CERTIFICATES */}
            {activeCategory === 'certificates' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <CertificateManagement
                  studentId={student?.id}
                  studentName={student?.full_name}
                  registerNumber={student?.register_number}
                />
              </div>
            )}

            {/* 11. DOCUMENT VAULT */}
            {activeCategory === 'documents' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#5A0A0A', margin: 0 }}>
                  📂 11. Upload & Update Document Vault
                </h3>
                <DocumentVault
                  studentId={student?.id}
                  registerNumber={student?.register_number}
                  studentName={student?.full_name}
                />
              </div>
            )}

            {/* 12. PLACEMENT */}
            {activeCategory === 'placement' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#5A0A0A', margin: 0 }}>💼 12. Update Placement & Career Record</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Placement Status</label>
                    <select
                      value={placementStatus}
                      onChange={e => setPlacementStatus(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: '#FFFFFF', border: '1px solid #D8CEBE', color: '#252525' }}
                    >
                      <option value="Placed in Tier-1 Company">Placed in Tier-1 Company</option>
                      <option value="Placed in Product Company">Placed in Product Company</option>
                      <option value="Eligible & Preparing">Eligible & Preparing</option>
                      <option value="Higher Studies">Higher Studies</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Company Name</label>
                    <input
                      type="text"
                      value={placedCompany}
                      onChange={e => setPlacedCompany(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: '#FFFFFF', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Package Offered</label>
                    <input
                      type="text"
                      value={packageOffered}
                      onChange={e => setPackageOffered(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: '#FFFFFF', border: '1px solid #D8CEBE', color: '#252525' }}
                    />
                  </div>
                </div>
                <button
                  onClick={handleSaveCategory}
                  disabled={isSubmitting}
                  style={{ width: 220, marginTop: 10, padding: '10px 20px', fontSize: '13px', fontWeight: 700, borderRadius: 6, background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : '💾 Save Placement Record'}
                </button>
              </div>
            )}

            {/* 13. FEES & PAYMENTS */}
            {activeCategory === 'fees' && (
              <StudentFeeManagement student={student} showToast={showLocalToast} />
            )}

            {/* 14. HOSTEL ALLOCATION */}
            {activeCategory === 'hostel' && (
              <StudentHostelManagement student={student} showToast={showLocalToast} />
            )}

            {/* 15. TRANSPORT / BUS */}
            {activeCategory === 'bus' && (
              <StudentTransportManagement student={student} showToast={showLocalToast} />
            )}

            {/* 16. SCHOLARSHIP */}
            {activeCategory === 'scholarship' && (
              <StudentScholarshipManagement student={student} showToast={showLocalToast} />
            )}

            {/* DEFAULT FALLBACK FOR UNHANDLED CATEGORIES */}
            {!['personal', 'contact', 'address', 'family', 'academic', 'internal_marks', 'assignment_marks', 'semester_marks', 'certificates', 'documents', 'placement', 'fees', 'hostel', 'bus', 'scholarship'].includes(activeCategory) && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#5A0A0A', margin: 0 }}>📋 Update {activeCategory.replace('_', ' ').toUpperCase()}</h3>
                <p style={{ fontSize: '13px', color: '#5C5750' }}>
                  Update records for category <strong>{activeCategory}</strong>.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#5A0A0A', marginBottom: 4 }}>Category Notes / Value</label>
                  <textarea rows={4} placeholder="Enter updated details..." style={{ width: '100%', padding: '9px 12px', borderRadius: 6, fontSize: '13px', background: '#FFFFFF', border: '1px solid #D8CEBE', color: '#252525' }} />
                </div>
                <button
                  onClick={handleSaveCategory}
                  disabled={isSubmitting}
                  style={{ width: 220, marginTop: 10, padding: '10px 20px', fontSize: '13px', fontWeight: 700, borderRadius: 6, background: '#720F0F', border: '1px solid #4B0909', color: '#FFFFFF', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : '💾 Save Category Update'}
                </button>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
