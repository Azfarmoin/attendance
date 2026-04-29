import { useState, useEffect } from 'react'
import { studentAPI, attendanceAPI } from '../services/api'
import toast from 'react-hot-toast'

const SUBJECTS = ['Mathematics','Physics','Chemistry','English','Computer Science','Biology','History','Geography','Urdu','Islamiat']
const STATUS_OPTIONS = ['Present', 'Absent', 'Late']

const statusColor = {
  Present: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25',
  Absent: 'bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25',
  Late: 'bg-amber-500/15 border-amber-500/30 text-amber-400 hover:bg-amber-500/25',
}

export default function AttendanceForm({ onSuccess }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [subject, setSubject] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [classes, setClasses] = useState([])
  const [sheet, setSheet] = useState([])
  const [sheetLoaded, setSheetLoaded] = useState(false)
  const [statuses, setStatuses] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    studentAPI.getClasses().then(r => setClasses(r.data.classes)).catch(() => {})
  }, [])

  const loadSheet = async () => {
    if (!date || !subject) { toast.error('Please select date and subject'); return }
    setLoading(true)
    setSheetLoaded(false)
    try {
      const res = await attendanceAPI.getSheet({ date, subject, class: filterClass })
      setSheet(res.data.sheet)
      // Pre-fill existing statuses
      const existing = {}
      res.data.sheet.forEach(({ student, attendance }) => {
        existing[student._id] = attendance?.status || 'Present'
      })
      setStatuses(existing)
      setSheetLoaded(true)
    } catch {
      toast.error('Failed to load attendance sheet')
    } finally {
      setLoading(false)
    }
  }

  const setAll = (status) => {
    const updated = {}
    sheet.forEach(({ student }) => { updated[student._id] = status })
    setStatuses(updated)
  }

  const handleSubmit = async () => {
    if (!sheetLoaded || sheet.length === 0) return
    setSubmitting(true)
    try {
      const records = sheet.map(({ student }) => ({
        studentId: student._id,
        date,
        subject,
        status: statuses[student._id] || 'Present',
      }))
      await attendanceAPI.mark(records)
      toast.success(`Attendance saved for ${records.length} students`)
      onSuccess?.()
    } catch {
      toast.error('Failed to save attendance')
    } finally {
      setSubmitting(false)
    }
  }

  const presentCount = Object.values(statuses).filter(s => s === 'Present').length
  const absentCount = Object.values(statuses).filter(s => s === 'Absent').length
  const lateCount = Object.values(statuses).filter(s => s === 'Late').length

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="card p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={date} onChange={e => { setDate(e.target.value); setSheetLoaded(false) }} />
          </div>
          <div>
            <label className="label">Subject</label>
            <select className="input" value={subject} onChange={e => { setSubject(e.target.value); setSheetLoaded(false) }}>
              <option value="">Select subject</option>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Class (optional)</label>
            <select className="input" value={filterClass} onChange={e => { setFilterClass(e.target.value); setSheetLoaded(false) }}>
              <option value="">All Classes</option>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={loadSheet} disabled={loading} className="btn-primary w-full justify-center">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
              Load Sheet
            </button>
          </div>
        </div>
      </div>

      {/* Sheet */}
      {sheetLoaded && sheet.length > 0 && (
        <div className="space-y-4 animate-slide-up">
          {/* Summary bar */}
          <div className="card p-4 flex flex-wrap items-center gap-4 justify-between">
            <div className="flex gap-4 text-sm">
              <span className="text-emerald-400">{presentCount} Present</span>
              <span className="text-red-400">{absentCount} Absent</span>
              <span className="text-amber-400">{lateCount} Late</span>
              <span className="text-white/30">/ {sheet.length} total</span>
            </div>
            <div className="flex gap-2">
              {STATUS_OPTIONS.map(s => (
                <button key={s} onClick={() => setAll(s)} className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${statusColor[s]}`}>
                  All {s}
                </button>
              ))}
            </div>
          </div>

          {/* Student rows */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left text-white/30 text-xs uppercase tracking-wider px-5 py-3 font-medium">Student</th>
                  <th className="text-left text-white/30 text-xs uppercase tracking-wider px-5 py-3 font-medium">Roll No.</th>
                  <th className="text-left text-white/30 text-xs uppercase tracking-wider px-5 py-3 font-medium">Class</th>
                  <th className="text-left text-white/30 text-xs uppercase tracking-wider px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {sheet.map(({ student, attendance: prev }) => (
                  <tr key={student._id} className="table-row">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-primary-600/20 flex items-center justify-center text-primary-400 text-xs font-semibold">
                          {student.name[0]}
                        </div>
                        <span className="text-white">{student.name}</span>
                        {prev && (
                          <span className="text-white/20 text-xs">• edited</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-mono text-xs text-white/40">{student.rollNumber}</span>
                    </td>
                    <td className="px-5 py-3 text-white/50">{student.class}</td>
                    <td className="px-5 py-3">
                      <div className="flex gap-1.5">
                        {STATUS_OPTIONS.map(s => (
                          <button
                            key={s}
                            onClick={() => setStatuses(p => ({ ...p, [student._id]: s }))}
                            className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all
                              ${statuses[student._id] === s ? statusColor[s] : 'border-white/5 text-white/20 hover:border-white/15 hover:text-white/40'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end">
            <button onClick={handleSubmit} disabled={submitting} className="btn-primary px-8">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Save Attendance
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {sheetLoaded && sheet.length === 0 && (
        <div className="card p-10 text-center text-white/30">
          No students found for the selected filters.
        </div>
      )}
    </div>
  )
}
