import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const titles = {
  '/dashboard': 'Dashboard',
  '/students': 'Students',
  '/attendance': 'Attendance',
}

export default function Navbar({ onMenuClick }) {
  const location = useLocation()
  const { user } = useAuth()

  const title = Object.entries(titles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] || 'EduTrack'

  return (
    <header className="h-16 border-b border-white/[0.06] bg-surface-2/50 backdrop-blur-sm flex items-center px-6 gap-4 sticky top-0 z-10">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-white/50 hover:text-white transition-colors"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex-1">
        <h1 className="text-white font-semibold text-lg">{title}</h1>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-white text-sm font-medium">{user?.name}</p>
          <p className="text-white/30 text-xs capitalize">{user?.role}</p>
        </div>
        <div className="w-9 h-9 rounded-xl bg-primary-600/30 border border-primary-500/30 flex items-center justify-center text-primary-400 font-semibold">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  )
}
