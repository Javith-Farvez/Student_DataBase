import { NavLink } from 'react-router-dom'
import {
  GraduationCap, Users, LayoutDashboard,
  Settings, BookOpen, Bus, ChevronRight,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard',   icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Students',    icon: Users,            to: '/students'  },
  { label: 'SSLC & HSC',  icon: GraduationCap,    to: '/academic/sslc-hsc' },
  { label: 'Departments', icon: BookOpen,         to: '/departments' },
  { label: 'Transport',   icon: Bus,              to: '/transport' },
  { label: 'Settings',    icon: Settings,         to: '/settings'  },
]

export default function Sidebar() {
  return (
    <aside className="flex flex-col w-64 min-h-screen bg-navy-900 text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-vsb-600">
          <GraduationCap className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight text-white">VSB ERP</p>
          <p className="text-xs text-slate-400 leading-tight">Engineering College</p>
        </div>
      </div>

      {/* Module Label */}
      <div className="px-5 pt-6 pb-2">
        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">
          Main Menu
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-nav-link group ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            <span className="flex-1">{label}</span>
            <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-50 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-vsb-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">A</span>
          </div>
          <div>
            <p className="text-xs font-semibold text-white">Admin User</p>
            <p className="text-[10px] text-slate-400">admin@vsb.ac.in</p>
          </div>
        </div>
        <p className="text-center text-[10px] text-slate-600 mt-3">
          VSB ERP v3.0 · Karur 639 111
        </p>
      </div>
    </aside>
  )
}
