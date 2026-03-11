import { useState, useCallback } from 'react'
import { getThread, addComment, addReply } from '../data/discussions.js'
import { getUserById, getInitials, getDisplayName, currentUserId, generateFakeReply } from '../data/fakeUsers.js'
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

function CommentItem({ comment, elementKey, courseColor, onRefresh }) {
  const [showReplies, setShowReplies] = useState(false)
  const user = getUserById(comment.userId)

  const handleReply = useCallback(
    (text) => {
      const reply = addReply(elementKey, comment.id, text)
      onRefresh()
      if (reply) {
        generateFakeReply(elementKey, text, comment.id).then(() => onRefresh())
      }
    },
    [elementKey, comment.id, onRefresh]
  )

  return (
    <div className="flex gap-2.5">
      <span
        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: (user?.color ?? '#6366f1') + '33', color: user?.color ?? '#6366f1' }}
      >
        {getInitials(user)}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-200">{getDisplayName(user)}</span>
          <RoleBadge role={user?.role} />
          <span className="text-[11px] text-gray-600">{timeAgo(comment.timestamp)}</span>
        </div>
        <p className="text-sm text-gray-400 mt-0.5 break-words">
          <RenderText text={comment.text} />
        </p>
        <button
          type="button"
          onClick={() => setShowReplies(!showReplies)}
          className="text-xs text-gray-500 hover:text-gray-300 mt-1 transition-colors"
        >
          {showReplies ? 'Hide replies' : `Reply${comment.replies.length > 0 ? ` (${comment.replies.length})` : ''}`}
        </button>

        {showReplies && (
          <div className="mt-2 ml-2 pl-3 border-l border-gray-800 space-y-3">
            {comment.replies.map((reply) => {
              const rUser = getUserById(reply.userId)
              return (
                <div key={reply.id} className="flex gap-2.5">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                    style={{ backgroundColor: (rUser?.color ?? '#6366f1') + '33', color: rUser?.color ?? '#6366f1' }}
                  >
                    {getInitials(rUser)}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-300">{getDisplayName(rUser)}</span>
                      <RoleBadge role={rUser?.role} />
                      <span className="text-[11px] text-gray-600">{timeAgo(reply.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5 break-words">
                      <RenderText text={reply.text} />
                    </p>
                  </div>
                </div>
              )
            })}
            <CommentInput
              onSubmit={handleReply}
              placeholder="Write a reply..."
              courseColor={courseColor}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function DiscussionThread({ elementKey, courseColor }) {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  const thread = getThread(elementKey)
  void version

  const handleNewComment = useCallback(
    (text) => {
      addComment(elementKey, text)
      refresh()
      generateFakeReply(elementKey, text).then(() => refresh())
    },
    [elementKey, refresh]
  )

  return (
    <div className="space-y-4">
      {thread.comments.length > 0 && (
        <div className="space-y-4">
          {thread.comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              elementKey={elementKey}
              courseColor={courseColor}
              onRefresh={refresh}
            />
          ))}
        </div>
      )}
      <CommentInput
        onSubmit={handleNewComment}
        placeholder="Start a discussion..."
        courseColor={courseColor}
      />
    </div>
  )
}
