import db from '../database/db.json'
import courseMath from '../database/course-math.json'
import courseScience from '../database/course-science.json'
import courseEnglish from '../database/course-english.json'
import courseSocialStudies from '../database/course-social-studies.json'

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
  return db.courses
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
  const entry = db.courses.find((c) => c.courseId === courseId)
  if (!entry) return null
  const progress = computeProgress(entry.completedLessons, course)
  return {
    ...course,
    ...entry,
    progress,
  }
}
