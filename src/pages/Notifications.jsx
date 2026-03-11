import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getGlobalNotifications, markThreadRead } from '../data/discussions.js'
import { getAllCoursesWithProgress, flattenCoursePages } from '../data/courses.js'
import { getUserById, getDisplayName } from '../data/fakeUsers.js'
import { saveProgress } from '../data/progress.js'
import { timeAgo } from '../utils/timeAgo.js'
import RenderText from '../components/RenderText.jsx'
import RoleBadge from '../components/shared/RoleBadge.jsx'
import UserAvatar from '../components/shared/UserAvatar.jsx'

function NotificationItem({ item, onClick }) {
  const user = item.latestUserId ? getUserById(item.latestUserId) : null

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="w-full text-left px-3 py-3.5 rounded-lg hover:bg-gray-800/50 transition-colors flex gap-3 items-start"
    >
      {item.unread && (
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 mt-1.5" />
      )}
      {user && (
        <UserAvatar user={user} className="mt-0.5" />
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`text-sm ${item.unread ? 'font-bold text-white' : 'text-gray-300'}`}>
            {user ? getDisplayName(user) : 'Unknown'}
          </span>
          {user && <RoleBadge role={user.role} />}
          {item.type === 'mention' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium bg-indigo-500/20 text-indigo-400 leading-none">
              mentioned you
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          <RenderText text={item.latestText} />
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-gray-600">{item.lessonTitle}</span>
          <span className="text-[10px] text-gray-600 ml-auto">
            {item.lastActivityTimestamp ? timeAgo(item.lastActivityTimestamp) : ''}
          </span>
        </div>
      </div>
    </button>
  )
}

export default function Notifications() {
  const navigate = useNavigate()

  const coursesWithSteps = useMemo(() => {
    const courses = getAllCoursesWithProgress()
    return courses.map((c) => ({
      courseId: c.id ?? c.courseId,
      courseName: c.name,
      courseColor: c.color,
      steps: flattenCoursePages(c),
    }))
  }, [])

  const allItems = getGlobalNotifications(coursesWithSteps)

  const generalItems = allItems.filter((t) => t.type === 'mention')

  const byCourse = {}
  for (const cws of coursesWithSteps) {
    byCourse[cws.courseId] = {
      courseName: cws.courseName,
      courseColor: cws.courseColor,
      items: allItems
        .filter((t) => t.courseId === cws.courseId && t.type === 'thread')
        .sort((a, b) => (b.lastActivityTimestamp ?? '').localeCompare(a.lastActivityTimestamp ?? '')),
    }
  }

  const handleClick = (t) => {
    markThreadRead(t.elementKey)
    saveProgress(t.courseId, { currentLessonId: t.lessonId, currentPage: t.pageIndex })
    navigate(`/play/${t.courseId}`, { state: { stepIndex: t.stepIndex, ts: Date.now() } })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/90 backdrop-blur border-b border-gray-800">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
          <i className="fa-light fa-arrow-left" />
          Dashboard
        </Link>
        <h1 className="text-lg font-bold">All Notifications</h1>
        <div className="w-10" />
      </nav>

      <main className="pt-24 px-6 pb-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
          {/* General / Mentions column */}
          <div className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
            <div className="px-4 py-3.5 border-b border-gray-800">
              <h2 className="text-sm font-semibold text-gray-300">General</h2>
              <p className="text-[10px] text-gray-600 mt-0.5">Mentions &amp; system updates</p>
            </div>
            <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto">
              {generalItems.length === 0 ? (
                <p className="text-xs text-gray-600 text-center py-6">No notifications</p>
              ) : (
                generalItems.map((item, i) => (
                  <NotificationItem key={`gen-${item.elementKey}-${i}`} item={item} onClick={handleClick} />
                ))
              )}
            </div>
          </div>

          {/* Per-course columns */}
          {coursesWithSteps.map((cws) => {
            const group = byCourse[cws.courseId]
            return (
              <div key={cws.courseId} className="rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden">
                <div className="px-4 py-3.5 border-b border-gray-800">
                  <h2 className="text-sm font-semibold" style={{ color: group.courseColor }}>
                    {group.courseName}
                  </h2>
                  <p className="text-[10px] text-gray-600 mt-0.5">{group.items.length} discussion{group.items.length !== 1 ? 's' : ''}</p>
                </div>
                <div className="p-3 space-y-1 max-h-[60vh] overflow-y-auto">
                  {group.items.length === 0 ? (
                    <p className="text-xs text-gray-600 text-center py-6">No activity</p>
                  ) : (
                    group.items.map((item, i) => (
                      <NotificationItem key={`${cws.courseId}-${item.elementKey}-${i}`} item={item} onClick={handleClick} />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
