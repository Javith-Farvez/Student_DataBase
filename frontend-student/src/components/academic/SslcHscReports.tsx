import { useEffect, useState } from 'react'
import { getSslcReports, getHscReports } from '@/api/academicApi'
import type { SslcReports, HscReports, ReportRow } from '@/types/academic'
import { Loader2, Award, School, BarChart2, BookOpen } from 'lucide-react'

export default function SslcHscReports() {
  const [sslcReports, setSslcReports] = useState<SslcReports | null>(null)
  const [hscReports, setHscReports] = useState<HscReports | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getSslcReports(), getHscReports()])
      .then(([sslcRes, hscRes]) => {
        if (sslcRes.success) setSslcReports(sslcRes.data)
        if (hscRes.success) setHscReports(hscRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-vsb-600" />
        <p className="text-sm font-medium">Loading Academic Reports Data...</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto">
      {/* ── SSLC Reports ── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          <BookOpen className="w-5 h-5 text-vsb-600" />
          SSLC (10th Standard) Analytics Report
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Board Breakdown */}
          <div className="card p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <School className="w-4 h-4 text-vsb-500" /> Board Performance
            </h4>
            <div className="space-y-2">
              {sslcReports?.byBoard.map((r: ReportRow, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-50">
                  <span className="font-medium text-gray-800">{r.label || 'Unknown'}</span>
                  <div className="text-right">
                    <span className="font-bold text-vsb-700">{r.count} students</span>
                    {r.avgPct != null && (
                      <span className="text-xs text-gray-500 block">Avg: {r.avgPct.toFixed(2)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grade Distribution */}
          <div className="card p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-500" /> Grade Distribution
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {sslcReports?.byGrade.map((r: { label: string; count: number }, i: number) => (
                <div key={i} className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                  <span className="text-xs text-emerald-600 font-semibold block">{r.label || 'Other'}</span>
                  <span className="text-lg font-bold text-emerald-800">{r.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── HSC Reports ── */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900 border-b border-gray-100 pb-2">
          <BarChart2 className="w-5 h-5 text-indigo-600" />
          HSC (12th Standard) Cutoff & Stream Report
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Stream / Group Report */}
          <div className="card p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500" /> Stream / Group Stats
            </h4>
            <div className="space-y-2">
              {hscReports?.byGroup.map((r: ReportRow, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 rounded-lg bg-indigo-50/40 border border-indigo-100/50">
                  <span className="font-medium text-gray-800">{r.label || 'General'}</span>
                  <div className="text-right">
                    <span className="font-bold text-indigo-700">{r.count} students</span>
                    {r.avgCutoff != null && (
                      <span className="text-xs text-indigo-600 font-medium block">Avg Cutoff: {r.avgCutoff.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department-wise Cutoff Report */}
          <div className="card p-4 space-y-3">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-vsb-500" /> Department Admission Cutoffs
            </h4>
            <div className="space-y-2">
              {hscReports?.byDepartment.map((r: { label: string; count: number; avgCutoff?: number }, i: number) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 rounded-lg bg-gray-50">
                  <span className="font-medium text-gray-800 max-w-[180px] truncate" title={r.label}>{r.label}</span>
                  <div className="text-right">
                    <span className="font-bold text-gray-900">{r.count} intake</span>
                    {r.avgCutoff != null && (
                      <span className="text-xs font-semibold text-vsb-600 block">Cutoff: {r.avgCutoff.toFixed(2)}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
