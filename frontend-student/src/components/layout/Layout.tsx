import type { ReactNode } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

interface Props { children: ReactNode }

export default function Layout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}
