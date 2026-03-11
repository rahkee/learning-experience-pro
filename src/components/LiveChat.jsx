import { useState, useEffect, useRef, useCallback } from 'react'
import { seedLiveChat, getThread, addComment } from '../data/discussions.js'
import { getUserById, getDisplayName, generateFakeReply } from '../data/fakeUsers.js'
import CommentInput from './CommentInput.jsx'
import RenderText from './RenderText.jsx'
import RoleBadge from './shared/RoleBadge.jsx'
import UserAvatar from './shared/UserAvatar.jsx'

export default function LiveChat({ elementKey, lessonTitle, courseColor }) {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])
  const scrollRef = useRef(null)

  useEffect(() => {
    seedLiveChat(elementKey, lessonTitle)
    refresh()
  }, [elementKey, lessonTitle, refresh])

  const thread = getThread(elementKey)
  void version

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [version, thread.comments.length])

  const handleSend = useCallback(
    (text) => {
      addComment(elementKey, text)
      refresh()
      generateFakeReply(elementKey, text).then(() => refresh())
    },
    [elementKey, refresh]
  )

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-gray-800 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-sm font-medium text-gray-300">Live Discussion</span>
        <span className="text-xs text-gray-600 ml-auto">{thread.comments.length} messages</span>
      </div>

      <div ref={scrollRef} className="h-64 overflow-y-auto px-4 py-3 space-y-2.5">
        {thread.comments.map((msg) => {
          const user = getUserById(msg.userId)
          return (
            <div key={msg.id} className="flex gap-2 items-start">
              <UserAvatar user={user} size="md" className="mt-0.5" />
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5">
                  <span className="text-xs font-semibold" style={{ color: user?.color ?? '#9ca3af' }}>
                    {getDisplayName(user)}
                  </span>
                  <RoleBadge role={user?.role} />
                </span>
                <p className="text-sm text-gray-300 break-words">
                  <RenderText text={msg.text} />
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="px-4 py-3 border-t border-gray-800">
        <CommentInput
          onSubmit={handleSend}
          placeholder="Say something..."
          courseColor={courseColor}
        />
      </div>
    </div>
  )
}
