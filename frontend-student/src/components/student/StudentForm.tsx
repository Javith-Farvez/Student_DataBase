import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  User, Users, MapPin, Landmark, BookOpen,
  Bus, AlertCircle, CheckCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'

import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import PhotoUpload from './PhotoUpload'
import { createStudent, updateStudent } from '@/api/studentApi'
import type { Student, StudentFormData } from '@/types/student'
import { DEPARTMENTS, BLOOD_GROUP_LABELS } from '@/types/student'

// ── Zod Schema ─────────────────────────────────────────────────────────────────
const schema = z.object({
  registerNumber:   z.string().min(1, 'Required').max(30),
  universityRegNo:  z.string().max(30).optional().or(z.literal('')),
  admissionNumber:  z.string().min(1, 'Required').max(30),
  rollNumber:       z.string().min(1, 'Required').max(30),
  fullName:         z.string().min(2, 'Required').max(100),
  gender:           z.enum(['MALE', 'FEMALE', 'OTHER'], { required_error: 'Required' }),
  dateOfBirth:      z.string().min(1, 'Required'),
  bloodGroup:       z.string().optional(),
  aadhaarNumber:    z.string().regex(/^\d{12}$|^$/, 'Must be 12 digits').optional(),
  mobileNumber:     z.string().regex(/^[6-9]\d{9}$/, 'Enter valid 10-digit mobile'),
  email:            z.string().email('Enter valid email').max(100),

  fatherName:       z.string().max(100).optional(),
  fatherOccupation: z.string().max(100).optional(),
  fatherMobile:     z.string().regex(/^[6-9]\d{9}$|^$/, 'Enter valid mobile').optional(),
  motherName:       z.string().max(100).optional(),
  motherOccupation: z.string().max(100).optional(),
  motherMobile:     z.string().regex(/^[6-9]\d{9}$|^$/, 'Enter valid mobile').optional(),
  guardianName:     z.string().max(100).optional(),
  guardianMobile:   z.string().regex(/^[6-9]\d{9}$|^$/, 'Enter valid mobile').optional(),

  currentAddress:   z.string().optional(),
  permanentAddress: z.string().optional(),
  district:         z.string().max(60).optional(),
  state:            z.string().max(60).optional(),
  pincode:          z.string().regex(/^\d{6}$|^$/, 'Must be 6 digits').optional(),

  religion:         z.string().max(50).optional(),
  community:        z.string().optional(),
  caste:            z.string().max(60).optional(),
  subCaste:         z.string().max(60).optional(),
  nationality:      z.string().max(50).optional(),
  nativeDistrict:   z.string().max(60).optional(),
  firstGraduate:    z.boolean().optional(),

  departmentName:   z.string().min(1, 'Required'),
  degree:           z.string().max(50).optional(),
  batch:            z.string().regex(/^\d{4}-\d{4}$/, 'Format: YYYY-YYYY'),
  admissionYear:    z.coerce.number().min(2000).max(2100),
  regulation:       z.string().max(20).optional(),
  currentYear:      z.coerce.number().min(1).max(5),
  currentSemester:  z.coerce.number().min(1).max(10),
  sectionName:      z.string().min(1, 'Required').max(10),
  mentorName:       z.string().max(100).optional(),
  classAdvisor:     z.string().max(100).optional(),
  studentStatus:    z.string().optional(),

  residenceType:           z.enum(['DAY_SCHOLAR', 'HOSTELLER']).optional(),
  busRoute:                z.string().max(100).optional(),
  boardingPoint:           z.string().max(100).optional(),
  hostelBlock:             z.string().max(50).optional(),
  roomNumber:              z.string().max(20).optional(),

  emergencyContactName:     z.string().max(100).optional(),
  emergencyContactRelation: z.string().max(50).optional(),
  emergencyContactMobile:   z.string().regex(/^[6-9]\d{9}$|^$/, 'Enter valid mobile').optional(),
})

type FormValues = z.infer<typeof schema>

// ── Tab Config ────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'personal',   label: 'Personal',   icon: User },
  { id: 'parent',     label: 'Parent',     icon: Users },
  { id: 'address',    label: 'Address',    icon: MapPin },
  { id: 'community',  label: 'Community',  icon: Landmark },
  { id: 'academic',   label: 'Academic',   icon: BookOpen },
  { id: 'transport',  label: 'Transport',  icon: Bus },
  { id: 'emergency',  label: 'Emergency',  icon: AlertCircle },
] as const
type TabId = (typeof TABS)[number]['id']

// ── Option Arrays ──────────────────────────────────────────────────────────────
const BLOOD_GROUP_OPTIONS = Object.entries(BLOOD_GROUP_LABELS).map(([v, l]) => ({ value: v, label: l }))
const COMMUNITY_OPTIONS = ['OC', 'BC', 'BCM', 'MBC', 'SC', 'ST', 'SCA', 'OBC'].map(c => ({ value: c, label: c }))
const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ALUMNI', label: 'Alumni' },
  { value: 'DROPOUT', label: 'Dropout' },
  { value: 'TRANSFERRED', label: 'Transferred' },
]
const DEGREE_OPTIONS = ['B.E.', 'B.Tech', 'M.E.', 'M.Tech', 'MBA', 'MCA'].map(d => ({ value: d, label: d }))
const YEAR_OPTIONS  = [1,2,3,4,5].map(y => ({ value: String(y), label: `Year ${y}` }))
const SEM_OPTIONS   = [1,2,3,4,5,6,7,8,9,10].map(s => ({ value: String(s), label: `Semester ${s}` }))
const SECTION_OPTIONS = ['A','B','C','D','E','F'].map(s => ({ value: s, label: `Section ${s}` }))
const DEPT_OPTIONS  = DEPARTMENTS.map(d => ({ value: d, label: d }))

// ── Default values ─────────────────────────────────────────────────────────────
const DEFAULTS: Partial<FormValues> = {
  nationality: 'Indian',
  degree: 'B.E.',
  studentStatus: 'ACTIVE',
  residenceType: 'DAY_SCHOLAR',
  firstGraduate: false,
}

// ── Main Component ─────────────────────────────────────────────────────────────
interface Props {
  student?: Student
  onSuccess: (s: Student) => void
  onCancel: () => void
}

export default function StudentForm({ student, onSuccess, onCancel }: Props) {
  const isEdit = !!student
  const [activeTab, setActiveTab] = useState<TabId>('personal')
  const [photo, setPhoto] = useState<string | null>(student?.photoUrl ?? null)
  const [saving, setSaving] = useState(false)

  const {
    register, handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: isEdit ? {
      ...student,
      bloodGroup: student.bloodGroup ?? '',
      community: student.community ?? '',
      studentStatus: student.studentStatus ?? 'ACTIVE',
      residenceType: student.residenceType ?? 'DAY_SCHOLAR',
    } : DEFAULTS,
  })

  const residenceType = watch('residenceType')

  const onSubmit = async (data: FormValues) => {
    setSaving(true)
    try {
      const payload = { ...data, photoUrl: photo ?? undefined } as Partial<StudentFormData>
      let result
      if (isEdit && student) {
        result = await updateStudent(student.id, payload)
      } else {
        result = await createStudent(payload)
      }
      if (result.success) {
        toast.success(isEdit ? 'Student updated successfully!' : 'Student created successfully!')
        onSuccess(result.data)
      } else {
        toast.error(result.message || 'Operation failed')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Something went wrong'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  const err = (field: keyof FormValues) => errors[field]?.message

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* Tab Bar */}
      <div className="flex overflow-x-auto border-b border-gray-100 px-6 bg-white sticky top-0 z-10">
        {TABS.map(({ id, label, icon: Icon }) => {
          const hasError = getTabErrors(id, errors)
          return (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              id={`tab-${id}`}
              className={`tab-button ${activeTab === id ? 'active' : ''}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {hasError && (
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              )}
            </button>
          )
        })}
      </div>

      <div className="p-6 space-y-6">
        {/* ── PERSONAL ── */}
        {activeTab === 'personal' && (
          <div className="space-y-6 animate-fade-in">
            {/* Photo */}
            <div className="form-section">
              <div className="form-section-title">
                <User className="w-4 h-4 text-vsb-500" />
                Passport Photo
              </div>
              <div className="max-w-xs mx-auto">
                <PhotoUpload currentPhoto={photo ?? undefined} onChange={setPhoto} />
              </div>
            </div>

            {/* Identity Fields */}
            <div className="form-section">
              <div className="form-section-title">
                <User className="w-4 h-4 text-vsb-500" />
                Identity Information
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Input label="Register Number" required error={err('registerNumber')}
                       {...register('registerNumber')} placeholder="e.g. 922524104001" />
                <Input label="University Reg. No." error={err('universityRegNo')}
                       {...register('universityRegNo')} />
                <Input label="Admission Number" required error={err('admissionNumber')}
                       {...register('admissionNumber')} placeholder="e.g. ADM2024001" />
                <Input label="Roll Number" required error={err('rollNumber')}
                       {...register('rollNumber')} placeholder="e.g. 24CS001" />
                <Input label="Full Name" required error={err('fullName')}
                       {...register('fullName')} placeholder="Student's full name" />
                <Select label="Gender" required error={err('gender')}
                        {...register('gender')} placeholder="Select gender"
                        options={[
                          { value: 'MALE', label: 'Male' },
                          { value: 'FEMALE', label: 'Female' },
                          { value: 'OTHER', label: 'Other' },
                        ]} />
                <Input label="Date of Birth" type="date" required error={err('dateOfBirth')}
                       {...register('dateOfBirth')} />
                <Select label="Blood Group" error={err('bloodGroup')}
                        {...register('bloodGroup')} placeholder="Select"
                        options={BLOOD_GROUP_OPTIONS} />
                <Input label="Aadhaar Number" error={err('aadhaarNumber')}
                       {...register('aadhaarNumber')} placeholder="12-digit Aadhaar" maxLength={12} />
                <Input label="Mobile Number" required error={err('mobileNumber')}
                       {...register('mobileNumber')} placeholder="10-digit mobile" />
                <Input label="Email Address" required type="email" error={err('email')}
                       {...register('email')} placeholder="student@vsb.ac.in" className="sm:col-span-2 lg:col-span-1" />
              </div>
            </div>
          </div>
        )}

        {/* ── PARENT ── */}
        {activeTab === 'parent' && (
          <div className="space-y-4 animate-fade-in">
            <div className="form-section">
              <div className="form-section-title"><Users className="w-4 h-4 text-vsb-500" />Father's Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Father Name" error={err('fatherName')} {...register('fatherName')} />
                <Input label="Father Occupation" error={err('fatherOccupation')} {...register('fatherOccupation')} />
                <Input label="Father Mobile" error={err('fatherMobile')} {...register('fatherMobile')} placeholder="10-digit mobile" />
              </div>
            </div>
            <div className="form-section">
              <div className="form-section-title"><Users className="w-4 h-4 text-vsb-500" />Mother's Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="Mother Name" error={err('motherName')} {...register('motherName')} />
                <Input label="Mother Occupation" error={err('motherOccupation')} {...register('motherOccupation')} />
                <Input label="Mother Mobile" error={err('motherMobile')} {...register('motherMobile')} placeholder="10-digit mobile" />
              </div>
            </div>
            <div className="form-section">
              <div className="form-section-title"><Users className="w-4 h-4 text-vsb-500" />Guardian's Details</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Guardian Name" error={err('guardianName')} {...register('guardianName')} />
                <Input label="Guardian Mobile" error={err('guardianMobile')} {...register('guardianMobile')} />
              </div>
            </div>
          </div>
        )}

        {/* ── ADDRESS ── */}
        {activeTab === 'address' && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><MapPin className="w-4 h-4 text-vsb-500" />Address Details</div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="field-label">Current Address</label>
                <textarea rows={3} className="field-input resize-none"
                  placeholder="Door No., Street, Area..." {...register('currentAddress')} />
              </div>
              <div>
                <label className="field-label">Permanent Address</label>
                <textarea rows={3} className="field-input resize-none"
                  placeholder="Door No., Street, Area..." {...register('permanentAddress')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="District" error={err('district')} {...register('district')} placeholder="e.g. Karur" />
                <Input label="State" error={err('state')} {...register('state')} placeholder="Tamil Nadu" />
                <Input label="Pincode" error={err('pincode')} {...register('pincode')} placeholder="6 digits" maxLength={6} />
              </div>
            </div>
          </div>
        )}

        {/* ── COMMUNITY ── */}
        {activeTab === 'community' && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><Landmark className="w-4 h-4 text-vsb-500" />Community Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Input label="Religion" error={err('religion')} {...register('religion')} placeholder="e.g. Hindu" />
              <Select label="Community" error={err('community')} {...register('community')}
                      placeholder="Select" options={COMMUNITY_OPTIONS} />
              <Input label="Caste" error={err('caste')} {...register('caste')} />
              <Input label="Sub Caste" error={err('subCaste')} {...register('subCaste')} />
              <Input label="Nationality" error={err('nationality')} {...register('nationality')} />
              <Input label="Native District" error={err('nativeDistrict')} {...register('nativeDistrict')} />
              <div className="sm:col-span-2 lg:col-span-3 flex items-center gap-3 pt-1">
                <input type="checkbox" id="firstGraduate" {...register('firstGraduate')}
                       className="w-4 h-4 rounded border-gray-300 text-vsb-600 focus:ring-vsb-500" />
                <label htmlFor="firstGraduate" className="text-sm font-medium text-gray-700 cursor-pointer">
                  First Graduate in Family
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ── ACADEMIC ── */}
        {activeTab === 'academic' && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><BookOpen className="w-4 h-4 text-vsb-500" />Academic Details</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select label="Department" required error={err('departmentName')}
                      {...register('departmentName')} placeholder="Select department" options={DEPT_OPTIONS} />
              <Select label="Degree" error={err('degree')} {...register('degree')}
                      placeholder="Select" options={DEGREE_OPTIONS} />
              <Input label="Batch" required error={err('batch')} {...register('batch')} placeholder="2021-2025" />
              <Input label="Admission Year" required type="number" error={err('admissionYear')}
                     {...register('admissionYear')} placeholder="e.g. 2021" />
              <Input label="Regulation" error={err('regulation')} {...register('regulation')} placeholder="e.g. 2021" />
              <Select label="Current Year" required error={err('currentYear')}
                      {...register('currentYear')} placeholder="Select year" options={YEAR_OPTIONS} />
              <Select label="Current Semester" required error={err('currentSemester')}
                      {...register('currentSemester')} placeholder="Select sem" options={SEM_OPTIONS} />
              <Select label="Section" required error={err('sectionName')}
                      {...register('sectionName')} placeholder="Select section" options={SECTION_OPTIONS} />
              <Input label="Mentor Name" error={err('mentorName')} {...register('mentorName')} />
              <Input label="Class Advisor" error={err('classAdvisor')} {...register('classAdvisor')} />
              <Select label="Student Status" error={err('studentStatus')}
                      {...register('studentStatus')} placeholder="Select status" options={STATUS_OPTIONS} />
            </div>
          </div>
        )}

        {/* ── TRANSPORT ── */}
        {activeTab === 'transport' && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><Bus className="w-4 h-4 text-vsb-500" />Transport & Accommodation</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Select label="Residence Type" error={err('residenceType')}
                      {...register('residenceType')} placeholder="Select"
                      options={[{ value: 'DAY_SCHOLAR', label: 'Day Scholar' }, { value: 'HOSTELLER', label: 'Hosteller' }]} />
              {residenceType === 'DAY_SCHOLAR' ? (
                <>
                  <Input label="Bus Route" error={err('busRoute')} {...register('busRoute')} placeholder="e.g. Route 4 - Karur" />
                  <Input label="Boarding Point" error={err('boardingPoint')} {...register('boardingPoint')} />
                </>
              ) : (
                <>
                  <Input label="Hostel Block" error={err('hostelBlock')} {...register('hostelBlock')} placeholder="e.g. Block A" />
                  <Input label="Room Number" error={err('roomNumber')} {...register('roomNumber')} placeholder="e.g. 204" />
                </>
              )}
            </div>
          </div>
        )}

        {/* ── EMERGENCY ── */}
        {activeTab === 'emergency' && (
          <div className="form-section animate-fade-in">
            <div className="form-section-title"><AlertCircle className="w-4 h-4 text-vsb-500" />Emergency Contact</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="Contact Name" error={err('emergencyContactName')} {...register('emergencyContactName')} />
              <Input label="Relationship" error={err('emergencyContactRelation')} {...register('emergencyContactRelation')}
                     placeholder="e.g. Father, Mother" />
              <Input label="Mobile Number" error={err('emergencyContactMobile')} {...register('emergencyContactMobile')}
                     placeholder="10-digit mobile" />
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex justify-between items-center z-10">
        <div className="flex gap-2">
          {TABS.map(({ id, label, icon: Icon }) => {
            const hasErr = getTabErrors(id, errors)
            return hasErr ? (
              <span key={id} className="flex items-center gap-1 text-xs text-red-500">
                <Icon className="w-3 h-3" /> {label}
              </span>
            ) : null
          })}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            type="submit"
            loading={saving}
            id="student-form-submit"
            icon={<CheckCircle className="w-4 h-4" />}
          >
            {isEdit ? 'Update Student' : 'Create Student'}
          </Button>
        </div>
      </div>
    </form>
  )
}

// ── Helper: which tabs have errors ────────────────────────────────────────────
function getTabErrors(tabId: string, errors: Record<string, unknown>): boolean {
  const MAP: Record<string, string[]> = {
    personal:  ['registerNumber','admissionNumber','rollNumber','fullName','gender','dateOfBirth','mobileNumber','email','aadhaarNumber','bloodGroup'],
    parent:    ['fatherName','fatherOccupation','fatherMobile','motherName','motherOccupation','motherMobile','guardianName','guardianMobile'],
    address:   ['currentAddress','permanentAddress','district','state','pincode'],
    community: ['religion','community','caste','subCaste','nationality','nativeDistrict'],
    academic:  ['departmentName','degree','batch','admissionYear','regulation','currentYear','currentSemester','sectionName','mentorName','classAdvisor','studentStatus'],
    transport: ['residenceType','busRoute','boardingPoint','hostelBlock','roomNumber'],
    emergency: ['emergencyContactName','emergencyContactRelation','emergencyContactMobile'],
  }
  return (MAP[tabId] ?? []).some((f) => f in errors)
}
