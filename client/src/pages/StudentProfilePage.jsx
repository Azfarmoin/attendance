import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { studentAPI, attendanceAPI } from '../services/api'
import { RadialBarChart, RadialBar, PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

const StatusBadge = ({ status }) => {
  const map = {
    Present: 'badge-present',
    Absent: 'badge-absent',
    Late: 'badge-late',
  }
  return <span className={map[status] || ''}>{status}</span>
}

export default function StudentProfilePage() {
  const { id } = useParams()
  const [student, setStudent] = useState(null)
  const [attendance, setAttendance] = useState({ records: [], stats: {}, subjectStats: {} })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      studentAPI.getOne(id),
      attendanceAPI.getByStudent(id),
    ])
      .then(([sRes, aRes]) => {
        setStudent(sRes.data.student)
        setAttendance(aRes.data)
      })
      .catch(() => toast.error('Failed to load student'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!student) return (
    <div className="text-center text-white/40 py-20">Student not found</div>
  )

  const { stats, records, subjectStats } = attendance
  const pieData = [
    { name: 'Present', value: stats.present || 0, color: '#10b981' },
    { name: 'Absent', value: stats.absent || 0, color: '#ef4444' },
    { name: 'Late', value: stats.late || 0, color: '#f59e0b' },
  ]

  return (
    <div className="max-w-5xl space-y-6 animate-slide-up">
      {/* Back */}
      <Link to="/students" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Students
      </Link>

      {/* Profile header */}
      <div className="card p-6 flex flex-col sm:flex-row gap-6 items-start">
        <div className="w-16 h-16 rounded-2xl bg-primary-600/20 border border-primary-500/20 flex items-center justify-center text-primary-400 text-2xl font-bold shrink-0">
          {student.name[0]}
        </div>
        <div className="flex-1">
          <h1 className="text-white text-xl font-bold">{student.name}</h1>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-white/40 text-sm flex items-center gap-1.5">
              <span className="font-mono text-xs bg-white/5 px-2 py-0.5 rounded">{student.rollNumber}</span>
            </span>
            <span className="text-white/40 text-sm">Class {student.class}{student.section ? `-${student.section}` : ''}</span>
            {student.contact && <span className="text-white/40 text-sm">{student.contact}</span>}
          </div>
          {student.guardianName && (
            <p className="text-white/30 text-xs mt-2">Guardian: {student.guardianName}</p>
          )}
        </div>
        <div className="text-right">
          <p className="text-white/30 text-xs uppercase tracking-wider">Attendance</p>
          <p className={`text-3xl font-bold mt-1 ${
            Number(stats.percentage) >= 75 ? 'text-emerald-400' :
            Number(stats.percentage) >= 50 ? 'text-amber-400' : 'text-red-400'
          }`}>{stats.percentage}%</p>
        </div>
      </div>

      {/* Stats + Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'Present', value: stats.present, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Absent', value: stats.absent, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'Late', value: stats.late, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
        ].map(s => (
          <div key={s.label} className={`card p-5 border ${s.bg}`}>
            <p className="text-white/40 text-xs uppercase tracking-wider">{s.label}</p>
            <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value || 0}</p>
            <p className="text-white/20 text-xs mt-1">of {stats.total || 0} classes</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Pie chart */}
        <div className="card p-6">
          <h2 className="text-white font-semibold mb-4">Attendance Breakdown</h2>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-white/40">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.name}
              </div>
            ))}
          </div>
        </div>

        {/* Subject stats */}
        <div className="card p-6">
          <h2 className="text-white font-semibold mb-4">By Subject</h2>
          <div className="space-y-3">
            {Object.entries(subjectStats).map(([subject, s]) => {
              const pct = s.total ? (((s.present + s.late) / s.total) * 100).toFixed(0) : 0
              return (
                <div key={subject}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{subject}</span>
                    <span className={Number(pct) >= 75 ? 'text-emerald-400' : 'text-amber-400'}>{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${Number(pct) >= 75 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {Object.keys(subjectStats).length === 0 && (
              <p className="text-white/30 text-sm text-center py-4">No data</p>
            )}
          </div>
        </div>
      </div>

      {/* Attendance history */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white font-semibold">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Date', 'Subject', 'Status', 'Remarks'].map(h => (
                  <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider px-5 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={4} className="text-center text-white/30 py-12">No records</td></tr>
              ) : records.slice(0, 30).map((rec, i) => (
                <tr key={i} className="table-row">
                  <td className="px-5 py-3 text-white/60">
                    {new Date(rec.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-white/60">{rec.subject}</td>
                  <td className="px-5 py-3"><StatusBadge status={rec.status} /></td>
                  <td className="px-5 py-3 text-white/30">{rec.remarks || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
