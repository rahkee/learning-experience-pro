const CURRENT_USER_ID = 'student-001'
const CURRENT_USER_FIRST_NAME = 'Alex'
const mentionPattern = new RegExp(`@${CURRENT_USER_FIRST_NAME}\\b`, 'i')

const STORAGE_KEY = 'discussions'
const READ_KEY = 'discussions-read'

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

function loadReadTimestamps() {
  try {
    const raw = localStorage.getItem(READ_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return {}
}

function saveReadTimestamps(data) {
  localStorage.setItem(READ_KEY, JSON.stringify(data))
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function getThread(elementKey) {
  const data = load()
  return data[elementKey] ?? { comments: [] }
}

export function addComment(elementKey, text, userId) {
  const data = load()
  if (!data[elementKey]) data[elementKey] = { comments: [] }
  const comment = {
    id: makeId(),
    userId: userId ?? CURRENT_USER_ID,
    text,
    timestamp: new Date().toISOString(),
    replies: [],
  }
  data[elementKey].comments.push(comment)
  save(data)
  return comment
}

export function addReply(elementKey, commentId, text, userId) {
  const data = load()
  const thread = data[elementKey]
  if (!thread) return null
  const comment = thread.comments.find((c) => c.id === commentId)
  if (!comment) return null
  const reply = {
    id: makeId(),
    userId: userId ?? CURRENT_USER_ID,
    text,
    timestamp: new Date().toISOString(),
  }
  comment.replies.push(reply)
  save(data)
  return reply
}

export function markThreadRead(elementKey) {
  const timestamps = loadReadTimestamps()
  timestamps[elementKey] = new Date().toISOString()
  saveReadTimestamps(timestamps)
}

export function isThreadUnread(elementKey) {
  const timestamps = loadReadTimestamps()
  const lastRead = timestamps[elementKey]
  const thread = getThread(elementKey)
  if (thread.comments.length === 0) return false

  const allMessages = []
  for (const c of thread.comments) {
    if (c.userId !== CURRENT_USER_ID) allMessages.push(c.timestamp)
    for (const r of c.replies ?? []) {
      if (r.userId !== CURRENT_USER_ID) allMessages.push(r.timestamp)
    }
  }
  if (allMessages.length === 0) return false
  if (!lastRead) return true

  return allMessages.some((ts) => ts > lastRead)
}

function getUnreadCountForThread(elementKey) {
  const timestamps = loadReadTimestamps()
  const lastRead = timestamps[elementKey]
  const thread = getThread(elementKey)
  let count = 0
  for (const c of thread.comments) {
    if (c.userId !== CURRENT_USER_ID && (!lastRead || c.timestamp > lastRead)) count++
    for (const r of c.replies ?? []) {
      if (r.userId !== CURRENT_USER_ID && (!lastRead || r.timestamp > lastRead)) count++
    }
  }
  return count
}

function userParticipatedIn(thread) {
  return thread.comments.some((c) => c.userId === CURRENT_USER_ID)
}

function threadMentionsUser(thread) {
  for (const c of thread.comments) {
    if (c.userId !== CURRENT_USER_ID && mentionPattern.test(c.text)) return true
    for (const r of c.replies ?? []) {
      if (r.userId !== CURRENT_USER_ID && mentionPattern.test(r.text)) return true
    }
  }
  return false
}

export function getUnreadCount() {
  const data = load()
  let total = 0
  for (const [key, thread] of Object.entries(data)) {
    if (thread.seeded) continue
    if (!userParticipatedIn(thread)) continue
    total += getUnreadCountForThread(key)
  }
  return total
}

export function getGlobalUnreadCount() {
  const data = load()
  let total = 0
  for (const [key, thread] of Object.entries(data)) {
    if (thread.seeded && !threadMentionsUser(thread)) continue
    if (userParticipatedIn(thread) || threadMentionsUser(thread)) {
      total += getUnreadCountForThread(key)
    }
  }
  return total
}

function getLastActivityTimestamp(thread) {
  let latest = ''
  for (const c of thread.comments) {
    if (c.timestamp > latest) latest = c.timestamp
    for (const r of c.replies ?? []) {
      if (r.timestamp > latest) latest = r.timestamp
    }
  }
  return latest
}

function getLatestMessage(thread) {
  let latest = null
  let latestTs = ''
  for (const c of thread.comments) {
    if (c.timestamp > latestTs) { latest = c; latestTs = c.timestamp }
    for (const r of c.replies ?? []) {
      if (r.timestamp > latestTs) { latest = r; latestTs = r.timestamp }
    }
  }
  return latest
}

export function getAllStudentThreads(courseId, steps) {
  const data = load()
  const threads = []

  for (const step of steps) {
    const keyPrefix = `${courseId}:${step.lessonId}:${step.pageIndex}:`
    for (const [key, thread] of Object.entries(data)) {
      if (!key.startsWith(keyPrefix)) continue
      if (thread.seeded) continue
      const hasStudentComment = thread.comments.some((c) => c.userId === CURRENT_USER_ID)
      if (!hasStudentComment) continue

      const allComments = thread.comments
      const latestMsg = getLatestMessage(thread)
      const latestText = latestMsg?.text ?? ''
      const totalReplies = allComments.reduce((sum, c) => sum + (c.replies?.length ?? 0), 0)

      threads.push({
        elementKey: key,
        unitTitle: step.unitTitle,
        lessonTitle: step.lessonTitle,
        lessonId: step.lessonId,
        pageIndex: step.pageIndex,
        latestText,
        latestUserId: latestMsg?.userId ?? null,
        lastActivityTimestamp: getLastActivityTimestamp(thread),
        commentCount: allComments.length + totalReplies,
        unread: isThreadUnread(key),
        stepIndex: steps.indexOf(step),
      })
    }
  }

  const seen = new Set()
  return threads.filter((t) => {
    if (seen.has(t.elementKey)) return false
    seen.add(t.elementKey)
    return true
  })
}

export function getAllStudentThreadsGlobal(coursesWithSteps) {
  const all = []
  for (const { courseId, courseName, courseColor, steps } of coursesWithSteps) {
    const threads = getAllStudentThreads(courseId, steps)
    for (const t of threads) {
      all.push({ ...t, courseId, courseName, courseColor })
    }
  }
  return all
}

export function getGlobalNotifications(coursesWithSteps) {
  const data = load()
  const byElement = new Map()

  for (const { courseId, courseName, courseColor, steps } of coursesWithSteps) {
    for (const step of steps) {
      const keyPrefix = `${courseId}:${step.lessonId}:${step.pageIndex}:`
      for (const [key, thread] of Object.entries(data)) {
        if (!key.startsWith(keyPrefix)) continue
        if (thread.seeded && !threadMentionsUser(thread)) continue

        const participated = userParticipatedIn(thread)
        const mentioned = threadMentionsUser(thread)
        if (!participated && !mentioned) continue

        const latestMsg = getLatestMessage(thread)
        const allComments = thread.comments
        const totalReplies = allComments.reduce((sum, c) => sum + (c.replies?.length ?? 0), 0)

        byElement.set(key, {
          type: mentioned ? 'mention' : 'thread',
          elementKey: key,
          courseId,
          courseName,
          courseColor,
          unitTitle: step.unitTitle,
          lessonTitle: step.lessonTitle,
          lessonId: step.lessonId,
          pageIndex: step.pageIndex,
          stepIndex: steps.indexOf(step),
          latestText: latestMsg?.text ?? '',
          latestUserId: latestMsg?.userId ?? null,
          lastActivityTimestamp: getLastActivityTimestamp(thread),
          commentCount: allComments.length + totalReplies,
          unread: isThreadUnread(key),
        })
      }
    }
  }

  const items = [...byElement.values()]
  items.sort((a, b) => (b.lastActivityTimestamp ?? '').localeCompare(a.lastActivityTimestamp ?? ''))
  return items
}

const liveChatTemplates = [
  { userId: 'teacher-001', text: (title) => `Welcome everyone! Today we're learning about ${title}. Let's have fun! 🎉` },
  { userId: 'student-002', text: () => "I'm so excited for this one! I've been looking forward to it all week!" },
  { userId: 'student-003', text: () => "Can someone remind me what we learned last time? I want to make sure I'm caught up." },
  { userId: 'teacher-001', text: () => "Great question Sam! We covered the basics last time. Today we're building on that." },
  { userId: 'student-004', text: () => "This video looks really cool! I love watching these before we start." },
  { userId: 'mod-001', text: () => "Hey everyone! Remember to take notes and ask questions if anything is confusing." },
  { userId: 'student-002', text: () => "Ooh I already have a question but I'll wait until after the video 😄" },
  { userId: 'teacher-001', text: () => "That's the spirit Jamie! Feel free to ask anytime though, that's what I'm here for." },
]

export function seedLiveChat(elementKey, lessonTitle) {
  const data = load()
  if (data[elementKey] && data[elementKey].comments.length > 0) return

  const baseTime = Date.now() - 600000
  data[elementKey] = {
    seeded: true,
    comments: liveChatTemplates.map((tpl, i) => ({
      id: makeId() + '-seed-' + i,
      userId: tpl.userId,
      text: typeof tpl.text === 'function' ? tpl.text(lessonTitle) : tpl.text,
      timestamp: new Date(baseTime + i * 45000).toISOString(),
      replies: [],
    })),
  }
  save(data)

  const timestamps = loadReadTimestamps()
  timestamps[elementKey] = new Date().toISOString()
  saveReadTimestamps(timestamps)
}
