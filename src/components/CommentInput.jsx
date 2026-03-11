import { useState, useRef, useMemo } from 'react'
import { getAllMentionableUsers } from '../data/fakeUsers.js'
import MentionAutocomplete from './MentionAutocomplete.jsx'

export default function CommentInput({ onSubmit, placeholder = 'Write a comment...', courseColor }) {
  const [text, setText] = useState('')
  const [mentionQuery, setMentionQuery] = useState(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)

  const allUsers = useMemo(() => getAllMentionableUsers(), [])

  const filteredUsers = useMemo(() => {
    if (mentionQuery === null) return []
    const q = mentionQuery.toLowerCase()
    return allUsers.filter(
      (u) =>
        u.firstName.toLowerCase().startsWith(q) ||
        u.lastName.toLowerCase().startsWith(q) ||
        `${u.firstName} ${u.lastName}`.toLowerCase().startsWith(q)
    )
  }, [mentionQuery, allUsers])

  const detectMention = (value, cursorPos) => {
    const before = value.slice(0, cursorPos)
    const match = before.match(/@(\w*)$/)
    if (match) {
      setMentionQuery(match[1])
      setActiveIndex(0)
    } else {
      setMentionQuery(null)
    }
  }

  const handleChange = (e) => {
    const value = e.target.value
    setText(value)
    detectMention(value, e.target.selectionStart)
  }

  const insertMention = (user) => {
    const input = inputRef.current
    if (!input) return
    const cursorPos = input.selectionStart
    const before = text.slice(0, cursorPos)
    const after = text.slice(cursorPos)
    const mentionStart = before.lastIndexOf('@')
    const newText = before.slice(0, mentionStart) + `@${user.firstName} ` + after
    setText(newText)
    setMentionQuery(null)
    setTimeout(() => {
      const newPos = mentionStart + user.firstName.length + 2
      input.focus()
      input.setSelectionRange(newPos, newPos)
    }, 0)
  }

  const handleKeyDown = (e) => {
    if (mentionQuery !== null && filteredUsers.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActiveIndex((i) => Math.min(i + 1, filteredUsers.length - 1))
        return
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActiveIndex((i) => Math.max(i - 1, 0))
        return
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault()
        insertMention(filteredUsers[activeIndex])
        return
      }
      if (e.key === 'Escape') {
        setMentionQuery(null)
        return
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const trimmed = text.trim()
      if (!trimmed) return
      onSubmit(trimmed)
      setText('')
      setMentionQuery(null)
    }
  }

  return (
    <div className="relative">
      <MentionAutocomplete
        users={filteredUsers}
        activeIndex={activeIndex}
        onSelect={insertMention}
        visible={mentionQuery !== null && filteredUsers.length > 0}
      />
      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-gray-500 transition-colors"
        />
        <button
          type="button"
          onClick={() => {
            const trimmed = text.trim()
            if (!trimmed) return
            onSubmit(trimmed)
            setText('')
            setMentionQuery(null)
          }}
          disabled={!text.trim()}
          className="shrink-0 px-3 py-2 rounded-lg text-sm font-medium text-white transition-colors disabled:opacity-30"
          style={{ backgroundColor: courseColor ?? '#6366f1' }}
        >
          <i className="fa-solid fa-paper-plane text-xs" />
        </button>
      </div>
    </div>
  )
}
