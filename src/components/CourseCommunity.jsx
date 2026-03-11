import { useState, useEffect, useRef, useCallback } from 'react'
import { getCourseCommunityFeed, addCommunityMessage, addReply } from '../data/discussions.js'
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
    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium uppercase leading-none ${colors}`}>
      {role}
    </span>
  )
}

function ChatBubble({ item }) {
  const user = getUserById(item.userId)
  return (
    <div className="flex gap-2.5 items-start">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: (user?.color ?? '#6366f1') + '33', color: user?.color }}
      >
        {getInitials(user)}
      </span>
      <div className="min-w-0">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-sm font-semibold" style={{ color: user?.color ?? '#9ca3af' }}>
            {getDisplayName(user)}
          </span>
          <RoleBadge role={user?.role} />
          <span className="text-[11px] text-gray-600">{timeAgo(item.timestamp)}</span>
        </span>
        <p className="text-sm text-gray-300 break-words">
          <RenderText text={item.text} />
        </p>
      </div>
    </div>
  )
}

function DiscussionCard({ item, courseColor, onReply }) {
  const [showReplies, setShowReplies] = useState(false)
  const user = getUserById(item.userId)

  return (
    <div className="ml-2 pl-3 border-l-2 rounded-r-lg bg-gray-800/30 py-3 pr-3" style={{ borderColor: courseColor }}>
      <div className="text-[11px] text-gray-500 mb-1.5">
        <span style={{ color: user?.color }}>{getDisplayName(user)}</span>
        {' commented on '}
        <span className="text-gray-400 font-medium">{item.lessonTitle || 'a lesson'}</span>
      </div>
      <div className="flex gap-2.5 items-start">
        <span
          className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: (user?.color ?? '#6366f1') + '33', color: user?.color }}
        >
          {getInitials(user)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="inline-flex items-center gap-1.5">
            <span className="text-sm font-semibold" style={{ color: user?.color ?? '#9ca3af' }}>
              {getDisplayName(user)}
            </span>
            <RoleBadge role={user?.role} />
            <span className="text-[11px] text-gray-600">{timeAgo(item.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-300 break-words">
            <RenderText text={item.text} />
          </p>
          <button
            type="button"
            onClick={() => setShowReplies(!showReplies)}
            className="text-xs text-gray-500 hover:text-gray-300 mt-1.5 transition-colors"
          >
            {showReplies ? 'Hide replies' : `Reply${item.replies.length > 0 ? ` (${item.replies.length})` : ''}`}
          </button>

          {showReplies && (
            <div className="mt-2 pl-3 border-l border-gray-700 space-y-2.5">
              {item.replies.map((r) => {
                const rUser = getUserById(r.userId)
                return (
                  <div key={r.id} className="flex gap-2 items-start">
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                      style={{ backgroundColor: (rUser?.color ?? '#6366f1') + '33', color: rUser?.color }}
                    >
                      {getInitials(rUser)}
                    </span>
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-1.5">
                        <span className="text-sm font-semibold" style={{ color: rUser?.color }}>
                          {getDisplayName(rUser)}
                        </span>
                        <RoleBadge role={rUser?.role} />
                      </div>
                      <p className="text-sm text-gray-400 break-words">
                        <RenderText text={r.text} />
                      </p>
                    </div>
                  </div>
                )
              })}
              <CommentInput
                onSubmit={(text) => onReply(item.elementKey, item.commentId, text)}
                placeholder="Write a reply..."
                courseColor={courseColor}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CourseCommunity({ courseId, courseColor, steps }) {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const scrollRef = useRef(null)
  const [usersWithStatus, setUsersWithStatus] = useState(() => getAllUsersWithStatus())

  const feed = getCourseCommunityFeed(courseId, steps)
  void version

  useEffect(() => {
    const id = setInterval(() => {
      refresh()
      setUsersWithStatus(getAllUsersWithStatus())
    }, 3000)
    return () => clearInterval(id)
  }, [refresh])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [feed.length])

  const handleSend = useCallback(
    (text) => {
      addCommunityMessage(courseId, text)
      refresh()
      generateFakeReply(`${courseId}:community`, text).then(() => refresh())
    },
    [courseId, refresh]
  )

  const handleReply = useCallback(
    (elementKey, commentId, text) => {
      addReply(elementKey, commentId, text)
      refresh()
      generateFakeReply(elementKey, text, commentId).then(() => refresh())
    },
    [refresh]
  )

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 20rem)' }}>
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-800">
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
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-950" />
            )}
          </div>
        ))}
        <span className="text-xs text-gray-500 ml-auto">
          {usersWithStatus.filter((u) => u.online).length} online
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {feed.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-12">
            No activity yet. Start the conversation!
          </div>
        ) : (
          feed.map((item) =>
            item.type === 'chat' ? (
              <ChatBubble key={item.id} item={item} />
            ) : (
              <DiscussionCard
                key={item.id}
                item={item}
                courseColor={courseColor}
                onReply={handleReply}
              />
            )
          )
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-800">
        <CommentInput
          onSubmit={handleSend}
          placeholder="Say something to the community..."
          courseColor={courseColor}
        />
      </div>
    </div>
  )
}
