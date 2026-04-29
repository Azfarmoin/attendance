import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../services/api'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend
} from 'recharts'
import toast from 'react-hot-toast'

const StatCard = ({ label, value, sub, icon, color }) => (
  <div className="stat-card flex items-start gap-4 animate-slide-up">
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white text-2xl font-bold">{value ?? '—'}</p>
      {sub && <p className="text-white/30 text-xs mt-0.5">{sub}</p>}
    </div>
  </div>
)

const StatusDot = ({ status }) => {
  const map = {
    Present: 'bg-emerald-500',
    Absent: 'bg-red-500',
    Late: 'bg-amber-500',
  }
  return <span className={`w-2 h-2 rounded-full inline-block ${map[status] || 'bg-white/20'}`} />
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardAPI.get()
      .then(res => setData(res.data.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { totalStudents, totalClasses, todayStats, recentAttendance, weeklyTrend } = data || {}

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Students"
          value={totalStudents}
          sub="Active enrollments"
          color="bg-primary-600/20 text-primary-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
        />
        <StatCard
          label="Classes"
          value={totalClasses}
          sub="Distinct classes"
          color="bg-violet-500/20 text-violet-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
        />
        <StatCard
          label="Present Today"
          value={todayStats?.Present ?? 0}
          sub={`of ${todayStats?.total ?? 0} marked`}
          color="bg-emerald-500/20 text-emerald-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Absent Today"
          value={todayStats?.Absent ?? 0}
          sub={`${todayStats?.Late ?? 0} late`}
          color="bg-red-500/20 text-red-400"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        {/* Weekly trend - area chart */}
        <div className="card p-6 xl:col-span-3">
          <h2 className="text-white font-semibold mb-1">7-Day Attendance Trend</h2>
          <p className="text-white/30 text-xs mb-5">Present, Absent, Late over the last week</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={weeklyTrend || []} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gPresent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gAbsent" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => v?.slice(5)} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }} />
              <Area type="monotone" dataKey="Present" stroke="#10b981" fill="url(#gPresent)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Absent" stroke="#ef4444" fill="url(#gAbsent)" strokeWidth={2} dot={false} />
              <Area type="monotone" dataKey="Late" stroke="#f59e0b" strokeWidth={2} dot={false} fill="transparent" strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Today breakdown - bar */}
        <div className="card p-6 xl:col-span-2">
          <h2 className="text-white font-semibold mb-1">Today's Breakdown</h2>
          <p className="text-white/30 text-xs mb-5">Attendance status summary</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={[
              { name: 'Present', value: todayStats?.Present || 0 },
              { name: 'Absent', value: todayStats?.Absent || 0 },
              { name: 'Late', value: todayStats?.Late || 0 },
            ]} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1d27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}
                fill="#6366f1"
                label={false}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent attendance */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-white font-semibold">Recent Activity</h2>
            <p className="text-white/30 text-xs mt-0.5">Latest attendance records today</p>
          </div>
          <Link to="/attendance" className="btn-secondary text-xs py-2 px-3">
            View All →
          </Link>
        </div>

        {recentAttendance?.length ? (
          <div className="space-y-0">
            {recentAttendance.map((rec, i) => (
              <div key={i} className="flex items-center gap-4 py-3 border-b border-white/[0.04] last:border-0">
                <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center text-white/50 text-sm font-medium shrink-0">
                  {rec.student?.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{rec.student?.name}</p>
                  <p className="text-white/30 text-xs">{rec.student?.class} · {rec.subject}</p>
                </div>
                <div className={`
                  px-2.5 py-1 rounded-lg text-xs font-medium border flex items-center gap-1.5
                  ${rec.status === 'Present' ? 'badge-present' : rec.status === 'Absent' ? 'badge-absent' : 'badge-late'}
                `}>
                  <StatusDot status={rec.status} />
                  {rec.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-white/30 text-sm text-center py-8">No attendance records for today yet</p>
        )}
      </div>
    </div>
  )
}
