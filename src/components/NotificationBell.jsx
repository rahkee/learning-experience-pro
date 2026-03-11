import { useState, useRef, useEffect } from 'react'
import { getGlobalUnreadCount } from '../data/discussions.js'
import NotificationPanel from './NotificationPanel.jsx'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const unread = getGlobalUnreadCount()

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-white/10 transition-colors relative"
        aria-label="Notifications"
      >
        <i className="fa-solid fa-bell text-xl" />
        {unread > 0 && (
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      {open && <NotificationPanel onClose={() => setOpen(false)} />}
    </div>
  )
}
