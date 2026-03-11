import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCourseChatroomFeed, addChatroomMessage, addReply, getThread } from '../data/discussions.js'
import { getUserById, getDisplayName, generateFakeReply, getAllUsersWithStatus } from '../data/fakeUsers.js'
import { timeAgo } from '../utils/timeAgo.js'
import CommentInput from './CommentInput.jsx'
import RenderText from './RenderText.jsx'
import RoleBadge from './shared/RoleBadge.jsx'
import UserAvatar from './shared/UserAvatar.jsx'

function ChatBubble({ item }) {
  const user = getUserById(item.userId)
  return (
    <div className="flex gap-2.5 items-start">
      <UserAvatar user={user} className="mt-0.5" />
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

function DiscussionCard({ item, courseColor, onClick }) {
  const user = getUserById(item.userId)
  const replyCount = item.replies?.length ?? 0

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left ml-2 pl-3 border-l-2 rounded-r-lg bg-gray-800/30 py-3 pr-3 hover:bg-gray-800/50 transition-colors cursor-pointer"
      style={{ borderColor: courseColor }}
    >
      <div className="text-[11px] text-gray-500 mb-1.5">
        <span style={{ color: user?.color }}>{getDisplayName(user)}</span>
        {' commented on '}
        <span className="text-gray-400 font-medium">{item.lessonTitle || 'a lesson'}</span>
      </div>

      {item.contentSnippet && (
        <div className="mb-2 px-2.5 py-2 rounded bg-gray-900/60 border border-gray-700/50 text-sm text-gray-400">
          {item.contentSnippet}
        </div>
      )}

      <div className="flex gap-2.5 items-start">
        <UserAvatar user={user} className="mt-0.5" />
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
          <span className="text-xs text-gray-500 mt-1.5 inline-block">
            {replyCount > 0 ? `${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}` : 'Reply'}
            <i className="fa-light fa-chevron-right ml-1 text-[10px]" />
          </span>
        </div>
      </div>
    </button>
  )
}

function ThreadPanel({ item, courseColor, onClose, onReplySubmit, onGoToLesson }) {
  const thread = getThread(item.elementKey)
  const comment = thread.comments.find((c) => c.id === item.commentId)
  const panelRef = useRef(null)

  useEffect(() => {
    if (panelRef.current) {
      panelRef.current.scrollTop = panelRef.current.scrollHeight
    }
  }, [comment?.replies?.length])

  if (!comment) return null

  const user = getUserById(comment.userId)

  return (
    <div className="border-t border-gray-700 bg-gray-900/80 flex flex-col" style={{ maxHeight: '50%' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs text-gray-400 font-medium truncate">
            <i className="fa-light fa-message-lines mr-1.5" />
            Thread in "{item.lessonTitle || 'lesson'}"
          </span>
          {item.stepIndex >= 0 && (
            <button
              type="button"
              onClick={onGoToLesson}
              className="text-xs font-medium shrink-0 hover:underline transition-colors"
              style={{ color: courseColor }}
            >
              View in lesson <i className="fa-light fa-arrow-right ml-0.5 text-[10px]" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors shrink-0 ml-3"
        >
          <i className="fa-light fa-xmark mr-1" />
          Back to chat
        </button>
      </div>

      <div ref={panelRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {item.contentSnippet && (
          <div className="px-3 py-2 rounded bg-gray-800/60 border border-gray-700/50 text-sm text-gray-400">
            {item.contentSnippet}
          </div>
        )}

        <div className="flex gap-2.5 items-start">
          <UserAvatar user={user} className="mt-0.5" />
          <div className="min-w-0">
            <div className="inline-flex items-center gap-1.5">
              <span className="text-sm font-semibold" style={{ color: user?.color }}>
                {getDisplayName(user)}
              </span>
              <RoleBadge role={user?.role} />
              <span className="text-[11px] text-gray-600">{timeAgo(comment.timestamp)}</span>
            </div>
            <p className="text-sm text-gray-300 break-words">
              <RenderText text={comment.text} />
            </p>
          </div>
        </div>

        {(comment.replies ?? []).length > 0 && (
          <div className="ml-7 pl-3 border-l border-gray-700 space-y-2.5">
            {comment.replies.map((r) => {
              const rUser = getUserById(r.userId)
              return (
                <div key={r.id} className="flex gap-2 items-start">
                  <UserAvatar user={rUser} size="md" className="mt-0.5" />
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="text-sm font-semibold" style={{ color: rUser?.color }}>
                        {getDisplayName(rUser)}
                      </span>
                      <RoleBadge role={rUser?.role} />
                      <span className="text-[11px] text-gray-600">{timeAgo(r.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-400 break-words">
                      <RenderText text={r.text} />
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="px-4 py-3 border-t border-gray-800 shrink-0">
        <CommentInput
          onSubmit={(text) => onReplySubmit(item.elementKey, item.commentId, text)}
          placeholder="Reply to thread..."
          courseColor={courseColor}
        />
      </div>
    </div>
  )
}

export default function CourseChatroom({ courseId, courseColor, steps }) {
  const navigate = useNavigate()
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const scrollRef = useRef(null)
  const [usersWithStatus, setUsersWithStatus] = useState(() => getAllUsersWithStatus())
  const [selectedThread, setSelectedThread] = useState(null)

  const feed = getCourseChatroomFeed(courseId, steps)
  void version

  useEffect(() => {
    const id = setInterval(() => {
      refresh()
      setUsersWithStatus(getAllUsersWithStatus())
    }, 5000)
    return () => clearInterval(id)
  }, [refresh])

  useEffect(() => {
    if (scrollRef.current && !selectedThread) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [feed.length, selectedThread])

  const handleSend = useCallback(
    (text) => {
      addChatroomMessage(courseId, text)
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

  const handleDiscussionClick = useCallback((item) => {
    setSelectedThread(item)
  }, [])

  return (
    <div className="max-w-3xl mx-auto flex flex-col" style={{ height: 'calc(100vh - 20rem)' }}>
      <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-800 animate-fade" style={{ '--delay': '0ms' }}>
        {usersWithStatus.map((u, ui) => (
          <div key={u.id} className="relative shrink-0 animate-in" style={{ '--delay': `${ui * 40}ms` }}>
            <UserAvatar user={u} size="lg" className={`transition-opacity ${u.online ? '' : 'opacity-40'}`} />
            {u.online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-gray-950" />
            )}
          </div>
        ))}
        <span className="text-xs text-gray-500 ml-auto animate-fade" style={{ '--delay': '300ms' }}>
          {usersWithStatus.filter((u) => u.online).length} online
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {feed.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-12 animate-fade" style={{ '--delay': '200ms' }}>
            No activity yet. Start the conversation!
          </div>
        ) : (
          feed.map((item, fi) =>
            item.type === 'chat' ? (
              <div key={item.id} className="animate-in" style={{ '--delay': `${Math.min(fi * 40, 600)}ms` }}>
                <ChatBubble item={item} />
              </div>
            ) : (
              <div key={item.id} className="animate-in" style={{ '--delay': `${Math.min(fi * 40, 600)}ms` }}>
                <DiscussionCard
                  item={item}
                  courseColor={courseColor}
                  onClick={() => handleDiscussionClick(item)}
                />
              </div>
            )
          )
        )}
      </div>

      {selectedThread ? (
        <ThreadPanel
          item={selectedThread}
          courseColor={courseColor}
          onClose={() => setSelectedThread(null)}
          onReplySubmit={handleReply}
          onGoToLesson={() => {
            if (selectedThread.stepIndex >= 0) {
              navigate(`/play/${courseId}`, { state: { stepIndex: selectedThread.stepIndex } })
            }
          }}
        />
      ) : (
        <div className="px-4 py-3 border-t border-gray-800 animate-in" style={{ '--delay': '300ms' }}>
          <CommentInput
            onSubmit={handleSend}
            placeholder="Say something in the chatroom..."
            courseColor={courseColor}
          />
        </div>
      )}
    </div>
  )
}
