import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'

const ROUTE_LABELS: Record<string, string> = {
  '/students':     'Student Master',
  '/dashboard':    'Dashboard',
  '/departments':  'Departments',
  '/transport':    'Transport',
  '/settings':     'Settings',
}

export default function Header() {
  const { pathname } = useLocation()
  const base = '/' + pathname.split('/')[1]
  const label = ROUTE_LABELS[base] ?? 'VSB ERP'

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between
                       bg-white/80 backdrop-blur-md border-b border-gray-100
                       px-6 py-3 h-16">
      {/* Breadcrumb */}
      <div>
        <h1 className="text-lg font-semibold text-gray-900">{label}</h1>
        <p className="text-xs text-gray-400">
          V.S.B. Engineering College — Karur 639 111
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>
        <button
          className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-vsb-500" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-vsb-500 to-vsb-700 flex items-center justify-center">
          <span className="text-xs font-bold text-white">A</span>
        </div>
      </div>
    </header>
  )
}
