import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { CheckCircle, Calculator } from 'lucide-react'
import toast from 'react-hot-toast'

import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import {
  createSslc, updateSslc,
  createHsc, updateHsc,
} from '@/api/academicApi'
import type { SslcDetail, HscDetail } from '@/types/academic'
import { BOARD_OPTIONS, HSC_GROUP_OPTIONS } from '@/types/academic'

const BOARD_OPTS = BOARD_OPTIONS.map(b => ({ value: b, label: b }))
const GROUP_OPTS = HSC_GROUP_OPTIONS.map(g => ({ value: g, label: g }))
const RESULT_OPTS = [{ value: 'PASS', label: 'Pass' }, { value: 'FAIL', label: 'Fail' }]
const GRADE_OPTS = ['A+','A','B+','B','C','D'].map(g => ({ value: g, label: g }))

// ── Zod Schemas ───────────────────────────────────────────────────────────────
const sslcSchema = z.object({
  studentId:           z.coerce.number().min(1, 'Student ID required'),
  schoolName:          z.string().max(200).optional(),
  board:               z.string().optional(),
  passingYear:         z.coerce.number().min(1990).max(2100).optional().or(z.literal('')),
  examRegisterNumber:  z.string().max(40).optional(),
  totalMarks:          z.coerce.number().min(0).max(600).optional().or(z.literal('')),
  maxMarks:            z.coerce.number().min(0).max(600).optional().or(z.literal('')),
  percentage:          z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  grade:               z.string().optional(),
  result:              z.string().optional(),
  tamilMarks:          z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  englishMarks:        z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  mathematicsMarks:    z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  scienceMarks:        z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  socialScienceMarks:  z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  language3Subject:    z.string().max(60).optional(),
  language3Marks:      z.coerce.number().min(0).max(200).optional().or(z.literal('')),
})

const hscSchema = z.object({
  studentId:           z.coerce.number().min(1, 'Student ID required'),
  schoolName:          z.string().max(200).optional(),
  board:               z.string().optional(),
  passingYear:         z.coerce.number().min(1990).max(2100).optional().or(z.literal('')),
  examRegisterNumber:  z.string().max(40).optional(),
  groupName:           z.string().optional(),
  totalMarks:          z.coerce.number().min(0).max(1200).optional().or(z.literal('')),
  maxMarks:            z.coerce.number().min(0).max(1200).optional().or(z.literal('')),
  percentage:          z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  cutoff:              z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  grade:               z.string().optional(),
  result:              z.string().optional(),
  language1Subject:    z.string().max(60).optional(),
  language1Marks:      z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  language2Subject:    z.string().max(60).optional(),
  language2Marks:      z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  physicsMarks:        z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  chemistryMarks:      z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  mathematicsMarks:    z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  biologyMarks:        z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  computerScienceMarks:z.coerce.number().min(0).max(200).optional().or(z.literal('')),
  optionalSubject:     z.string().max(60).optional(),
  optionalMarks:       z.coerce.number().min(0).max(200).optional().or(z.literal('')),
})

type SslcForm = z.infer<typeof sslcSchema>
type HscForm  = z.infer<typeof hscSchema>

interface Props {
  type: 'sslc' | 'hsc'
  record: SslcDetail | HscDetail | null
  onSuccess: () => void
  onCancel: () => void
}

// ── Helper: compute cutoff ────────────────────────────────────────────────────
function calcCutoff(phy?: unknown, che?: unknown, mat?: unknown, bio?: unknown, cs?: unknown): number | null {
  const p = phy != null && phy !== '' ? Number(phy) : null
  const c = che != null && che !== '' ? Number(che) : null
  const m = mat != null && mat !== '' ? Number(mat) : (bio != null && bio !== '' ? Number(bio) : (cs != null && cs !== '' ? Number(cs) : null))
  if (p == null || c == null || m == null || isNaN(p) || isNaN(c) || isNaN(m)) return null
  return Math.round((p / 2 + c / 4 + m / 4) * 100) / 100
}

// ──────────────────────────────────────────────────────────────────────────────
export default function SslcHscForm({ type, record, onSuccess, onCancel }: Props) {
  const isEdit = !!record
  const [saving, setSaving] = useState(false)
  const [autoCutoff, setAutoCutoff] = useState<number | null>(null)

  // ── SSLC Form ─────────────────────────────────────────────────────────────
  const sslcForm = useForm<SslcForm>({
    resolver: zodResolver(sslcSchema),
    defaultValues: type === 'sslc' && record
      ? { ...record as SslcDetail }
      : { result: 'PASS' },
  })

  // ── HSC Form ──────────────────────────────────────────────────────────────
  const hscForm = useForm<HscForm>({
    resolver: zodResolver(hscSchema),
    defaultValues: type === 'hsc' && record
      ? { ...record as HscDetail }
      : { language1Subject: 'Tamil', language2Subject: 'English', result: 'PASS' },
  })

  const sErr = (f: keyof SslcForm) => sslcForm.formState.errors[f]?.message
  const hErr = (f: keyof HscForm)  => hscForm.formState.errors[f]?.message

  // ── Submit SSLC ───────────────────────────────────────────────────────────
  const onSslcSubmit = async (data: SslcForm) => {
    setSaving(true)
    try {
      const payload = { ...data, studentId: Number(data.studentId) }
      const res = isEdit ? await updateSslc((record as SslcDetail).id, payload as never)
                         : await createSslc(payload as never)
      if (res.success) { toast.success(isEdit ? 'SSLC updated!' : 'SSLC created!'); onSuccess() }
      else toast.error(res.message ?? 'Failed')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'
      toast.error(msg)
    } finally { setSaving(false) }
  }

  // ── Submit HSC ────────────────────────────────────────────────────────────
  const onHscSubmit = async (data: HscForm) => {
    setSaving(true)
    try {
      const payload = { ...data, studentId: Number(data.studentId) }
      const res = isEdit ? await updateHsc((record as HscDetail).id, payload as never)
                         : await createHsc(payload as never)
      if (res.success) { toast.success(isEdit ? 'HSC updated!' : 'HSC created!'); onSuccess() }
      else toast.error(res.message ?? 'Failed')
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'
      toast.error(msg)
    } finally { setSaving(false) }
  }

  // ─────────────────────────────────────────────────────────────────────────
  if (type === 'sslc') {
    return (
      <form onSubmit={sslcForm.handleSubmit(onSslcSubmit)} noValidate className="p-6 space-y-6">
        {/* Student ID */}
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <Input label="Student ID *" type="number" error={sErr('studentId')}
            {...sslcForm.register('studentId')} placeholder="Enter Student ID from Student Master" />
        </div>

        {/* School Info */}
        <div>
          <h3 className="form-section-title"><span className="w-4 h-4 text-vsb-500">🏫</span> School Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
            <Input label="School Name" error={sErr('schoolName')} {...sslcForm.register('schoolName')} placeholder="e.g. Govt. Hr. Sec. School, Karur" className="sm:col-span-2" />
            <Select label="Board" options={BOARD_OPTS} error={sErr('board')}
              placeholder="Select Board" {...sslcForm.register('board')} />
            <Input label="Passing Year" type="number" error={sErr('passingYear')}
              {...sslcForm.register('passingYear')} placeholder="e.g. 2019" />
            <Input label="Exam Register Number" error={sErr('examRegisterNumber')}
              {...sslcForm.register('examRegisterNumber')} placeholder="Board hall-ticket number" />
          </div>
        </div>

        {/* Subject Marks */}
        <div>
          <h3 className="form-section-title"><span>📊</span> Subject-Wise Marks <span className="text-xs font-normal text-gray-400 ml-1">(each out of 100)</span></h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
            <Input label="Tamil" type="number" error={sErr('tamilMarks')} {...sslcForm.register('tamilMarks')} placeholder="0–100" />
            <Input label="English" type="number" error={sErr('englishMarks')} {...sslcForm.register('englishMarks')} placeholder="0–100" />
            <Input label="Mathematics" type="number" error={sErr('mathematicsMarks')} {...sslcForm.register('mathematicsMarks')} placeholder="0–100" />
            <Input label="Science" type="number" error={sErr('scienceMarks')} {...sslcForm.register('scienceMarks')} placeholder="0–100" />
            <Input label="Social Science" type="number" error={sErr('socialScienceMarks')} {...sslcForm.register('socialScienceMarks')} placeholder="0–100" />
            <Input label="3rd Language" error={sErr('language3Subject')} {...sslcForm.register('language3Subject')} placeholder="Subject name" />
            <Input label="3rd Language Marks" type="number" error={sErr('language3Marks')} {...sslcForm.register('language3Marks')} placeholder="0–100" />
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="form-section-title"><span>🎓</span> Marks Summary</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
            <Input label="Total Marks" type="number" error={sErr('totalMarks')} {...sslcForm.register('totalMarks')} placeholder="Auto-computed" />
            <Input label="Max Marks" type="number" error={sErr('maxMarks')} {...sslcForm.register('maxMarks')} placeholder="600" />
            <Input label="Percentage %" type="number" error={sErr('percentage')} {...sslcForm.register('percentage')} placeholder="Auto-computed" />
            <Select label="Grade" options={GRADE_OPTS} error={sErr('grade')} placeholder="Auto" {...sslcForm.register('grade')} />
            <Select label="Result" options={RESULT_OPTS} error={sErr('result')} placeholder="Select" {...sslcForm.register('result')} />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" type="submit" loading={saving}
            icon={<CheckCircle className="w-4 h-4" />} id="sslc-submit">
            {isEdit ? 'Update SSLC' : 'Save SSLC Record'}
          </Button>
        </div>
      </form>
    )
  }

  // ── HSC Form ──────────────────────────────────────────────────────────────
  const watchPhy = hscForm.watch('physicsMarks')
  const watchChe = hscForm.watch('chemistryMarks')
  const watchMat = hscForm.watch('mathematicsMarks')
  const watchBio = hscForm.watch('biologyMarks')
  const watchCs  = hscForm.watch('computerScienceMarks')
  const computedCutoff = calcCutoff(watchPhy, watchChe, watchMat, watchBio, watchCs)

  return (
    <form onSubmit={hscForm.handleSubmit(onHscSubmit)} noValidate className="p-6 space-y-6">
      {/* Student ID */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <Input label="Student ID *" type="number" error={hErr('studentId')}
          {...hscForm.register('studentId')} placeholder="Enter Student ID from Student Master" />
      </div>

      {/* School Info */}
      <div>
        <h3 className="form-section-title"><span>🏫</span> School Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <Input label="School Name" error={hErr('schoolName')} {...hscForm.register('schoolName')}
            placeholder="e.g. Govt. Hr. Sec. School, Karur" className="sm:col-span-2" />
          <Select label="Board" options={BOARD_OPTS} placeholder="Select Board"
            error={hErr('board')} {...hscForm.register('board')} />
          <Input label="Passing Year" type="number" error={hErr('passingYear')}
            {...hscForm.register('passingYear')} placeholder="e.g. 2021" />
          <Input label="Exam Register Number" error={hErr('examRegisterNumber')}
            {...hscForm.register('examRegisterNumber')} />
          <Select label="Group / Stream" options={GROUP_OPTS} placeholder="Select Group"
            error={hErr('groupName')} {...hscForm.register('groupName')} />
        </div>
      </div>

      {/* Language Subjects */}
      <div>
        <h3 className="form-section-title"><span>📖</span> Language Subjects</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          <Input label="Language 1" error={hErr('language1Subject')} {...hscForm.register('language1Subject')} />
          <Input label="L1 Marks" type="number" error={hErr('language1Marks')} {...hscForm.register('language1Marks')} placeholder="0–200" />
          <Input label="Language 2" error={hErr('language2Subject')} {...hscForm.register('language2Subject')} />
          <Input label="L2 Marks" type="number" error={hErr('language2Marks')} {...hscForm.register('language2Marks')} placeholder="0–200" />
        </div>
      </div>

      {/* Core Science Subjects */}
      <div>
        <h3 className="form-section-title"><span>🔬</span> Science Subjects <span className="text-xs font-normal text-gray-400 ml-1">(each out of 200)</span></h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
          <Input label="Physics" type="number" error={hErr('physicsMarks')} {...hscForm.register('physicsMarks')} placeholder="0–200" />
          <Input label="Chemistry" type="number" error={hErr('chemistryMarks')} {...hscForm.register('chemistryMarks')} placeholder="0–200" />
          <Input label="Mathematics" type="number" error={hErr('mathematicsMarks')} {...hscForm.register('mathematicsMarks')} placeholder="0–200" />
          <Input label="Biology" type="number" error={hErr('biologyMarks')} {...hscForm.register('biologyMarks')} placeholder="0–200 (Bio group)" />
          <Input label="Computer Science" type="number" error={hErr('computerScienceMarks')} {...hscForm.register('computerScienceMarks')} placeholder="0–200 (CS group)" />
          <Input label="Optional Subject" error={hErr('optionalSubject')} {...hscForm.register('optionalSubject')} />
        </div>

        {/* Live Cutoff Preview */}
        {computedCutoff !== null && (
          <div className="mt-3 flex items-center gap-3 px-4 py-3 bg-indigo-50 border border-indigo-100 rounded-xl">
            <Calculator className="w-5 h-5 text-indigo-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-900">
                Auto-Computed TN Cutoff: <span className="text-xl text-indigo-700">{computedCutoff}</span> / 200
              </p>
              <p className="text-xs text-indigo-500">
                Formula: (Physics÷2) + (Chemistry÷4) + (Best of Maths/Bio/CS ÷4)
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div>
        <h3 className="form-section-title"><span>🎓</span> Marks Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-3">
          <Input label="Total Marks" type="number" error={hErr('totalMarks')} {...hscForm.register('totalMarks')} placeholder="Auto-computed" />
          <Input label="Max Marks" type="number" error={hErr('maxMarks')} {...hscForm.register('maxMarks')} placeholder="600" />
          <Input label="Percentage %" type="number" error={hErr('percentage')} {...hscForm.register('percentage')} placeholder="Auto-computed" />
          <Input label="Cutoff (override)" type="number" step="0.01" error={hErr('cutoff')}
            {...hscForm.register('cutoff')} placeholder={computedCutoff !== null ? String(computedCutoff) : 'Auto'} />
          <Select label="Grade" options={GRADE_OPTS} error={hErr('grade')} placeholder="Auto" {...hscForm.register('grade')} />
          <Select label="Result" options={RESULT_OPTS} error={hErr('result')} placeholder="Select" {...hscForm.register('result')} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
        <Button variant="secondary" type="button" onClick={onCancel}>Cancel</Button>
        <Button variant="primary" type="submit" loading={saving}
          icon={<CheckCircle className="w-4 h-4" />} id="hsc-submit">
          {isEdit ? 'Update HSC' : 'Save HSC Record'}
        </Button>
      </div>
    </form>
  )
}
