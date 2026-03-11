import { useState, useRef, useEffect, useCallback } from 'react'
import { getGlobalUnreadCount } from '../data/discussions.js'
import NotificationPanel from './NotificationPanel.jsx'

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [unread, setUnread] = useState(() => getGlobalUnreadCount())
  const containerRef = useRef(null)

  const poll = useCallback(() => setUnread(getGlobalUnreadCount()), [])

  useEffect(() => {
    const id = setInterval(poll, 2000)
    return () => clearInterval(id)
  }, [poll])

  useEffect(() => {
    if (!open) return
    poll()
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, poll])

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
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>
      {open && <NotificationPanel onClose={() => setOpen(false)} />}
    </div>
  )
}
