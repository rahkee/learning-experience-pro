import { useEffect, useRef } from 'react'
import { getInitials, getDisplayName } from '../data/fakeUsers.js'

function RoleBadge({ role }) {
  if (role === 'student') return null
  const colors =
    role === 'teacher'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-purple-500/20 text-purple-400'
  return (
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase ${colors}`}>
      {role}
    </span>
  )
}

export default function MentionAutocomplete({ users, activeIndex, onSelect, visible }) {
  const listRef = useRef(null)

  useEffect(() => {
    if (!visible || !listRef.current) return
    const active = listRef.current.children[activeIndex]
    if (active) active.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, visible])

  if (!visible || users.length === 0) return null

  return (
    <div
      ref={listRef}
      className="absolute bottom-full left-0 mb-1 w-64 max-h-48 overflow-y-auto rounded-lg bg-gray-800 border border-gray-700 shadow-xl z-30"
    >
      {users.map((user, i) => (
        <button
          key={user.id}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault()
            onSelect(user)
          }}
          className={`w-full text-left flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
            i === activeIndex ? 'bg-gray-700' : 'hover:bg-gray-700/50'
          }`}
        >
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ backgroundColor: user.color + '33', color: user.color }}
          >
            {getInitials(user)}
          </span>
          <span className="flex-1 min-w-0 truncate text-gray-200">
            {getDisplayName(user)}
          </span>
          <RoleBadge role={user.role} />
        </button>
      ))}
    </div>
  )
}
