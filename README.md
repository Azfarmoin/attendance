# 📚 EduTrack — MERN Attendance Management System

A full-stack student attendance management system built with the MERN stack (MongoDB, Express, React, Node.js).

---

## ✨ Features

### Authentication
- JWT-based login & registration
- Role-based access (Admin / Teacher)
- Token auto-refresh and protected routes

### Student Management
- Add, edit, delete (soft-delete) students
- Search by name or roll number
- Filter by class
- Paginated student list
- Individual student profile with attendance analytics

### Attendance Management
- Mark attendance (Present / Absent / Late) by date & subject
- Bulk mark attendance for entire class at once
- Mark all as Present/Absent/Late with one click
- Pre-fill existing records when reopening a date/subject
- View full attendance history with filters
- Per-student attendance % and subject breakdown

### Dashboard Analytics
- Total students & classes at a glance
- Today's present/absent/late stats
- 7-day attendance trend (area chart)
- Today's breakdown (bar chart)
- Recent activity feed

---

## 🗂️ Project Structure

```
attendance-app/
├── client/                    # React + Vite frontend
│   └── src/
│       ├── components/
│       │   ├── AttendanceForm.jsx
│       │   ├── AttendanceTable.jsx
│       │   ├── Layout.jsx
│       │   ├── Modal.jsx
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── Sidebar.jsx
│       │   └── StudentForm.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── AttendancePage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── StudentProfilePage.jsx
│       │   └── StudentsPage.jsx
│       ├── services/
│       │   └── api.js
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
└── server/                    # Node.js + Express backend
    ├── config/
    │   └── seed.js
    ├── controllers/
    │   ├── auth.controller.js
    │   ├── attendance.controller.js
    │   ├── dashboard.controller.js
    │   └── student.controller.js
    ├── middleware/
    │   └── auth.middleware.js
    ├── models/
    │   ├── Attendance.js
    │   ├── Student.js
    │   └── User.js
    ├── routes/
    │   ├── attendance.routes.js
    │   ├── auth.routes.js
    │   ├── dashboard.routes.js
    │   └── student.routes.js
    ├── .env.example
    └── index.js
```

---

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local) or MongoDB Atlas URI
- npm or yarn

---

### 1. Clone / Extract
```bash
cd attendance-app
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/attendance_db
JWT_SECRET=your_very_secret_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

**Start the server:**
```bash
npm run dev      # development with nodemon
# or
npm start        # production
```

**Seed sample data (optional but recommended):**
```bash
npm run seed
```
This creates:
- 2 demo users (admin + teacher)
- 10 sample students across 5 classes
- 30 days of attendance records

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 🔑 Demo Credentials

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@school.com       | admin123    |
| Teacher | teacher@school.com     | teacher123  |

---

## 📡 API Reference

### Auth
| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| POST   | /api/auth/register    | Register new user    |
| POST   | /api/auth/login       | Login & get token    |
| GET    | /api/auth/me          | Get current user     |

### Students
| Method | Endpoint              | Description                        |
|--------|-----------------------|------------------------------------|
| GET    | /api/students         | List students (paginated, filtered)|
| POST   | /api/students         | Create student                     |
| GET    | /api/students/:id     | Get single student                 |
| PUT    | /api/students/:id     | Update student                     |
| DELETE | /api/students/:id     | Soft-delete student                |
| GET    | /api/students/classes | Get distinct classes               |

**Query params for GET /api/students:**
- `search` — name or roll number
- `class` — filter by class
- `page`, `limit` — pagination
- `all=true` — skip pagination (for dropdowns)

### Attendance
| Method | Endpoint                     | Description                      |
|--------|------------------------------|----------------------------------|
| POST   | /api/attendance              | Bulk mark attendance             |
| GET    | /api/attendance              | List records (filtered)          |
| GET    | /api/attendance/sheet        | Get sheet for date+subject       |
| GET    | /api/attendance/:studentId   | Student's attendance + stats     |

**Query params for GET /api/attendance:**
- `date`, `subject`, `class`, `page`, `limit`

**Query params for /api/attendance/sheet:**
- `date`, `subject`, `class` (required: date, subject)

### Dashboard
| Method | Endpoint        | Description              |
|--------|-----------------|--------------------------|
| GET    | /api/dashboard  | Analytics & stats        |

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Recharts  |
| Routing   | React Router v6                         |
| State     | Context API + useState/useEffect        |
| HTTP      | Axios (with interceptors)               |
| Backend   | Node.js, Express 4                      |
| Database  | MongoDB + Mongoose                      |
| Auth      | JWT + bcryptjs                          |
| Toasts    | react-hot-toast                         |

---

## 🧱 Database Schemas

### User
```js
{ name, email, password (hashed), role: 'admin'|'teacher' }
```

### Student
```js
{ name, rollNumber (unique), class, section, contact, email,
  guardianName, address, isActive, createdBy }
```

### Attendance
```js
{ studentId (ref), date, subject, status: 'Present'|'Absent'|'Late',
  remarks, markedBy }
// Unique index on: studentId + date + subject
```

---

## 📝 Notes

- Attendance uses **upsert** — re-marking a date/subject updates the record
- Students are **soft-deleted** (isActive: false) to preserve attendance history
- The Vite proxy forwards `/api/*` to Express during development
- JWT is stored in `localStorage` and attached via Axios interceptor
