import { useEffect, useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourseWithProgress, flattenCoursePages } from '../data/courses.js'
import { markCourseComplete, getStudentProgress, getGraduationProgress } from '../data/progress.js'

function useCountUp(target, duration = 2000, delay = 300) {
  const [value, setValue] = useState(0)
  const raf = useRef(null)

  useEffect(() => {
    if (target === 0) return
    const timeout = setTimeout(() => {
      const start = performance.now()
      const tick = (now) => {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * target))
        if (progress < 1) {
          raf.current = requestAnimationFrame(tick)
        }
      }
      raf.current = requestAnimationFrame(tick)
    }, delay)

    return () => {
      clearTimeout(timeout)
      if (raf.current) cancelAnimationFrame(raf.current)
    }
  }, [target, duration, delay])

  return value
}

function AnimatedBar({ percent, delay = 300, thick = false, color }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(percent), delay)
    return () => clearTimeout(timeout)
  }, [percent, delay])

  return (
    <div className={`w-full rounded-full bg-gray-800 overflow-hidden ${thick ? 'h-6' : 'h-3'}`}>
      <div
        className="h-full rounded-full transition-all duration-[2000ms] ease-out"
        style={{ width: `${width}%`, backgroundColor: color }}
      />
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="flex flex-col items-center gap-2 p-5 rounded-xl bg-gray-900 border border-gray-800">
      <i className={`${icon} text-2xl`} style={{ color }} />
      <span className="text-2xl font-bold tabular-nums">{value}</span>
      <span className="text-gray-500 text-sm">{label}</span>
    </div>
  )
}

export default function CourseComplete() {
  const { courseId } = useParams()
  const [course, setCourse] = useState(null)
  const [stats, setStats] = useState({
    totalPages: 0,
    videoHours: 0,
    totalQuizzes: 0,
    correctQuizzes: 0,
    gradPercent: 0,
    gradCompleted: 0,
    gradTotal: 0,
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    markCourseComplete(courseId)

    const c = getCourseWithProgress(courseId)
    if (!c) return
    setCourse(c)

    const steps = flattenCoursePages(c)
    const totalPages = steps.length
    const introPages = steps.filter((s) => s.page.type === 'intro').length
    const videoHours = parseFloat(((introPages * 10) / 60).toFixed(1))

    const progress = getStudentProgress(courseId)
    const quizScores = progress?.quizScores ?? {}
    const totalQuizzes = steps.filter((s) => s.page.type === 'quiz').length
    const correctQuizzes = Object.values(quizScores).filter((q) => q.correct).length

    const grad = getGraduationProgress()
    const gradPercent = grad.total > 0 ? Math.round((grad.completed / grad.total) * 100) : 0

    setStats({
      totalPages,
      videoHours,
      totalQuizzes,
      correctQuizzes,
      gradPercent,
      gradCompleted: grad.completed,
      gradTotal: grad.total,
    })
    setReady(true)
  }, [courseId])

  const pagesCount = useCountUp(ready ? stats.totalPages : 0)
  const videoCount = useCountUp(ready ? Math.round(stats.videoHours * 10) : 0, 2000, 600)
  const quizCorrect = useCountUp(ready ? stats.correctQuizzes : 0, 1500, 900)

  if (!course || !ready) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  const color = course.color ?? '#6366f1'

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-2xl mx-auto w-full">
        {/* Hero */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden mb-6 shadow-lg">
          <img src={course.image} alt="" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Course Complete!</h1>
        <p className="text-gray-400 text-center mb-10">
          You finished <span style={{ color }} className="font-semibold">{course.name}</span>. Great work!
        </p>

        {/* Course progress bar */}
        <div className="w-full mb-10">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Course Progress</span>
            <span className="font-semibold" style={{ color }}>100%</span>
          </div>
          <AnimatedBar percent={100} color={color} />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full mb-12">
          <StatCard
            icon="fa-light fa-book-open"
            label="Pages Read"
            value={pagesCount}
            color={color}
          />
          <StatCard
            icon="fa-light fa-video"
            label="Video Hours"
            value={`${(videoCount / 10).toFixed(1)}`}
            color={color}
          />
          <StatCard
            icon="fa-light fa-circle-check"
            label="Quiz Answers"
            value={`${quizCorrect} / ${stats.totalQuizzes}`}
            color={color}
          />
        </div>

        {/* Graduation progress */}
        <div className="w-full mb-10">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-400">Your Path to Graduation</span>
            <span className="font-semibold" style={{ color }}>
              {stats.gradCompleted} / {stats.gradTotal} courses
            </span>
          </div>
          <AnimatedBar percent={stats.gradPercent} delay={1200} thick color={color} />
          <p className="text-gray-500 text-xs mt-2 text-center">
            {stats.gradPercent}% toward graduation
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Link
            to={`/course/${courseId}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-700 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <i className="fa-light fa-arrow-left" />
            Course Details
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors text-white"
            style={{ backgroundColor: color }}
          >
            <i className="fa-light fa-grid-2" />
            Back to Dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
