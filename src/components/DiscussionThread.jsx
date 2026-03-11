import { useState, useCallback } from 'react'
import { getThread, addComment, addReply } from '../data/discussions.js'
import { getUserById, getDisplayName, currentUserId, generateFakeReply } from '../data/fakeUsers.js'
import { timeAgo } from '../utils/timeAgo.js'
import CommentInput from './CommentInput.jsx'
import RenderText from './RenderText.jsx'
import RoleBadge from './shared/RoleBadge.jsx'
import UserAvatar from './shared/UserAvatar.jsx'

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
      <UserAvatar user={user} className="mt-0.5" />
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
                  <UserAvatar user={rUser} className="mt-0.5" />
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
          {thread.comments.map((comment, i) => (
            <div key={comment.id} className="animate-in" style={{ '--delay': `${i * 60}ms` }}>
              <CommentItem
                comment={comment}
                elementKey={elementKey}
                courseColor={courseColor}
                onRefresh={refresh}
              />
            </div>
          ))}
        </div>
      )}
      <div className="animate-in" style={{ '--delay': `${thread.comments.length * 60 + 60}ms` }}>
        <CommentInput
          onSubmit={handleNewComment}
          placeholder="Start a discussion..."
          courseColor={courseColor}
        />
      </div>
    </div>
  )
}
