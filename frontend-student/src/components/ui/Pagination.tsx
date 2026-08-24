import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

export default function Pagination({
  page, totalPages, totalElements, size,
  onPageChange, onSizeChange,
}: PaginationProps) {
  const from = page * size + 1
  const to   = Math.min((page + 1) * size, totalElements)

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i
    if (page <= 2) return i
    if (page >= totalPages - 3) return totalPages - 5 + i
    return page - 2 + i
  })

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-3
                    border-t border-gray-100 bg-white rounded-b-xl">
      {/* Info */}
      <p className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{from}–{to}</span>{' '}
        of <span className="font-medium text-gray-900">{totalElements}</span> students
      </p>

      <div className="flex items-center gap-3">
        {/* Page size */}
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-gray-500" htmlFor="page-size">Per page:</label>
          <select
            id="page-size"
            value={size}
            onChange={(e) => { onSizeChange(Number(e.target.value)); onPageChange(0) }}
            className="text-xs border border-gray-200 rounded px-2 py-1 bg-white text-gray-700
                       focus:outline-none focus:ring-2 focus:ring-vsb-500"
          >
            {[5, 10, 20, 50].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors
                ${p === page
                  ? 'bg-vsb-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'}`}
            >
              {p + 1}
            </button>
          ))}

          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="p-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50
                       disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
