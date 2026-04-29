import { useState } from 'react'
import AttendanceForm from '../components/AttendanceForm'
import AttendanceTable from '../components/AttendanceTable'

const tabs = [
  { id: 'mark', label: 'Mark Attendance', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { id: 'history', label: 'View History', icon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  )},
]

export default function AttendancePage() {
  const [activeTab, setActiveTab] = useState('mark')
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="max-w-6xl space-y-6">
      {/* Tab switcher */}
      <div className="flex gap-1 bg-surface-2 border border-white/[0.06] rounded-xl p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                : 'text-white/40 hover:text-white'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'mark' && (
        <AttendanceForm
          key={refreshKey}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}
      {activeTab === 'history' && <AttendanceTable key={refreshKey} />}
    </div>
  )
}
