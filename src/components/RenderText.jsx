import { getAllMentionableUsers, getUserById, currentUserId } from '../data/fakeUsers.js'

const mentionableUsers = getAllMentionableUsers()
const currentUser = getUserById(currentUserId)

function findUserByFirstName(name) {
  const lower = name.toLowerCase()
  if (currentUser && currentUser.firstName.toLowerCase() === lower) return currentUser
  return mentionableUsers.find((u) => u.firstName.toLowerCase() === lower)
}

export default function RenderText({ text }) {
  if (!text) return null
  const parts = text.split(/(@\w+)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('@')) {
          const name = part.slice(1)
          const user = findUserByFirstName(name)
          if (user) {
            return (
              <span key={i} className="font-semibold" style={{ color: user.color }}>
                {part}
              </span>
            )
          }
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
