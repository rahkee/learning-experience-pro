import db from '../database/db.json'
import courseById from './courseMap.js'

const STORAGE_KEY = 'student-progress'

function getDefaultCourses() {
  return db.courses.map((c) => ({ ...c }))
}

function loadProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) return JSON.parse(saved)
  } catch {
    /* ignore corrupt data */
  }
  return null
}

function persist(courses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

function getCourses() {
  return loadProgress() ?? getDefaultCourses()
}

export function getStudentProgress(courseId) {
  const courses = getCourses()
  const entry = courses.find((c) => c.courseId === courseId)
  if (!entry) return null
  return {
    currentLessonId: entry.currentLessonId,
    currentPage: entry.currentPage ?? 0,
    completedLessons: entry.completedLessons ?? [],
    quizScores: entry.quizScores ?? {},
  }
}

export function saveProgress(courseId, updates) {
  const courses = getCourses()
  const idx = courses.findIndex((c) => c.courseId === courseId)
  if (idx === -1) return
  courses[idx] = { ...courses[idx], ...updates }
  persist(courses)
}

export function markCourseComplete(courseId) {
  const course = courseById[courseId]
  if (!course) return
  const allLessonIds = course.units.flatMap((u) =>
    (u.lessons ?? []).map((l) => l.id)
  )
  const courses = getCourses()
  const idx = courses.findIndex((c) => c.courseId === courseId)
  if (idx === -1) return
  courses[idx].completedLessons = allLessonIds
  persist(courses)
}

export function getGraduationProgress() {
  const courses = getCourses()
  const total = courses.length
  let completed = 0
  for (const entry of courses) {
    const course = courseById[entry.courseId]
    if (!course) continue
    const totalLessons = course.units.reduce(
      (sum, u) => sum + (u.lessons?.length ?? 0),
      0
    )
    if (totalLessons > 0 && (entry.completedLessons?.length ?? 0) >= totalLessons) {
      completed++
    }
  }
  return { completed, total }
}

export function getCoursesForUI() {
  return getCourses()
}
