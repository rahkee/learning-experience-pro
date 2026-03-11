import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllStudentThreadsGlobal, markThreadRead, getThread, addReply } from '../data/discussions.js'
import { getAllCoursesWithProgress, flattenCoursePages } from '../data/courses.js'
import { getUserById, getInitials, getDisplayName, generateFakeReply } from '../data/fakeUsers.js'
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

export default function NotificationPanel({ onClose }) {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  void version

  const courses = getAllCoursesWithProgress()
  const coursesWithSteps = courses.map((c) => ({
    courseId: c.id ?? c.courseId,
    courseName: c.name,
    courseColor: c.color,
    steps: flattenCoursePages(c),
  }))

  const allThreads = getAllStudentThreadsGlobal(coursesWithSteps)

  const grouped = {}
  for (const t of allThreads) {
    const key = t.courseId
    if (!grouped[key]) {
      grouped[key] = { courseName: t.courseName, courseColor: t.courseColor, courseId: t.courseId, threads: [] }
    }
    grouped[key].threads.push(t)
  }

  const handleClick = (t) => {
    markThreadRead(t.elementKey)
    refresh()

    const parts = t.elementKey.split(':')
    const lessonId = parts[1]
    const pageIndex = parseInt(parts[2], 10)

    saveProgress(t.courseId, { currentLessonId: lessonId, currentPage: pageIndex })
    onClose()
    navigate(`/play/${t.courseId}`)
  }

  const hasAny = allThreads.length > 0

  return (
    <div className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-y-auto rounded-xl bg-gray-900 border border-gray-800 shadow-2xl z-50">
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {hasAny && (
          <button
            type="button"
            onClick={() => {
              for (const t of allThreads) markThreadRead(t.elementKey)
              refresh()
            }}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {!hasAny ? (
        <div className="px-4 py-8 text-center text-gray-500 text-sm">
          No discussions yet.
        </div>
      ) : (
        Object.values(grouped).map((group) => (
          <div key={group.courseId}>
            <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: group.courseColor }}>
              {group.courseName}
            </div>
            {group.threads.map((t) => {
              const thread = getThread(t.elementKey)
              const lastComment = thread.comments[thread.comments.length - 1]
              const lastReply = lastComment?.replies?.[lastComment.replies.length - 1]
              const lastMsg = lastReply ?? lastComment
              const user = lastMsg ? getUserById(lastMsg.userId) : null

              return (
                <button
                  key={t.elementKey}
                  type="button"
                  onClick={() => handleClick(t)}
                  className="w-full text-left px-4 py-2.5 hover:bg-gray-800/50 transition-colors flex gap-2.5 items-start"
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
                    <p className={`text-xs truncate ${t.unread ? 'font-bold text-white' : 'text-gray-300'}`}>
                      {user ? getDisplayName(user) : 'Unknown'} in {t.lessonTitle}
                    </p>
                    <p className="text-[11px] text-gray-500 truncate mt-0.5">
                      <RenderText text={t.latestText} />
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
