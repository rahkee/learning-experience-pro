import { useState, useEffect, useCallback } from 'react'
import { getAllStudentThreads, markThreadRead, getThread, addReply } from '../data/discussions.js'
import { getUserById, getInitials, getDisplayName, generateFakeReply, getAllUsersWithStatus } from '../data/fakeUsers.js'
import CommentInput from './CommentInput.jsx'
import RenderText from './RenderText.jsx'

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function RoleBadge({ role }) {
  if (role === 'student') return null
  const colors =
    role === 'teacher'
      ? 'bg-red-500/20 text-red-400'
      : 'bg-purple-500/20 text-purple-400'
  return (
    <span className={`text-[10px] px-1 py-0.5 rounded-full font-medium uppercase leading-none ${colors}`}>
      {role}
    </span>
  )
}

export default function ChatSidebar({ open, onClose, courseId, courseColor, steps, onNavigate }) {
  const [expandedKey, setExpandedKey] = useState(null)
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const [usersWithStatus, setUsersWithStatus] = useState(() => getAllUsersWithStatus())

  useEffect(() => {
    if (!open) return
    const id = setInterval(() => setUsersWithStatus(getAllUsersWithStatus()), 5000)
    return () => clearInterval(id)
  }, [open])

  const threads = getAllStudentThreads(courseId, steps)
  void version

  const handleThreadClick = (t) => {
    markThreadRead(t.elementKey)
    if (expandedKey === t.elementKey) {
      setExpandedKey(null)
    } else {
      setExpandedKey(t.elementKey)
    }
    if (onNavigate && t.stepIndex !== undefined) {
      onNavigate(t.stepIndex)
    }
    refresh()
  }

  const handleReply = (elementKey, commentId, text) => {
    addReply(elementKey, commentId, text)
    refresh()
    generateFakeReply(elementKey, text, commentId).then(() => refresh())
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-80 bg-gray-900 border-l border-gray-800 z-50 flex flex-col shadow-2xl">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-sm font-semibold">My Discussions</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
          >
            <i className="fa-light fa-xmark text-sm" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-gray-800 flex items-center gap-2 overflow-x-auto">
          {usersWithStatus.map((u) => (
            <div key={u.id} className="relative shrink-0">
              <span
                className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-opacity ${u.online ? '' : 'opacity-40'}`}
                style={{ backgroundColor: u.color + '33', color: u.color }}
                title={getDisplayName(u)}
              >
                {getInitials(u)}
              </span>
              {u.online && (
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-900" />
              )}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {threads.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">
              No discussions yet. Start one by clicking the comment icon on any content.
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {threads.map((t) => {
                const isExpanded = expandedKey === t.elementKey
                const thread = isExpanded ? getThread(t.elementKey) : null

                return (
                  <div key={t.elementKey}>
                    <button
                      type="button"
                      onClick={() => handleThreadClick(t)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {t.unread && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm truncate ${t.unread ? 'font-bold text-white' : 'text-gray-300'}`}>
                            {t.lessonTitle}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-0.5">
                            {t.latestText}
                          </p>
                          <span className="text-[10px] text-gray-600 mt-1 inline-block">
                            {t.commentCount} message{t.commentCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <i className={`fa-light fa-chevron-${isExpanded ? 'up' : 'down'} text-xs text-gray-600 mt-1`} />
                      </div>
                    </button>

                    {isExpanded && thread && (
                      <div className="px-4 pb-4 space-y-4">
                        {thread.comments.map((comment) => {
                          const user = getUserById(comment.userId)
                          return (
                            <div key={comment.id} className="text-xs">
                              <div className="flex items-center gap-1.5 mb-1">
                                <span
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold shrink-0"
                                  style={{ backgroundColor: (user?.color ?? '#6366f1') + '33', color: user?.color }}
                                >
                                  {getInitials(user)}
                                </span>
                                <span className="font-semibold text-gray-300">{getDisplayName(user)}</span>
                                <RoleBadge role={user?.role} />
                                <span className="text-gray-600 text-[10px]">{timeAgo(comment.timestamp)}</span>
                              </div>
                              <p className="text-gray-400 ml-7 break-words">
                                <RenderText text={comment.text} />
                              </p>

                              {comment.replies.length > 0 && (
                                <div className="ml-7 mt-2.5 pl-3 border-l border-gray-800 space-y-2.5">
                                  {comment.replies.map((r) => {
                                    const rUser = getUserById(r.userId)
                                    return (
                                      <div key={r.id} className="flex gap-1.5 items-start">
                                        <span
                                          className="w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-bold shrink-0 mt-0.5"
                                          style={{ backgroundColor: (rUser?.color ?? '#6366f1') + '33', color: rUser?.color }}
                                        >
                                          {getInitials(rUser)}
                                        </span>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1 flex-wrap">
                                            <span className="font-semibold text-gray-400" style={{ color: rUser?.color }}>
                                              {getDisplayName(rUser)}
                                            </span>
                                            <RoleBadge role={rUser?.role} />
                                          </div>
                                          <p className="text-gray-500 mt-0.5 break-words">
                                            <RenderText text={r.text} />
                                          </p>
                                        </div>
                                      </div>
                                    )
                                  })}
                                </div>
                              )}

                              <div className="ml-7 mt-3">
                                <CommentInput
                                  onSubmit={(text) => handleReply(t.elementKey, comment.id, text)}
                                  placeholder="Reply..."
                                  courseColor={courseColor}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
