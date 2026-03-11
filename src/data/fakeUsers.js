import { addReply, addComment } from './discussions.js'

const users = [
  { id: 'student-001', firstName: 'Alex', lastName: 'Morgan', role: 'student', color: '#6366f1' },
  { id: 'student-002', firstName: 'Jamie', lastName: 'Chen', role: 'student', color: '#f59e0b' },
  { id: 'student-003', firstName: 'Sam', lastName: 'Rivera', role: 'student', color: '#10b981' },
  { id: 'student-004', firstName: 'Mia', lastName: 'Thompson', role: 'student', color: '#ec4899' },
  { id: 'teacher-001', firstName: 'Ms.', lastName: 'Taylor', role: 'teacher', color: '#ef4444' },
  { id: 'mod-001', firstName: 'Mr.', lastName: 'Brooks', role: 'moderator', color: '#8b5cf6' },
]

const userMap = Object.fromEntries(users.map((u) => [u.id, u]))

export const currentUserId = 'student-001'

export function getUserById(id) {
  return userMap[id] ?? null
}

export function getInitials(user) {
  if (!user) return '?'
  return (user.firstName.charAt(0) + user.lastName.charAt(0)).toUpperCase()
}

export function getAllMentionableUsers() {
  return users.filter((u) => u.id !== currentUserId)
}

export function getDisplayName(user) {
  if (!user) return 'Unknown'
  return `${user.firstName} ${user.lastName}`
}

const teacherReplies = [
  "That's a great observation! Keep thinking along those lines and you'll master this in no time.",
  "Wonderful question! Let me know if you'd like me to explain it a different way.",
  "I love seeing this kind of curiosity! You're really getting the hang of it.",
  "Excellent point! This is exactly the kind of thinking that helps you learn faster.",
  "Good work! Remember, practice makes perfect so keep at it.",
  "That's right! You're making awesome progress, keep it up!",
  "Great job thinking about it that way. Try a few more examples and you'll be an expert!",
  "I'm so proud of how hard you're working on this. Don't give up!",
]

const studentReplies = [
  "Oh cool, I was wondering about that too! Thanks for bringing it up.",
  "I think I get it now, this actually makes a lot of sense when you look at it that way.",
  "Haha nice, I had the same question yesterday. Glad someone asked!",
  "That's really helpful, I'm going to try that method on the next problem.",
  "Wait, so does that mean we can use this trick for other problems too?",
  "This is way easier than I thought! I was overthinking it the whole time.",
  "Same here! I got confused at first but now it totally clicks.",
  "Ooh that's a good point, I didn't think about it like that before.",
]

const modReplies = [
  "Great discussion everyone! Remember to stay on topic and be respectful.",
  "Loving the energy in here! Keep the questions coming, that's how we learn.",
  "Just a friendly reminder to check the lesson notes if you need extra help!",
  "Nice teamwork everyone! Helping each other out is what makes this class awesome.",
]

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function parseMentions(text) {
  const mentioned = []
  const mentionRegex = /@(\w+)/g
  let match
  while ((match = mentionRegex.exec(text)) !== null) {
    const name = match[1].toLowerCase()
    const user = users.find(
      (u) =>
        u.id !== currentUserId &&
        (u.firstName.toLowerCase() === name ||
          `${u.firstName}${u.lastName}`.toLowerCase() === name ||
          `${u.firstName.toLowerCase()}.${u.lastName.toLowerCase()}` === name)
    )
    if (user) mentioned.push(user)
  }
  return mentioned
}

function getRepliesForRole(role) {
  if (role === 'teacher') return teacherReplies
  if (role === 'moderator') return modReplies
  return studentReplies
}

function randomDelay(min = 1000, max = 3000) {
  return Math.floor(Math.random() * (max - min)) + min
}

export function generateFakeReply(elementKey, commentText, parentCommentId) {
  const mentioned = parseMentions(commentText)

  const responder =
    mentioned.length > 0
      ? mentioned[0]
      : pickRandom(users.filter((u) => u.id !== currentUserId))

  const replyText = pickRandom(getRepliesForRole(responder.role))

  return new Promise((resolve) => {
    setTimeout(() => {
      let result
      if (parentCommentId) {
        result = addReply(elementKey, parentCommentId, replyText, responder.id)
      } else {
        result = addComment(elementKey, replyText, responder.id)
      }
      resolve(result)
    }, randomDelay())
  })
}
