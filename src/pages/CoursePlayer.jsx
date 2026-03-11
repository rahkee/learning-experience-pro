import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { getCourseWithProgress, flattenCoursePages } from '../data/courses.js'
import { getStudentProgress, saveProgress } from '../data/progress.js'
import LiveChat from '../components/LiveChat.jsx'
import ThreadableContent from '../components/ThreadableContent.jsx'
import ChatSidebar from '../components/ChatSidebar.jsx'
import NotificationBell from '../components/NotificationBell.jsx'
import { getUnreadCount } from '../data/discussions.js'

export default function CoursePlayer() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const course = getCourseWithProgress(courseId)
  const steps = course ? flattenCoursePages(course) : []

  const resolveStartIndex = useCallback(() => {
    if (steps.length === 0) return 0
    const incoming = location.state?.stepIndex
    if (typeof incoming === 'number' && incoming >= 0 && incoming < steps.length) return incoming
    const progress = getStudentProgress(courseId)
    if (!progress) return 0
    const idx = steps.findIndex(
      (s) => s.lessonId === progress.currentLessonId && s.pageIndex === (progress.currentPage ?? 0)
    )
    return idx >= 0 ? idx : 0
  }, [courseId, steps, location.state])

  const [currentIndex, setCurrentIndex] = useState(resolveStartIndex)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [answerLocked, setAnswerLocked] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const incoming = location.state?.stepIndex
    if (typeof incoming === 'number' && incoming >= 0 && incoming < steps.length) {
      setCurrentIndex(incoming)
    }
  }, [location.state, steps.length])

  useEffect(() => {
    window.scrollTo(0, 0)
    setSelectedAnswer(null)
    setAnswerLocked(false)
  }, [currentIndex])

  if (!course || steps.length === 0) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-semibold">Course not found</h1>
        <Link to="/" className="text-indigo-400 hover:text-indigo-300 underline">
          Back to dashboard
        </Link>
      </div>
    )
  }

  const step = steps[currentIndex]
  const { page, unitTitle, lessonTitle } = step
  const isFirst = currentIndex === 0
  const isLast = currentIndex === steps.length - 1

  const persistPosition = (index) => {
    const s = steps[index]
    saveProgress(courseId, {
      currentLessonId: s.lessonId,
      currentPage: s.pageIndex,
    })
  }

  const markLessonCompleteIfNeeded = (fromIndex) => {
    const fromStep = steps[fromIndex]
    const lessonPages = steps.filter((s) => s.lessonId === fromStep.lessonId)
    const isLastPageOfLesson = fromStep.pageIndex === lessonPages[lessonPages.length - 1].pageIndex

    if (isLastPageOfLesson) {
      const progress = getStudentProgress(courseId)
      const completed = new Set(progress?.completedLessons ?? [])
      if (!completed.has(fromStep.lessonId)) {
        completed.add(fromStep.lessonId)
        saveProgress(courseId, { completedLessons: [...completed] })
      }
    }
  }

  const handlePrev = () => {
    if (isFirst) return
    const newIndex = currentIndex - 1
    setCurrentIndex(newIndex)
    persistPosition(newIndex)
  }

  const handleNext = () => {
    if (isLast) {
      markLessonCompleteIfNeeded(currentIndex)
      navigate(`/course/${courseId}/complete`)
      return
    }
    markLessonCompleteIfNeeded(currentIndex)
    const newIndex = currentIndex + 1
    setCurrentIndex(newIndex)
    persistPosition(newIndex)
  }

  const handleQuizAnswer = (option) => {
    if (answerLocked) return
    setSelectedAnswer(option)
    setAnswerLocked(true)

    const isCorrect = option === page.question?.answer
    const progress = getStudentProgress(courseId)
    const scores = { ...(progress?.quizScores ?? {}) }
    scores[step.lessonId] = { selected: option, correct: isCorrect }
    saveProgress(courseId, { quizScores: scores })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      <header
        className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-4 animate-fade"
        style={{ '--course-color': course.color ?? '#6366f1', '--delay': '0ms' }}
      >
        <Link
          to={`/course/${courseId}`}
          className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center border border-gray-700 hover:border-gray-500 transition-colors"
          aria-label="Back to course"
        >
          <i className="fa-light fa-xmark text-sm" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate" style={{ color: course.color }}>
            {course.name}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {unitTitle} &middot; {lessonTitle} &middot; Page {step.pageIndex + 1}
          </p>
        </div>
        <span className="text-xs text-gray-600 shrink-0 mr-1">
          {currentIndex + 1} / {steps.length}
        </span>
        <NotificationBell />
      </header>

      <main key={currentIndex} className="flex-1 overflow-y-auto px-4 py-8 max-w-3xl mx-auto w-full pr-14">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 animate-in" style={{ '--delay': '0ms' }}>{page.title}</h1>

        {page.type === 'intro' && page.video && (
          <>
            <div className="animate-in" style={{ '--delay': '80ms' }}>
              <ThreadableContent
                elementKey={`${courseId}:${step.lessonId}:${step.pageIndex}:video:0`}
                courseColor={course.color}
              >
                <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-black">
                  <iframe
                    src={page.video.url}
                    title={page.video.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </ThreadableContent>
            </div>
            <div className="mb-8 animate-in" style={{ '--delay': '160ms' }}>
              <LiveChat
                elementKey={`${courseId}:${step.lessonId}:${step.pageIndex}:livechat:0`}
                lessonTitle={lessonTitle}
                courseColor={course.color}
              />
            </div>
          </>
        )}

        {page.sections?.map((section, i) => {
          const sectionBase = page.type === 'intro' ? 240 + i * 120 : 80 + i * 120
          return (
            <div key={i} className="mb-6">
              <h2 className="text-lg font-semibold mb-2 text-gray-200 animate-in" style={{ '--delay': `${sectionBase}ms` }}>{section.heading}</h2>
              {section.body?.map((paragraph, j) => (
                <div key={j} className="animate-in" style={{ '--delay': `${sectionBase + 60 + j * 50}ms` }}>
                  <ThreadableContent
                    elementKey={`${courseId}:${step.lessonId}:${step.pageIndex}:section:${i}:body:${j}`}
                    courseColor={course.color}
                  >
                    <p className="text-gray-400 leading-relaxed mb-3">
                      {paragraph}
                    </p>
                  </ThreadableContent>
                </div>
              ))}
            </div>
          )
        })}

        {page.type === 'quiz' && page.question && (() => {
          const quizBase = 80 + (page.sections?.length ?? 0) * 120
          return (
            <div className="mt-8 p-6 rounded-xl bg-gray-900 border border-gray-800 animate-in" style={{ '--delay': `${quizBase}ms` }}>
              <h3 className="text-lg font-semibold mb-4">{page.question.text}</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {page.question.options?.map((option, oi) => {
                  const isCorrect = option === page.question.answer
                  let optionClasses =
                    'px-4 py-3 rounded-lg border text-left transition-colors font-medium animate-in '
                  if (!answerLocked) {
                    optionClasses +=
                      'border-gray-700 hover:border-gray-500 hover:bg-gray-800 cursor-pointer'
                  } else if (selectedAnswer === option) {
                    optionClasses += isCorrect
                      ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                      : 'border-red-500 bg-red-500/20 text-red-300'
                  } else if (isCorrect) {
                    optionClasses += 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400'
                  } else {
                    optionClasses += 'border-gray-800 text-gray-600'
                  }

                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleQuizAnswer(option)}
                      disabled={answerLocked}
                      className={optionClasses}
                      style={{ '--delay': `${quizBase + 60 + oi * 50}ms` }}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>
              {answerLocked && (
                <p className={`mt-4 font-medium ${selectedAnswer === page.question.answer ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedAnswer === page.question.answer
                    ? 'Correct! Great job!'
                    : `Not quite — the answer is ${page.question.answer}.`}
                </p>
              )}
            </div>
          )
        })()}
      </main>

      {/* Pagination bar */}
      <footer
        className="sticky bottom-0 z-20 bg-gray-950/90 backdrop-blur border-t border-gray-800 px-4 py-3 flex items-center justify-between gap-4 max-w-3xl mx-auto w-full animate-in"
        style={{ '--course-color': course.color ?? '#6366f1', '--delay': '100ms' }}
      >
        <button
          type="button"
          onClick={handlePrev}
          disabled={isFirst}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-sm font-medium transition-colors enabled:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <i className="fa-light fa-arrow-left" />
          Previous
        </button>

        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="relative w-10 h-10 rounded-full flex items-center justify-center border border-gray-700 hover:bg-gray-800 transition-colors"
          aria-label="My discussions"
        >
          <i className="fa-light fa-messages text-sm" />
          {getUnreadCount() > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
              {getUnreadCount() > 99 ? '99+' : getUnreadCount()}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white"
          style={{ backgroundColor: course.color ?? '#6366f1' }}
        >
          {isLast ? (
            <>
              Finish the Course
              <i className="fa-light fa-flag-checkered" />
            </>
          ) : (
            <>
              Next
              <i className="fa-light fa-arrow-right" />
            </>
          )}
        </button>
      </footer>

      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        courseId={courseId}
        courseColor={course.color}
        steps={steps}
        onNavigate={(stepIndex) => {
          setCurrentIndex(stepIndex)
          persistPosition(stepIndex)
        }}
      />
    </div>
  )
}
