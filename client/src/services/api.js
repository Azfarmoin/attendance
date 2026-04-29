import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
}

// ─── Students ──────────────────────────────────────────────────────────────────
export const studentAPI = {
  getAll: (params) => api.get('/students', { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getClasses: () => api.get('/students/classes'),
}

// ─── Attendance ────────────────────────────────────────────────────────────────
export const attendanceAPI = {
  mark: (records) => api.post('/attendance', { records }),
  getAll: (params) => api.get('/attendance', { params }),
  getByStudent: (studentId, params) => api.get(`/attendance/${studentId}`, { params }),
  getSheet: (params) => api.get('/attendance/sheet', { params }),
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardAPI = {
  get: () => api.get('/dashboard'),
}

export default api
