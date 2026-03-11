import { useState, useCallback, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getGlobalNotifications, markThreadRead } from '../data/discussions.js'
import { getAllCoursesWithProgress, flattenCoursePages } from '../data/courses.js'
import { getUserById, getDisplayName } from '../data/fakeUsers.js'
import { saveProgress } from '../data/progress.js'
import { timeAgo } from '../utils/timeAgo.js'
import RenderText from './RenderText.jsx'
import RoleBadge from './shared/RoleBadge.jsx'
import UserAvatar from './shared/UserAvatar.jsx'

export default function NotificationPanel({ open, onClose }) {
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

  if (!open) return null

  return (
    <div className="absolute top-full right-0 mt-2 w-80 rounded-xl bg-gray-900 border border-gray-800 shadow-2xl z-50 flex flex-col animate-panel" style={{ maxHeight: '28rem', transformOrigin: 'top right' }}>
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between shrink-0 animate-fade" style={{ '--delay': '0ms' }}>
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
                className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors flex gap-2.5 items-start border-b border-gray-800/50 last:border-b-0 animate-in"
                style={{ '--delay': `${Math.min(i * 30, 400)}ms` }}
              >
                {t.unread && (
                  <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
                )}
                {user && (
                  <UserAvatar user={user} size="md" className="mt-0.5" />
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

      <div
        className="px-4 py-2.5 border-t border-gray-800 shrink-0 animate-in"
        style={{ '--delay': `${Math.min(items.length * 30 + 50, 500)}ms` }}
      >
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
