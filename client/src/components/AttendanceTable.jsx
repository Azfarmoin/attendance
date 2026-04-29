import { useState, useEffect, useCallback } from 'react'
import { attendanceAPI, studentAPI } from '../services/api'
import toast from 'react-hot-toast'

const StatusBadge = ({ status }) => {
  const map = {
    Present: 'badge-present',
    Absent: 'badge-absent',
    Late: 'badge-late',
  }
  return <span className={map[status] || 'text-white/30'}>{status}</span>
}

export default function AttendanceTable() {
  const [records, setRecords] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ date: '', subject: '', class: '' })
  const [classes, setClasses] = useState([])

  useEffect(() => {
    studentAPI.getClasses().then(r => setClasses(r.data.classes)).catch(() => {})
  }, [])

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await attendanceAPI.getAll({ ...filters, page, limit: 15 })
      setRecords(res.data.records)
      setPagination(res.data.pagination)
    } catch {
      toast.error('Failed to fetch records')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const setFilter = (key) => (e) => setFilters(p => ({ ...p, [key]: e.target.value }))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="card p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="label">Filter by Date</label>
          <input type="date" className="input" value={filters.date} onChange={setFilter('date')} />
        </div>
        <div>
          <label className="label">Filter by Subject</label>
          <input type="text" className="input" placeholder="e.g. Mathematics" value={filters.subject} onChange={setFilter('subject')} />
        </div>
        <div>
          <label className="label">Filter by Class</label>
          <select className="input" value={filters.class} onChange={setFilter('class')}>
            <option value="">All Classes</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06] flex items-center justify-between">
          <p className="text-white/40 text-sm">{pagination.total} records</p>
          <button onClick={() => fetchRecords()} className="btn-secondary text-xs py-1.5 px-3">
            Refresh
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Student', 'Class', 'Date', 'Subject', 'Status'].map(h => (
                  <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(6).fill(0).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-3.5">
                        <div className="h-4 bg-white/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : records.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-white/30 py-16">No records found</td></tr>
              ) : records.map((rec, i) => (
                <tr key={i} className="table-row">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-surface-3 flex items-center justify-center text-white/40 text-xs font-semibold shrink-0">
                        {rec.student?.name?.[0]}
                      </div>
                      <span className="text-white">{rec.student?.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-white/50">{rec.student?.class}</td>
                  <td className="px-5 py-3.5 text-white/50">
                    {new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3.5 text-white/60">{rec.subject}</td>
                  <td className="px-5 py-3.5"><StatusBadge status={rec.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pagination.pages > 1 && (
          <div className="px-5 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-white/30 text-xs">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={pagination.page <= 1} onClick={() => fetchRecords(pagination.page - 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">← Prev</button>
              <button disabled={pagination.page >= pagination.pages} onClick={() => fetchRecords(pagination.page + 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
