import { useEffect, useRef } from 'react'
import { getDisplayName } from '../data/fakeUsers.js'
import RoleBadge from './shared/RoleBadge.jsx'
import UserAvatar from './shared/UserAvatar.jsx'

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
          <UserAvatar user={user} />
          <span className="flex-1 min-w-0 truncate text-gray-200">
            {getDisplayName(user)}
          </span>
          <RoleBadge role={user.role} />
        </button>
      ))}
    </div>
  )
}
