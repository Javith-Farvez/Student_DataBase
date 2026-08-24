import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, BookOpen, Award, School, Calculator, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import { getStudentAcademicProfile } from '@/api/academicApi'
import type { StudentAcademicProfile } from '@/types/academic'
import { GRADE_COLORS, RESULT_COLORS } from '@/types/academic'

function InfoBox({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
    </div>
  )
}

export default function StudentAcademicProfilePage() {
  const { studentId } = useParams<{ studentId: string }>()
  const navigate = useNavigate()
  const [profile, setProfile] = useState<StudentAcademicProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!studentId) return
    getStudentAcademicProfile(Number(studentId))
      .then(res => {
        if (res.success) setProfile(res.data)
        else toast.error(res.message || 'Academic profile not found')
      })
      .catch(() => toast.error('Failed to load student academic profile'))
      .finally(() => setLoading(false))
  }, [studentId])

  if (loading) {
    return (
      <div className="space-y-6 max-w-5xl animate-pulse">
        <div className="skeleton h-8 w-48 rounded" />
        <div className="skeleton h-32 rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="skeleton h-80 rounded-2xl" />
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-500 font-medium">Academic details record not found for this student</p>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" /> Go Back
        </Button>
      </div>
    )
  }

  const sslc = profile.sslc
  const hsc  = profile.hsc

  return (
    <div className="space-y-6 max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <Button variant="primary" size="sm" onClick={() => navigate(`/academic/sslc-hsc`)}>
          All Academic Records
        </Button>
      </div>

      {/* Hero Banner */}
      <div className="card p-6 bg-gradient-to-r from-vsb-900 via-navy-900 to-vsb-800 text-white rounded-2xl shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-vsb-300 uppercase tracking-widest">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> SSLC & HSC Academic Profile
            </div>
            <h2 className="text-2xl font-bold text-white mt-1">{profile.fullName}</h2>
            <p className="text-sm text-slate-300 mt-0.5">
              Reg No: <span className="font-mono text-white bg-white/10 px-2 py-0.5 rounded">{profile.registerNumber}</span> · {profile.departmentName} ({profile.batch})
            </p>
          </div>
          {hsc?.cutoff != null && (
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/10 text-center">
              <p className="text-xs text-slate-300 uppercase tracking-wider font-semibold">TN Cutoff Score</p>
              <p className="text-3xl font-extrabold text-amber-300 mt-0.5">{hsc.cutoff}</p>
              <p className="text-[10px] text-slate-400">out of 200.00</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── SSLC Details Card ── */}
        <div className="card p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <School className="w-5 h-5 text-vsb-600" /> 10th Standard (SSLC)
              </h3>
              {sslc?.result && (
                <span className={`badge ${RESULT_COLORS[sslc.result] ?? 'bg-gray-100'}`}>
                  {sslc.result}
                </span>
              )}
            </div>

            {sslc ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl">
                  <InfoBox label="School" value={sslc.schoolName} />
                  <InfoBox label="Board" value={sslc.board} />
                  <InfoBox label="Passing Year" value={sslc.passingYear} />
                  <InfoBox label="Exam Reg No" value={sslc.examRegisterNumber} />
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject Marks (Max 100)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <div className="p-2 rounded bg-vsb-50/50">
                      <span className="text-xs text-gray-500 block">Tamil</span>
                      <span className="font-semibold text-gray-900">{sslc.tamilMarks ?? '—'}</span>
                    </div>
                    <div className="p-2 rounded bg-vsb-50/50">
                      <span className="text-xs text-gray-500 block">English</span>
                      <span className="font-semibold text-gray-900">{sslc.englishMarks ?? '—'}</span>
                    </div>
                    <div className="p-2 rounded bg-vsb-50/50">
                      <span className="text-xs text-gray-500 block">Mathematics</span>
                      <span className="font-semibold text-gray-900">{sslc.mathematicsMarks ?? '—'}</span>
                    </div>
                    <div className="p-2 rounded bg-vsb-50/50">
                      <span className="text-xs text-gray-500 block">Science</span>
                      <span className="font-semibold text-gray-900">{sslc.scienceMarks ?? '—'}</span>
                    </div>
                    <div className="p-2 rounded bg-vsb-50/50">
                      <span className="text-xs text-gray-500 block">Social Science</span>
                      <span className="font-semibold text-gray-900">{sslc.socialScienceMarks ?? '—'}</span>
                    </div>
                    {sslc.language3Subject && (
                      <div className="p-2 rounded bg-vsb-50/50">
                        <span className="text-xs text-gray-500 block truncate">{sslc.language3Subject}</span>
                        <span className="font-semibold text-gray-900">{sslc.language3Marks ?? '—'}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-vsb-50 p-4 rounded-xl border border-vsb-100">
                  <div>
                    <span className="text-xs text-vsb-700 font-semibold block">Total Score</span>
                    <span className="text-lg font-bold text-vsb-900">{sslc.totalMarks ?? '—'} / {sslc.maxMarks ?? 600}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-vsb-700 font-semibold block">Percentage</span>
                    <span className="text-lg font-bold text-vsb-900">{sslc.percentage != null ? `${sslc.percentage}%` : '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-vsb-700 font-semibold block">Grade</span>
                    <span className={`badge ${GRADE_COLORS[sslc.grade ?? ''] ?? 'bg-white'}`}>{sslc.grade ?? '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                No 10th standard SSLC record linked for this student.
              </div>
            )}
          </div>
        </div>

        {/* ── HSC Details Card ── */}
        <div className="card p-6 space-y-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-900">
                <BookOpen className="w-5 h-5 text-indigo-600" /> 12th Standard (HSC)
              </h3>
              {hsc?.result && (
                <span className={`badge ${RESULT_COLORS[hsc.result] ?? 'bg-gray-100'}`}>
                  {hsc.result}
                </span>
              )}
            </div>

            {hsc ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl">
                  <InfoBox label="School" value={hsc.schoolName} />
                  <InfoBox label="Board" value={hsc.board} />
                  <InfoBox label="Stream / Group" value={hsc.groupName} />
                  <InfoBox label="Passing Year" value={hsc.passingYear} />
                </div>

                <div className="border-t border-gray-100 pt-3">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Subject Marks (Max 200)</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                    <div className="p-2 rounded bg-indigo-50/40">
                      <span className="text-xs text-gray-500 block">{hsc.language1Subject || 'Language 1'}</span>
                      <span className="font-semibold text-gray-900">{hsc.language1Marks ?? '—'}</span>
                    </div>
                    <div className="p-2 rounded bg-indigo-50/40">
                      <span className="text-xs text-gray-500 block">{hsc.language2Subject || 'Language 2'}</span>
                      <span className="font-semibold text-gray-900">{hsc.language2Marks ?? '—'}</span>
                    </div>
                    <div className="p-2 rounded bg-indigo-50/40">
                      <span className="text-xs text-gray-500 block">Physics</span>
                      <span className="font-semibold text-gray-900">{hsc.physicsMarks ?? '—'}</span>
                    </div>
                    <div className="p-2 rounded bg-indigo-50/40">
                      <span className="text-xs text-gray-500 block">Chemistry</span>
                      <span className="font-semibold text-gray-900">{hsc.chemistryMarks ?? '—'}</span>
                    </div>
                    {hsc.mathematicsMarks != null && (
                      <div className="p-2 rounded bg-indigo-50/40">
                        <span className="text-xs text-gray-500 block">Mathematics</span>
                        <span className="font-semibold text-gray-900">{hsc.mathematicsMarks}</span>
                      </div>
                    )}
                    {hsc.biologyMarks != null && (
                      <div className="p-2 rounded bg-indigo-50/40">
                        <span className="text-xs text-gray-500 block">Biology</span>
                        <span className="font-semibold text-gray-900">{hsc.biologyMarks}</span>
                      </div>
                    )}
                    {hsc.computerScienceMarks != null && (
                      <div className="p-2 rounded bg-indigo-50/40">
                        <span className="text-xs text-gray-500 block">Computer Sci</span>
                        <span className="font-semibold text-gray-900">{hsc.computerScienceMarks}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <div>
                    <span className="text-xs text-indigo-700 font-semibold block">Total Marks</span>
                    <span className="text-lg font-bold text-indigo-900">{hsc.totalMarks ?? '—'} / {hsc.maxMarks ?? 600}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-indigo-700 font-semibold block">Percentage</span>
                    <span className="text-lg font-bold text-indigo-900">{hsc.percentage != null ? `${hsc.percentage}%` : '—'}</span>
                  </div>
                  <div>
                    <span className="text-xs text-indigo-700 font-semibold block">Cutoff</span>
                    <span className="text-lg font-extrabold text-amber-600">{hsc.cutoff ?? '—'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                No 12th standard HSC record linked for this student.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
