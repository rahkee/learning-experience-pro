import { useState } from 'react'
import { getThread } from '../data/discussions.js'
import DiscussionThread from './DiscussionThread.jsx'

export default function ThreadableContent({ elementKey, courseColor, children }) {
  const [open, setOpen] = useState(false)
  const thread = getThread(elementKey)
  const count = thread.comments.length

  return (
    <div className="group/thread relative">
      <div className="relative">
        {children}
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={`absolute -right-10 top-1 w-7 h-7 rounded-full flex items-center justify-center text-xs transition-all ${
            open
              ? 'opacity-100 bg-gray-700 text-white'
              : count > 0
              ? 'opacity-70 hover:opacity-100 bg-gray-800 text-gray-400 hover:text-white'
              : 'opacity-0 group-hover/thread:opacity-70 hover:!opacity-100 bg-gray-800 text-gray-500 hover:text-white'
          }`}
          aria-label="Open discussion"
        >
          <i className="fa-solid fa-comment text-[10px]" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </div>

      {open && (
        <div className="mt-3 ml-2 pl-4 border-l-2 border-gray-800 pb-2 animate-in" style={{ '--delay': '0ms' }}>
          <DiscussionThread elementKey={elementKey} courseColor={courseColor} />
        </div>
      )}
    </div>
  )
}
