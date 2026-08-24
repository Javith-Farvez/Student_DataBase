import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import type { StudentFilters } from '@/types/student'
import { DEPARTMENTS } from '@/types/student'

interface FilterBarProps {
  filters: StudentFilters
  onChange: (f: Partial<StudentFilters>) => void
  onReset: () => void
  totalElements: number
}

const YEARS    = ['1', '2', '3', '4', '5']
const SEMESTERS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
const SECTIONS  = ['A', 'B', 'C', 'D', 'E']
const GENDERS   = [{ value: 'MALE', label: 'Male' }, { value: 'FEMALE', label: 'Female' }, { value: 'OTHER', label: 'Other' }]
const COMMUNITIES = ['OC', 'BC', 'BCM', 'MBC', 'SC', 'ST', 'SCA', 'OBC']
const STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'ALUMNI', label: 'Alumni' },
  { value: 'DROPOUT', label: 'Dropout' },
  { value: 'TRANSFERRED', label: 'Transferred' },
]

function FilterSelect({
  label, value, onChange, options, placeholder = 'All',
}: {
  label: string; value: string;
  onChange: (v: string) => void;
  options: (string | { value: string; label: string })[];
  placeholder?: string;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none text-sm border border-gray-200 rounded-lg
                   px-3 py-2 pr-8 bg-white text-gray-700
                   focus:outline-none focus:ring-2 focus:ring-vsb-500 focus:border-transparent
                   transition-all duration-150 cursor-pointer"
        aria-label={label}
      >
        <option value="">{placeholder !== 'All' ? placeholder : `All ${label}`}</option>
        {options.map((o) => {
          const v = typeof o === 'string' ? o : o.value
          const l = typeof o === 'string' ? o : o.label
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
    </div>
  )
}

export default function FilterBar({ filters, onChange, onReset, totalElements }: FilterBarProps) {
  const [open, setOpen] = useState(false)
  const activeCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== '').length

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-card overflow-hidden">
      {/* Search row */}
      <div className="flex items-center gap-3 p-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name, register no, roll no, or email…"
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg
                       bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-vsb-500
                       focus:border-transparent transition-all duration-150"
            id="student-search-input"
          />
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setOpen(!open)}
          id="filter-toggle-btn"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium
                      transition-all duration-150
                      ${open ? 'bg-vsb-50 border-vsb-300 text-vsb-700'
                             : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeCount > 0 && (
            <span className="bg-vsb-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {/* Reset */}
        {(activeCount > 0 || filters.search) && (
          <button
            onClick={onReset}
            id="filter-reset-btn"
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium
                       text-red-500 hover:bg-red-50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Clear
          </button>
        )}

        <span className="text-sm text-gray-400 shrink-0">
          {totalElements} student{totalElements !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Expandable filter grid */}
      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3
                        px-4 pb-4 border-t border-gray-50 pt-4 animate-slide-up">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Department</p>
            <FilterSelect
              label="Department" value={filters.department}
              onChange={(v) => onChange({ department: v })}
              options={DEPARTMENTS.map(d => ({ value: d, label: d.split(' ')[0] }))}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Year</p>
            <FilterSelect
              label="Year" value={filters.year}
              onChange={(v) => onChange({ year: v })}
              options={YEARS.map(y => ({ value: y, label: `Year ${y}` }))}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Semester</p>
            <FilterSelect
              label="Semester" value={filters.semester}
              onChange={(v) => onChange({ semester: v })}
              options={SEMESTERS.map(s => ({ value: s, label: `Sem ${s}` }))}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Section</p>
            <FilterSelect
              label="Section" value={filters.section}
              onChange={(v) => onChange({ section: v })}
              options={SECTIONS}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Community</p>
            <FilterSelect
              label="Community" value={filters.community}
              onChange={(v) => onChange({ community: v })}
              options={COMMUNITIES}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Gender</p>
            <FilterSelect
              label="Gender" value={filters.gender}
              onChange={(v) => onChange({ gender: v })}
              options={GENDERS}
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-500 mb-1.5">Status</p>
            <FilterSelect
              label="Status" value={filters.status}
              onChange={(v) => onChange({ status: v })}
              options={STATUSES}
            />
          </div>
        </div>
      )}
    </div>
  )
}
