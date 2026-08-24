import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Pencil, Trash2, User, Users,
  MapPin, Landmark, BookOpen, Bus, AlertCircle,
  Phone, Mail, Calendar, Droplets,
} from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import { getStudentById, deleteStudent } from '@/api/studentApi'
import type { Student } from '@/types/student'
import { STATUS_COLORS, BLOOD_GROUP_LABELS } from '@/types/student'

// ── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ label, value }: { label: string; value?: string | number | boolean | null }) {
  if (value === undefined || value === null || value === '') return null
  const display = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900 truncate">{display}</p>
    </div>
  )
}

// ── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, children }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="card p-5">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 pb-3 border-b border-gray-100">
        <Icon className="w-4 h-4 text-vsb-500" />
        {title}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  )
}

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [student, setStudent] = useState<Student | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!id) return
    void getStudentById(Number(id)).then((res) => {
      if (res.success) setStudent(res.data)
      else toast.error('Student not found')
      setLoading(false)
    })
  }, [id])

  const handleDelete = async () => {
    if (!student) return
    setDeleting(true)
    try {
      await deleteStudent(student.id)
      toast.success('Student deleted')
      navigate('/students')
    } catch {
      toast.error('Delete failed')
      setDeleting(false)
    }
  }

  if (loading) return (
    <div className="space-y-5">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="skeleton h-48 rounded-2xl" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
      </div>
    </div>
  )

  if (!student) return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <p className="text-gray-500 font-medium">Student not found</p>
      <Button variant="secondary" onClick={() => navigate('/students')}>
        <ArrowLeft className="w-4 h-4" /> Back to list
      </Button>
    </div>
  )

  const bg = student.photoUrl ? student.photoUrl : null
  const initials = student.fullName.split(' ').slice(0, 2).map(n => n[0]).join('')

  return (
    <div className="space-y-5 max-w-6xl animate-fade-in">
      {/* Back + Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/students')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Students
        </button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(`/students/${student.id}/academic`)}
            id="view-academic-marks-btn"
          >
            10th & 12th Marks Profile
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<Pencil className="w-3.5 h-3.5" />}
            onClick={() => navigate(`/students/${student.id}/edit`)}
            id="edit-student-btn"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setDeleteOpen(true)}
            id="delete-student-btn"
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-24 bg-gradient-to-r from-vsb-700 via-vsb-600 to-indigo-500" />
        <div className="px-6 pb-6">
          <div className="flex flex-wrap items-end gap-5 -mt-12">
            {/* Avatar */}
            {bg ? (
              <img src={bg} alt={student.fullName}
                   className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg" />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-vsb-500 to-vsb-700
                              flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-2xl font-bold text-white">{initials}</span>
              </div>
            )}
            <div className="pb-1 flex-1">
              <h2 className="text-xl font-bold text-gray-900">{student.fullName}</h2>
              <p className="text-sm text-gray-500">
                {student.departmentName} · Year {student.currentYear}, Sem {student.currentSemester}, Sec {student.sectionName}
              </p>
            </div>
            <div className="pb-1 flex flex-wrap gap-2">
              <span className={`badge ${STATUS_COLORS[student.studentStatus]}`}>
                {student.studentStatus}
              </span>
              <span className="badge bg-vsb-50 text-vsb-700">
                {student.residenceType === 'DAY_SCHOLAR' ? '🚌 Day Scholar' : '🏠 Hosteller'}
              </span>
              {student.firstGraduate && (
                <span className="badge bg-amber-50 text-amber-700">⭐ First Graduate</span>
              )}
            </div>
          </div>

          {/* Quick Info */}
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Mobile</p>
                <p className="text-sm font-medium">{student.mobileNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Email</p>
                <p className="text-sm font-medium truncate">{student.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Date of Birth</p>
                <p className="text-sm font-medium">{student.dateOfBirth}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Blood Group</p>
                <p className="text-sm font-medium">
                  {student.bloodGroup ? BLOOD_GROUP_LABELS[student.bloodGroup] : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SectionCard title="Personal Details" icon={User}>
          <InfoRow label="Register No."    value={student.registerNumber} />
          <InfoRow label="Univ. Reg. No."  value={student.universityRegNo} />
          <InfoRow label="Admission No."   value={student.admissionNumber} />
          <InfoRow label="Roll No."        value={student.rollNumber} />
          <InfoRow label="Gender"          value={student.gender} />
          <InfoRow label="Aadhaar"         value={student.aadhaarNumber ? '●●●●●●●●' + student.aadhaarNumber.slice(-4) : undefined} />
        </SectionCard>

        <SectionCard title="Academic Details" icon={BookOpen}>
          <InfoRow label="Department"    value={student.departmentName} />
          <InfoRow label="Degree"        value={student.degree} />
          <InfoRow label="Batch"         value={student.batch} />
          <InfoRow label="Admission Year" value={student.admissionYear} />
          <InfoRow label="Regulation"    value={student.regulation} />
          <InfoRow label="Mentor"        value={student.mentorName} />
          <InfoRow label="Class Advisor" value={student.classAdvisor} />
        </SectionCard>

        <SectionCard title="Parent / Guardian Details" icon={Users}>
          <InfoRow label="Father Name"       value={student.fatherName} />
          <InfoRow label="Father Occupation" value={student.fatherOccupation} />
          <InfoRow label="Father Mobile"     value={student.fatherMobile} />
          <InfoRow label="Mother Name"       value={student.motherName} />
          <InfoRow label="Mother Occupation" value={student.motherOccupation} />
          <InfoRow label="Mother Mobile"     value={student.motherMobile} />
          <InfoRow label="Guardian"          value={student.guardianName} />
          <InfoRow label="Guardian Mobile"   value={student.guardianMobile} />
        </SectionCard>

        <SectionCard title="Address Details" icon={MapPin}>
          <div className="col-span-full">
            <InfoRow label="Current Address"   value={student.currentAddress} />
          </div>
          <div className="col-span-full">
            <InfoRow label="Permanent Address" value={student.permanentAddress} />
          </div>
          <InfoRow label="District" value={student.district} />
          <InfoRow label="State"    value={student.state} />
          <InfoRow label="Pincode"  value={student.pincode} />
        </SectionCard>

        <SectionCard title="Community Details" icon={Landmark}>
          <InfoRow label="Religion"       value={student.religion} />
          <InfoRow label="Community"      value={student.community} />
          <InfoRow label="Caste"          value={student.caste} />
          <InfoRow label="Sub Caste"      value={student.subCaste} />
          <InfoRow label="Nationality"    value={student.nationality} />
          <InfoRow label="Native District" value={student.nativeDistrict} />
          <InfoRow label="First Graduate"  value={student.firstGraduate} />
        </SectionCard>

        <SectionCard title="Transport & Accommodation" icon={Bus}>
          <InfoRow label="Residence Type" value={student.residenceType?.replace('_', ' ')} />
          <InfoRow label="Bus Route"      value={student.busRoute} />
          <InfoRow label="Boarding Point" value={student.boardingPoint} />
          <InfoRow label="Hostel Block"   value={student.hostelBlock} />
          <InfoRow label="Room Number"    value={student.roomNumber} />
        </SectionCard>

        <SectionCard title="Emergency Contact" icon={AlertCircle}>
          <InfoRow label="Name"         value={student.emergencyContactName} />
          <InfoRow label="Relationship" value={student.emergencyContactRelation} />
          <InfoRow label="Mobile"       value={student.emergencyContactMobile} />
        </SectionCard>
      </div>

      {/* Delete Modal */}
      <Modal open={deleteOpen} onClose={() => setDeleteOpen(false)}
             title="Delete Student" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">
            Delete <strong>{student.fullName}</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete} id="confirm-delete-detail-btn">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
