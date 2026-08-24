import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

import StudentForm from '@/components/student/StudentForm'
import Button from '@/components/ui/Button'
import { getStudentById } from '@/api/studentApi'
import type { Student } from '@/types/student'

export default function StudentFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id
  const [student, setStudent] = useState<Student | undefined>(undefined)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!id) return
    void getStudentById(Number(id)).then((res) => {
      if (res.success) setStudent(res.data)
      else toast.error('Student not found')
      setLoading(false)
    })
  }, [id])

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="skeleton h-8 w-48 rounded" />
      <div className="skeleton h-[600px] rounded-2xl" />
    </div>
  )

  return (
    <div className="max-w-5xl space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {isEdit ? `Edit: ${student?.fullName ?? 'Student'}` : 'Add New Student'}
          </h2>
          <p className="text-sm text-gray-400">Fill in all required fields across each section</p>
        </div>
      </div>

      {/* Progress hint */}
      <div className="flex items-center gap-2 px-4 py-3 bg-vsb-50 rounded-xl border border-vsb-100 text-sm text-vsb-700">
        <CheckCircle className="w-4 h-4 shrink-0" />
        Navigate through tabs to fill all 7 sections. Required fields are marked with *.
      </div>

      {/* Form Card */}
      <div className="card overflow-hidden">
        <StudentForm
          student={student}
          onSuccess={(s) => {
            navigate(`/students/${s.id}`)
          }}
          onCancel={() => navigate('/students')}
        />
      </div>
    </div>
  )
}
