import db from '../database/db.json'
import courseMath from '../database/course-math.json'
import courseScience from '../database/course-science.json'
import courseEnglish from '../database/course-english.json'
import courseSocialStudies from '../database/course-social-studies.json'
import { getCoursesForUI } from './progress.js'

const courseById = {
  math: courseMath,
  science: courseScience,
  english: courseEnglish,
  'social-studies': courseSocialStudies,
}

function getTotalLessons(course) {
  if (!course?.units) return 0
  return course.units.reduce((sum, unit) => sum + (unit.lessons?.length ?? 0), 0)
}

function computeProgress(completedLessons, course) {
  const total = getTotalLessons(course)
  if (total === 0) return 0
  const completed = Array.isArray(completedLessons) ? completedLessons.length : 0
  return Math.round((completed / total) * 100)
}

export function getStudent() {
  return db.student
}

export function getAllCoursesWithProgress() {
  const courses = getCoursesForUI()
  return courses
    .filter((entry) => courseById[entry.courseId])
    .map((entry) => {
      const course = courseById[entry.courseId]
      const progress = computeProgress(entry.completedLessons, course)
      return {
        ...course,
        ...entry,
        progress,
      }
    })
}

export function getCourseWithProgress(courseId) {
  const course = courseById[courseId]
  if (!course) return null
  const courses = getCoursesForUI()
  const entry = courses.find((c) => c.courseId === courseId)
  if (!entry) return null
  const progress = computeProgress(entry.completedLessons, course)
  return {
    ...course,
    ...entry,
    progress,
  }
}

export function getCourseContent(courseId) {
  return courseById[courseId] ?? null
}

export function flattenCoursePages(course) {
  if (!course?.units) return []
  const steps = []
  course.units.forEach((unit, unitIndex) => {
    ;(unit.lessons ?? []).forEach((lesson, lessonIndex) => {
      ;(lesson.pages ?? []).forEach((page, pageIndex) => {
        steps.push({
          unitIndex,
          lessonIndex,
          pageIndex,
          unitId: unit.id,
          lessonId: lesson.id,
          unitTitle: unit.title,
          lessonTitle: lesson.title,
          page,
        })
      })
    })
  })
  return steps
}
