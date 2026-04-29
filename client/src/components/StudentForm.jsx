import { useState, useEffect } from 'react'

const CLASSES = ['8-A','8-B','9-A','9-B','10-A','10-B','11-A','11-B','12-A','12-B']

export default function StudentForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({
    name: '', rollNumber: '', class: '', section: '',
    contact: '', email: '', guardianName: '', address: '',
    ...initial,
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (initial) setForm(f => ({ ...f, ...initial }))
  }, [initial])

  const set = (field) => (e) => {
    setForm(p => ({ ...p, [field]: e.target.value }))
    setErrors(p => ({ ...p, [field]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.rollNumber.trim()) e.rollNumber = 'Required'
    if (!form.class) e.class = 'Required'
    if (form.contact && !/^[\d\s\+\-\(\)]{7,15}$/.test(form.contact))
      e.contact = 'Invalid phone number'
    return e
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    onSubmit(form)
  }

  const Field = ({ label, name, type = 'text', placeholder, required }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-400 ml-1">*</span>}</label>
      <input
        type={type}
        className={`input ${errors[name] ? 'border-red-500/50' : ''}`}
        placeholder={placeholder}
        value={form[name]}
        onChange={set(name)}
      />
      {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name" name="name" placeholder="Ali Hassan" required />
        <Field label="Roll Number" name="rollNumber" placeholder="CS-001" required />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="label">Class <span className="text-red-400">*</span></label>
          <select
            className={`input ${errors.class ? 'border-red-500/50' : ''}`}
            value={form.class}
            onChange={set('class')}
          >
            <option value="">Select class</option>
            {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {errors.class && <p className="text-red-400 text-xs mt-1">{errors.class}</p>}
        </div>
        <div>
          <label className="label">Section</label>
          <select className="input" value={form.section} onChange={set('section')}>
            <option value="">Select section</option>
            {['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Contact Number" name="contact" placeholder="0300-1234567" />
        <Field label="Email" name="email" type="email" placeholder="student@email.com" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Guardian Name" name="guardianName" placeholder="Parent/Guardian" />
        <Field label="Address" name="address" placeholder="City, Country" />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving…
            </span>
          ) : initial?._id ? 'Update Student' : 'Add Student'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
      </div>
    </form>
  )
}
