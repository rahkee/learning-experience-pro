import { useState, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getGlobalNotifications, markThreadRead } from '../data/discussions.js'
import { getAllCoursesWithProgress, flattenCoursePages } from '../data/courses.js'
import { getUserById, getInitials, getDisplayName } from '../data/fakeUsers.js'
import { saveProgress } from '../data/progress.js'
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

export default function NotificationPanel({ onClose }) {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  void version

  const coursesWithSteps = useMemo(() => {
    const courses = getAllCoursesWithProgress()
    return courses.map((c) => ({
      courseId: c.id ?? c.courseId,
      courseName: c.name,
      courseColor: c.color,
      steps: flattenCoursePages(c),
    }))
  }, [])

  const items = getGlobalNotifications(coursesWithSteps)

  const handleClick = (t) => {
    markThreadRead(t.elementKey)
    refresh()
    saveProgress(t.courseId, { currentLessonId: t.lessonId, currentPage: t.pageIndex })
    onClose()
    navigate(`/play/${t.courseId}`, { state: { stepIndex: t.stepIndex, ts: Date.now() } })
  }

  const hasAny = items.length > 0

  return (
    <div className="absolute top-full right-0 mt-2 w-80 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl z-50 flex flex-col" style={{ maxHeight: '28rem' }}>
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {hasAny && (
          <button
            type="button"
            onClick={() => {
              for (const t of items) markThreadRead(t.elementKey)
              refresh()
            }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        {!hasAny ? (
          <div className="px-4 py-8 text-center text-gray-500 text-sm">
            No notifications yet.
          </div>
        ) : (
          items.map((t, i) => {
            const user = t.latestUserId ? getUserById(t.latestUserId) : null

            return (
              <button
                key={`${t.elementKey}-${i}`}
                type="button"
                onClick={() => handleClick(t)}
                className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors flex gap-2.5 items-start border-b border-gray-800/50 last:border-b-0"
              >
                {t.unread && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                )}
                {user && (
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: (user.color ?? '#6366f1') + '33', color: user.color }}
                  >
                    {getInitials(user)}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className={`text-xs truncate ${t.unread ? 'font-bold text-white' : 'text-gray-300'}`}>
                      {user ? getDisplayName(user) : 'Unknown'}
                    </span>
                    {user && <RoleBadge role={user.role} />}
                    {t.type === 'mention' && (
                      <span className="text-[10px] px-1 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-400 leading-none">
                        mentioned you
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    <RenderText text={t.latestText} />
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-medium" style={{ color: t.courseColor }}>
                      {t.courseName}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {t.lessonTitle}
                    </span>
                    <span className="text-[10px] text-gray-600 ml-auto">
                      {t.lastActivityTimestamp ? timeAgo(t.lastActivityTimestamp) : ''}
                    </span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>

      <div className="px-4 py-2.5 border-t border-gray-800 shrink-0">
        <Link
          to="/notifications"
          onClick={onClose}
          className="block text-center text-xs font-medium text-gray-400 hover:text-white transition-colors"
        >
          View All Notifications
        </Link>
      </div>
    </div>
  )
}
