import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { studentAPI } from '../services/api'
import StudentForm from '../components/StudentForm'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'

export default function StudentsPage() {
  const [students, setStudents] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [classes, setClasses] = useState([])
  const [modal, setModal] = useState({ open: false, mode: 'add', student: null })
  const [deleteModal, setDeleteModal] = useState({ open: false, student: null })

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true)
    try {
      const res = await studentAPI.getAll({ page, limit: 10, search, class: filterClass })
      setStudents(res.data.students)
      setPagination(res.data.pagination)
    } catch {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [search, filterClass])

  useEffect(() => {
    fetchStudents()
    studentAPI.getClasses().then(r => setClasses(r.data.classes)).catch(() => {})
  }, [fetchStudents])

  const handleAdd = async (data) => {
    setFormLoading(true)
    try {
      await studentAPI.create(data)
      toast.success('Student added successfully')
      setModal({ open: false })
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student')
    } finally {
      setFormLoading(false)
    }
  }

  const handleUpdate = async (data) => {
    setFormLoading(true)
    try {
      await studentAPI.update(modal.student._id, data)
      toast.success('Student updated')
      setModal({ open: false })
      fetchStudents()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      await studentAPI.delete(deleteModal.student._id)
      toast.success('Student deleted')
      setDeleteModal({ open: false })
      fetchStudents()
    } catch {
      toast.error('Failed to delete student')
    }
  }

  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-white font-bold text-xl">Students</h1>
          <p className="text-white/30 text-sm mt-0.5">{pagination.total} total students</p>
        </div>
        <button
          onClick={() => setModal({ open: true, mode: 'add', student: null })}
          className="btn-primary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="input pl-10"
            placeholder="Search by name or roll number…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input sm:w-44"
          value={filterClass}
          onChange={e => setFilterClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Student', 'Roll No.', 'Class', 'Contact', 'Actions'].map(h => (
                  <th key={h} className="text-left text-white/30 text-xs uppercase tracking-wider px-5 py-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="table-row">
                    {Array(5).fill(0).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-white/5 rounded animate-pulse w-3/4" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-white/30 py-16">
                    No students found
                  </td>
                </tr>
              ) : students.map(student => (
                <tr key={student._id} className="table-row">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-600/20 border border-primary-500/20 flex items-center justify-center text-primary-400 text-sm font-semibold shrink-0">
                        {student.name[0]}
                      </div>
                      <div>
                        <p className="text-white font-medium">{student.name}</p>
                        {student.email && <p className="text-white/30 text-xs">{student.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-white/60 text-xs bg-white/5 px-2 py-1 rounded">{student.rollNumber}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-white/70">{student.class}{student.section ? `-${student.section}` : ''}</span>
                  </td>
                  <td className="px-5 py-3.5 text-white/50">{student.contact || '—'}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/students/${student._id}`}
                        className="p-1.5 rounded-lg text-white/40 hover:text-primary-400 hover:bg-primary-500/10 transition-colors"
                        title="View profile"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => setModal({ open: true, mode: 'edit', student })}
                        className="p-1.5 rounded-lg text-white/40 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteModal({ open: true, student })}
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between">
            <p className="text-white/30 text-xs">
              Page {pagination.page} of {pagination.pages}
            </p>
            <div className="flex gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchStudents(pagination.page - 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >← Prev</button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchStudents(pagination.page + 1)}
                className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40"
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title={modal.mode === 'add' ? 'Add New Student' : 'Edit Student'}
        size="lg"
      >
        <StudentForm
          initial={modal.student}
          onSubmit={modal.mode === 'add' ? handleAdd : handleUpdate}
          onCancel={() => setModal({ open: false })}
          loading={formLoading}
        />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false })}
        title="Delete Student"
        size="sm"
      >
        <p className="text-white/60 text-sm mb-6">
          Are you sure you want to delete{' '}
          <span className="text-white font-medium">{deleteModal.student?.name}</span>?
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={handleDelete} className="btn-danger flex-1 justify-center">
            Delete Student
          </button>
          <button onClick={() => setDeleteModal({ open: false })} className="btn-secondary flex-1 justify-center">
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  )
}
