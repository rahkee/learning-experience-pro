import { useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell.jsx'
import { getStudent } from '../data/courses.js'
import { getInitials } from '../data/fakeUsers.js'

export default function GlobalNav() {
  const { pathname } = useLocation()
  const student = getStudent()

  if (pathname.startsWith('/play/') || pathname === '/notifications') return null

  return (
    <nav
      className="fixed top-0 right-0 z-50 flex items-center gap-4 px-6 py-4 animate-in"
      style={{ '--delay': '0ms' }}
      aria-label="Main navigation"
    >
      <NotificationBell />
      <button
        type="button"
        className="p-2 rounded-full hover:bg-white/10 transition-colors"
        aria-label="Messages"
      >
        <i className="fa-solid fa-envelope text-xl" />
      </button>
      <div
        className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold shrink-0"
        aria-hidden
      >
        {getInitials(student)}
      </div>
    </nav>
  )
}
