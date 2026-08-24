import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, ArrowUpDown } from 'lucide-react'
import toast from 'react-hot-toast'

import FilterBar from '@/components/student/FilterBar'
import Pagination from '@/components/ui/Pagination'
import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import StudentForm from '@/components/student/StudentForm'
import { getStudents, deleteStudent } from '@/api/studentApi'
import type { StudentSummary, StudentFilters, Student } from '@/types/student'
import { STATUS_COLORS } from '@/types/student'

const DEFAULT_FILTERS: StudentFilters = {
  search: '', department: '', year: '', semester: '',
  section: '', community: '', batch: '', gender: '', status: '',
}

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-50">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded w-full" />
        </td>
      ))}
    </tr>
  )
}

// ── Avatar ────────────────────────────────────────────────────────────────────
function StudentAvatar({ student }: { student: StudentSummary }) {
  const initials = student.fullName.split(' ').slice(0, 2).map(n => n[0]).join('')
  if (student.photoUrl && student.photoUrl.startsWith('data:')) {
    return (
      <img src={student.photoUrl} alt={student.fullName}
           className="w-9 h-9 rounded-full object-cover ring-2 ring-white shadow-sm" />
    )
  }
  const colors = ['bg-vsb-100 text-vsb-700', 'bg-emerald-100 text-emerald-700',
                  'bg-amber-100 text-amber-700', 'bg-purple-100 text-purple-700']
  const color = colors[student.id % colors.length]
  return (
    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${color}`}>
      {initials}
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentListPage() {
  const navigate = useNavigate()
  const [students, setStudents] = useState<StudentSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<StudentFilters>(DEFAULT_FILTERS)
  const [page, setPage]     = useState(0)
  const [size, setSize]     = useState(10)
  const [sortBy, setSortBy] = useState('registerNumber')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [totalPages, setTotalPages]     = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [createOpen, setCreateOpen]   = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<StudentSummary | null>(null)
  const [deleting, setDeleting]        = useState(false)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudents({ ...filters, page, size, sortBy, sortDir })
      if (res.success) {
        setStudents(res.data.content)
        setTotalPages(res.data.totalPages)
        setTotalElements(res.data.totalElements)
      }
    } catch {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [filters, page, size, sortBy, sortDir])

  useEffect(() => { void fetchStudents() }, [fetchStudents])

  const handleSort = (col: string) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortBy(col); setSortDir('asc') }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteStudent(deleteTarget.id)
      toast.success('Student deleted')
      setDeleteTarget(null)
      void fetchStudents()
    } catch {
      toast.error('Delete failed')
    } finally {
      setDeleting(false)
    }
  }

  const SortHeader = ({ label, col }: { label: string; col: string }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer
                 hover:bg-gray-100 select-none transition-colors"
      onClick={() => handleSort(col)}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${sortBy === col ? 'text-vsb-600' : 'text-gray-300'}`} />
      </span>
    </th>
  )

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Student Master</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage all student profiles — VSB Engineering College
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setCreateOpen(true)}
          id="create-student-btn"
        >
          Add Student
        </Button>
      </div>

      {/* Filter Bar */}
      <FilterBar
        filters={filters}
        totalElements={totalElements}
        onChange={(f) => { setFilters(prev => ({ ...prev, ...f })); setPage(0) }}
        onReset={() => { setFilters(DEFAULT_FILTERS); setPage(0) }}
      />

      {/* Data Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <SortHeader label="Reg. No."        col="registerNumber" />
                <SortHeader label="Name"            col="fullName" />
                <SortHeader label="Department"      col="departmentName" />
                <SortHeader label="Year / Sem"      col="currentYear" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Section
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(size)].map((_, i) => <SkeletonRow key={i} />)
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                        <Eye className="w-7 h-7 text-gray-300" />
                      </div>
                      <p className="font-medium text-gray-500">No students found</p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : students.map((s) => (
                <tr key={s.id} className="border-b border-gray-50 hover:bg-vsb-50/30 transition-colors">
                  {/* Reg No */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-medium text-vsb-700 bg-vsb-50 px-2 py-0.5 rounded">
                      {s.registerNumber}
                    </span>
                  </td>

                  {/* Name + photo */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <StudentAvatar student={s} />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{s.fullName}</p>
                        <p className="text-xs text-gray-400">{s.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Dept */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700 max-w-[160px] truncate" title={s.departmentName}>
                      {s.departmentName}
                    </p>
                    <p className="text-xs text-gray-400">{s.batch}</p>
                  </td>

                  {/* Year / Sem */}
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">Year {s.currentYear}</p>
                    <p className="text-xs text-gray-400">Sem {s.currentSemester}</p>
                  </td>

                  {/* Section */}
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-700">{s.sectionName}</span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3">
                    <span className={`badge ${STATUS_COLORS[s.studentStatus]}`}>
                      {s.studentStatus}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => navigate(`/students/${s.id}`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-vsb-600 hover:bg-vsb-50 transition-colors"
                        aria-label={`View ${s.fullName}`}
                        title="View"
                        id={`view-student-${s.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/students/${s.id}/edit`)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                        aria-label={`Edit ${s.fullName}`}
                        title="Edit"
                        id={`edit-student-${s.id}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(s)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        aria-label={`Delete ${s.fullName}`}
                        title="Delete"
                        id={`delete-student-${s.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 0 && (
          <Pagination
            page={page} totalPages={totalPages}
            totalElements={totalElements} size={size}
            onPageChange={setPage} onSizeChange={setSize}
          />
        )}
      </div>

      {/* Create Modal */}
      <Modal open={createOpen} onClose={() => setCreateOpen(false)}
             title="Add New Student" size="2xl">
        <StudentForm
          onSuccess={() => { setCreateOpen(false); void fetchStudents() }}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
             title="Delete Student" size="sm">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                Are you sure you want to delete <strong>{deleteTarget?.fullName}</strong>?
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Register No: {deleteTarget?.registerNumber} · This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete} id="confirm-delete-btn">
              Delete Student
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
