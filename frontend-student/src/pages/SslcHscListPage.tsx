import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus, Eye, Pencil, Trash2, BookOpen,
  Search, ArrowUpDown, ChevronDown, X, BarChart3,
} from 'lucide-react'
import toast from 'react-hot-toast'

import Button from '@/components/ui/Button'
import Modal from '@/components/ui/Modal'
import Pagination from '@/components/ui/Pagination'
import SslcHscForm from '@/components/academic/SslcHscForm'
import SslcHscReports from '@/components/academic/SslcHscReports'
import { getSslcList, deleteSslc, getHscList, deleteHsc } from '@/api/academicApi'
import type { SslcDetail, HscDetail, SslcFilters, HscFilters } from '@/types/academic'
import { GRADE_COLORS, RESULT_COLORS, BOARD_OPTIONS, HSC_GROUP_OPTIONS } from '@/types/academic'

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color = 'bg-vsb-50 text-vsb-700' }: {
  label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <div className={`card p-4 border-0 ${color.includes('vsb') ? '' : ''}`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr className="border-b border-gray-50">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-4 rounded w-full" />
        </td>
      ))}
    </tr>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_SSLC_FILTERS: SslcFilters = {
  search: '', board: '', year: '', department: '', result: ''
}
const DEFAULT_HSC_FILTERS: HscFilters = {
  search: '', board: '', year: '', department: '', groupName: '', result: ''
}

type Tab = 'sslc' | 'hsc'

export default function SslcHscListPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<Tab>('sslc')

  // SSLC state
  const [sslcList, setSslcList]   = useState<SslcDetail[]>([])
  const [sslcFilters, setSslcFilters] = useState<SslcFilters>(DEFAULT_SSLC_FILTERS)
  const [sslcPage, setSslcPage]   = useState(0)
  const [sslcSize, setSslcSize]   = useState(10)
  const [sslcTotal, setSslcTotal] = useState(0)
  const [sslcPages, setSslcPages] = useState(0)
  const [sslcSort,  setSslcSort]  = useState('id')
  const [sslcDir,   setSslcDir]   = useState<'asc'|'desc'>('asc')
  const [sslcLoading, setSslcLoading] = useState(true)

  // HSC state
  const [hscList, setHscList]   = useState<HscDetail[]>([])
  const [hscFilters, setHscFilters] = useState<HscFilters>(DEFAULT_HSC_FILTERS)
  const [hscPage, setHscPage]   = useState(0)
  const [hscSize, setHscSize]   = useState(10)
  const [hscTotal, setHscTotal] = useState(0)
  const [hscPages, setHscPages] = useState(0)
  const [hscSort,  setHscSort]  = useState('id')
  const [hscDir,   setHscDir]   = useState<'asc'|'desc'>('asc')
  const [hscLoading, setHscLoading] = useState(true)

  // Modals
  const [formOpen,    setFormOpen]    = useState(false)
  const [formType,    setFormType]    = useState<Tab>('sslc')
  const [editRecord,  setEditRecord]  = useState<SslcDetail | HscDetail | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; type: Tab; name: string } | null>(null)
  const [deleting,    setDeleting]    = useState(false)
  const [showReports, setShowReports] = useState(false)
  const [filtersOpen, setFiltersOpen] = useState(false)

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchSslc = useCallback(async () => {
    setSslcLoading(true)
    try {
      const res = await getSslcList({
        ...sslcFilters, page: sslcPage, size: sslcSize,
        sortBy: sslcSort, sortDir: sslcDir
      })
      if (res.success) {
        setSslcList(res.data.content)
        setSslcTotal(res.data.totalElements)
        setSslcPages(res.data.totalPages)
      }
    } catch { toast.error('Failed to load SSLC records') }
    finally { setSslcLoading(false) }
  }, [sslcFilters, sslcPage, sslcSize, sslcSort, sslcDir])

  const fetchHsc = useCallback(async () => {
    setHscLoading(true)
    try {
      const res = await getHscList({
        ...hscFilters, page: hscPage, size: hscSize,
        sortBy: hscSort, sortDir: hscDir
      })
      if (res.success) {
        setHscList(res.data.content)
        setHscTotal(res.data.totalElements)
        setHscPages(res.data.totalPages)
      }
    } catch { toast.error('Failed to load HSC records') }
    finally { setHscLoading(false) }
  }, [hscFilters, hscPage, hscSize, hscSort, hscDir])

  useEffect(() => { void fetchSslc() }, [fetchSslc])
  useEffect(() => { void fetchHsc()  }, [fetchHsc])

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      if (deleteTarget.type === 'sslc') { await deleteSslc(deleteTarget.id); void fetchSslc() }
      else                              { await deleteHsc(deleteTarget.id);  void fetchHsc()  }
      toast.success('Record deleted')
      setDeleteTarget(null)
    } catch { toast.error('Delete failed') }
    finally { setDeleting(false) }
  }

  // ── Sort ──────────────────────────────────────────────────────────────────
  const handleSslcSort = (col: string) => {
    if (sslcSort === col) setSslcDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSslcSort(col); setSslcDir('asc') }
  }
  const handleHscSort = (col: string) => {
    if (hscSort === col) setHscDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setHscSort(col); setHscDir('asc') }
  }

  const SortTh = ({ label, col, onSort, current }: {
    label: string; col: string; onSort: (c: string) => void; current: string
  }) => (
    <th
      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
                 cursor-pointer hover:bg-gray-50 select-none transition-colors"
      onClick={() => onSort(col)}
    >
      <span className="flex items-center gap-1.5">
        {label}
        <ArrowUpDown className={`w-3 h-3 ${current === col ? 'text-vsb-600' : 'text-gray-300'}`} />
      </span>
    </th>
  )

  // ── Mark Badge ────────────────────────────────────────────────────────────
  const GradeBadge = ({ grade }: { grade?: string }) => {
    if (!grade) return <span className="text-gray-400 text-xs">—</span>
    return (
      <span className={`badge ${GRADE_COLORS[grade] ?? 'bg-gray-100 text-gray-700'}`}>
        {grade}
      </span>
    )
  }

  const ResultBadge = ({ result }: { result?: string }) => {
    if (!result) return <span className="text-gray-400 text-xs">—</span>
    return (
      <span className={`badge ${RESULT_COLORS[result] ?? 'bg-gray-100 text-gray-700'}`}>
        {result}
      </span>
    )
  }

  // ── Filter Controls ───────────────────────────────────────────────────────
  const FilterSelect = ({ label, value, onChange, options }: {
    label: string; value: string;
    onChange: (v: string) => void;
    options: string[]
  }) => (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none text-sm border border-gray-200 rounded-lg px-3 py-2 pr-8
                   bg-white focus:outline-none focus:ring-2 focus:ring-vsb-500 transition-all"
        aria-label={label}
      >
        <option value="">All {label}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 animate-fade-in">

      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">SSLC & HSC Records</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            10th & 12th academic details — VSB Engineering College
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            icon={<BarChart3 className="w-4 h-4" />}
            onClick={() => setShowReports(true)}
            id="view-reports-btn"
          >
            Reports
          </Button>
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => { setFormType(activeTab); setEditRecord(null); setFormOpen(true) }}
            id="add-record-btn"
          >
            Add {activeTab === 'sslc' ? '10th' : '12th'} Record
          </Button>
        </div>
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total SSLC Records" value={sslcTotal} sub="10th std entries" />
        <StatCard label="Total HSC Records"  value={hscTotal}  sub="12th std entries" />
        <StatCard label="SSLC Pass Rate"     value="—" sub="Run report for stats" />
        <StatCard label="Avg HSC Cutoff"     value="—" sub="Run report for stats" />
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        {/* Tab bar */}
        <div className="flex border-b border-gray-100 bg-white">
          {(['sslc', 'hsc'] as Tab[]).map(tab => (
            <button
              key={tab}
              id={`tab-${tab}`}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-all
                ${activeTab === tab
                  ? 'border-vsb-600 text-vsb-700 bg-vsb-50/50'
                  : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <BookOpen className="w-4 h-4" />
              {tab === 'sslc' ? '10th Standard (SSLC)' : '12th Standard (HSC)'}
              <span className={`text-xs px-2 py-0.5 rounded-full font-semibold
                ${activeTab === tab ? 'bg-vsb-100 text-vsb-700' : 'bg-gray-100 text-gray-500'}`}>
                {tab === 'sslc' ? sslcTotal : hscTotal}
              </span>
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="p-4 border-b border-gray-50 bg-gray-50/50">
          {activeTab === 'sslc' ? (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    value={sslcFilters.search}
                    onChange={e => { setSslcFilters(f => ({...f, search: e.target.value})); setSslcPage(0) }}
                    placeholder="Search by name or register number…"
                    id="sslc-search"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white
                               focus:outline-none focus:ring-2 focus:ring-vsb-500 transition-all"
                  />
                </div>
                <button
                  onClick={() => setFiltersOpen(o => !o)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                    ${filtersOpen ? 'bg-vsb-50 border-vsb-300 text-vsb-700' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  Filters <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </button>
                {(sslcFilters.board || sslcFilters.year || sslcFilters.department || sslcFilters.result) && (
                  <button onClick={() => setSslcFilters(DEFAULT_SSLC_FILTERS)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
              {filtersOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
                  <FilterSelect label="Board" value={sslcFilters.board}
                    onChange={v => { setSslcFilters(f => ({...f, board: v})); setSslcPage(0) }}
                    options={BOARD_OPTIONS} />
                  <FilterSelect label="Result" value={sslcFilters.result}
                    onChange={v => { setSslcFilters(f => ({...f, result: v})); setSslcPage(0) }}
                    options={['PASS', 'FAIL']} />
                  <div>
                    <input type="number" placeholder="Passing Year"
                      value={sslcFilters.year}
                      onChange={e => { setSslcFilters(f => ({...f, year: e.target.value})); setSslcPage(0) }}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white
                                 focus:outline-none focus:ring-2 focus:ring-vsb-500" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    value={hscFilters.search}
                    onChange={e => { setHscFilters(f => ({...f, search: e.target.value})); setHscPage(0) }}
                    placeholder="Search by name or register number…"
                    id="hsc-search"
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white
                               focus:outline-none focus:ring-2 focus:ring-vsb-500 transition-all"
                  />
                </div>
                <button
                  onClick={() => setFiltersOpen(o => !o)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                    ${filtersOpen ? 'bg-vsb-50 border-vsb-300 text-vsb-700' : 'bg-white border-gray-200 text-gray-600'}`}
                >
                  Filters <ChevronDown className={`w-3.5 h-3.5 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
                </button>
                {(hscFilters.board || hscFilters.year || hscFilters.department || hscFilters.groupName || hscFilters.result) && (
                  <button onClick={() => setHscFilters(DEFAULT_HSC_FILTERS)}
                    className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors">
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>
              {filtersOpen && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up">
                  <FilterSelect label="Board" value={hscFilters.board}
                    onChange={v => { setHscFilters(f => ({...f, board: v})); setHscPage(0) }}
                    options={BOARD_OPTIONS} />
                  <FilterSelect label="Group" value={hscFilters.groupName}
                    onChange={v => { setHscFilters(f => ({...f, groupName: v})); setHscPage(0) }}
                    options={HSC_GROUP_OPTIONS} />
                  <FilterSelect label="Result" value={hscFilters.result}
                    onChange={v => { setHscFilters(f => ({...f, result: v})); setHscPage(0) }}
                    options={['PASS', 'FAIL']} />
                  <div>
                    <input type="number" placeholder="Passing Year"
                      value={hscFilters.year}
                      onChange={e => { setHscFilters(f => ({...f, year: e.target.value})); setHscPage(0) }}
                      className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white
                                 focus:outline-none focus:ring-2 focus:ring-vsb-500" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── SSLC Table ── */}
        {activeTab === 'sslc' && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <SortTh label="Register No."  col="registerNumber" onSort={handleSslcSort} current={sslcSort} />
                  <SortTh label="Student Name"  col="fullName"       onSort={handleSslcSort} current={sslcSort} />
                  <SortTh label="School"        col="schoolName"     onSort={handleSslcSort} current={sslcSort} />
                  <SortTh label="Board"         col="board"          onSort={handleSslcSort} current={sslcSort} />
                  <SortTh label="Year"          col="passingYear"    onSort={handleSslcSort} current={sslcSort} />
                  <SortTh label="Total / %"     col="percentage"     onSort={handleSslcSort} current={sslcSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Result</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sslcLoading ? (
                  [...Array(sslcSize)].map((_, i) => <SkeletonRow key={i} cols={9} />)
                ) : sslcList.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-16 text-center">
                    <p className="text-gray-400 text-sm">No SSLC records found</p>
                  </td></tr>
                ) : sslcList.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-vsb-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-vsb-700 bg-vsb-50 px-2 py-0.5 rounded">
                        {r.registerNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{r.fullName}</p>
                      <p className="text-xs text-gray-400">{r.departmentName}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[160px] truncate">{r.schoolName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.board ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.passingYear ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{r.totalMarks ?? '—'}/{r.maxMarks ?? 600}</p>
                      <p className="text-xs text-gray-500">{r.percentage != null ? `${r.percentage}%` : '—'}</p>
                    </td>
                    <td className="px-4 py-3"><GradeBadge grade={r.grade} /></td>
                    <td className="px-4 py-3"><ResultBadge result={r.result} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/academic/sslc/${r.id}`)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-vsb-600 hover:bg-vsb-50 transition-colors"
                          title="View" id={`view-sslc-${r.id}`}><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setEditRecord(r); setFormType('sslc'); setFormOpen(true) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit" id={`edit-sslc-${r.id}`}><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget({ id: r.id, type: 'sslc', name: r.fullName })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete" id={`del-sslc-${r.id}`}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sslcPages > 0 && (
              <Pagination page={sslcPage} totalPages={sslcPages} totalElements={sslcTotal}
                size={sslcSize} onPageChange={setSslcPage} onSizeChange={setSslcSize} />
            )}
          </div>
        )}

        {/* ── HSC Table ── */}
        {activeTab === 'hsc' && (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <SortTh label="Register No."  col="registerNumber" onSort={handleHscSort} current={hscSort} />
                  <SortTh label="Student Name"  col="fullName"       onSort={handleHscSort} current={hscSort} />
                  <SortTh label="School"        col="schoolName"     onSort={handleHscSort} current={hscSort} />
                  <SortTh label="Board"         col="board"          onSort={handleHscSort} current={hscSort} />
                  <SortTh label="Group"         col="groupName"      onSort={handleHscSort} current={hscSort} />
                  <SortTh label="Year"          col="passingYear"    onSort={handleHscSort} current={hscSort} />
                  <SortTh label="% / Cutoff"    col="percentage"     onSort={handleHscSort} current={hscSort} />
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {hscLoading ? (
                  [...Array(hscSize)].map((_, i) => <SkeletonRow key={i} cols={9} />)
                ) : hscList.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-16 text-center">
                    <p className="text-gray-400 text-sm">No HSC records found</p>
                  </td></tr>
                ) : hscList.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-vsb-50/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-vsb-700 bg-vsb-50 px-2 py-0.5 rounded">
                        {r.registerNumber}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{r.fullName}</p>
                      <p className="text-xs text-gray-400">{r.departmentName}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-[140px] truncate">{r.schoolName ?? '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.board ?? '—'}</td>
                    <td className="px-4 py-3">
                      {r.groupName
                        ? <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium">{r.groupName}</span>
                        : <span className="text-gray-400 text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.passingYear ?? '—'}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-900">{r.percentage != null ? `${r.percentage}%` : '—'}</p>
                      <p className="text-xs text-gray-500">
                        Cutoff: {r.cutoff != null ? <strong className="text-vsb-700">{r.cutoff}</strong> : '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3"><GradeBadge grade={r.grade} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => navigate(`/academic/hsc/${r.id}`)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-vsb-600 hover:bg-vsb-50 transition-colors"
                          title="View" id={`view-hsc-${r.id}`}><Eye className="w-4 h-4" /></button>
                        <button onClick={() => { setEditRecord(r); setFormType('hsc'); setFormOpen(true) }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit" id={`edit-hsc-${r.id}`}><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => setDeleteTarget({ id: r.id, type: 'hsc', name: r.fullName })}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete" id={`del-hsc-${r.id}`}><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {hscPages > 0 && (
              <Pagination page={hscPage} totalPages={hscPages} totalElements={hscTotal}
                size={hscSize} onPageChange={setHscPage} onSizeChange={setHscSize} />
            )}
          </div>
        )}
      </div>

      {/* ── Create/Edit Modal ── */}
      <Modal open={formOpen} onClose={() => setFormOpen(false)}
             title={`${editRecord ? 'Edit' : 'Add'} ${formType === 'sslc' ? 'SSLC (10th)' : 'HSC (12th)'} Record`}
             size="xl">
        <SslcHscForm
          type={formType}
          record={editRecord as SslcDetail | HscDetail | null}
          onSuccess={() => {
            setFormOpen(false)
            if (formType === 'sslc') void fetchSslc()
            else void fetchHsc()
          }}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      {/* ── Reports Modal ── */}
      <Modal open={showReports} onClose={() => setShowReports(false)}
             title="SSLC & HSC Reports" size="2xl">
        <SslcHscReports />
      </Modal>

      {/* ── Delete Confirm ── */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
             title="Delete Academic Record" size="sm">
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-700">
            Delete {deleteTarget?.type.toUpperCase()} record for{' '}
            <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={handleDelete} id="confirm-delete-acad">
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
