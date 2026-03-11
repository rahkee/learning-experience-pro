import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCourseWithProgress, flattenCoursePages } from '../data/courses.js'
import { saveProgress } from '../data/progress.js'
import { seedChatroomChat } from '../data/discussions.js'
import CourseChatroom from '../components/CourseChatroom.jsx'

export default function CourseDetails() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const course = getCourseWithProgress(courseId)
  const [selectedUnitId, setSelectedUnitId] = useState(null)
  const [tab, setTab] = useState('explore')
  const effectiveUnitId = selectedUnitId ?? course?.units?.[0]?.id ?? null
  const selectedUnit = course?.units?.find((u) => u.id === effectiveUnitId)
  const steps = course ? flattenCoursePages(course) : []

  useEffect(() => {
    if (course) seedChatroomChat(courseId, course.name, steps)
  }, [courseId, course?.name])

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-xl font-semibold">Course not found</h1>
        <Link
          to="/"
          className="text-indigo-400 hover:text-indigo-300 underline"
        >
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden animate-fade" style={{ '--delay': '0ms' }}>
        <img
          src={course.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover img-fade"
          onLoad={(e) => e.currentTarget.classList.add('loaded')}
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 right-0 px-6 py-6 md:py-10 max-w-3xl mx-auto w-full">
          <Link
            to="/"
            viewTransition
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-4 animate-in"
            style={{ '--delay': '80ms' }}
          >
            <i className="fa-light fa-arrow-left" />
            Back to dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold animate-in" style={{ '--delay': '140ms' }}>{course.name}</h1>
          {course.progress !== undefined && (
            <p className="text-gray-400 mt-1 animate-in" style={{ '--delay': '200ms' }}>{course.progress}% complete</p>
          )}
        </div>
      </div>

      <main className="py-8">
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-4">
            {course.description?.map((paragraph, i) => (
              <p key={i} className="text-gray-300 leading-relaxed animate-in" style={{ '--delay': `${260 + i * 60}ms` }}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8 animate-in" style={{ '--delay': '400ms' }}>
            <button
              type="button"
              onClick={() => navigate(`/play/${courseId}`)}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950"
              style={{ backgroundColor: course.color ?? '#6366f1' }}
            >
              <span className="relative w-4 h-4">
                <i className="fa-light fa-play absolute inset-0 transition-opacity group-hover:opacity-0" />
                <i className="fa-solid fa-play absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              {course.progress > 0 ? 'Continue' : 'Start'} Course
            </button>
          </div>
        </div>

        <section className="mt-12 pt-10 border-t border-gray-800 px-6 animate-fade" style={{ '--delay': '400ms' }}>
          <div className="flex justify-center gap-2 mb-8">
            <button
              type="button"
              onClick={() => setTab('explore')}
              className="px-5 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                tab === 'explore'
                  ? { backgroundColor: course.color, color: '#fff' }
                  : { backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #374151' }
              }
            >
              <i className="fa-light fa-compass mr-1.5" />
              Explore the Course
            </button>
            <button
              type="button"
              onClick={() => setTab('chatroom')}
              className="px-5 py-2 rounded-full text-sm font-medium transition-colors"
              style={
                tab === 'chatroom'
                  ? { backgroundColor: course.color, color: '#fff' }
                  : { backgroundColor: 'transparent', color: '#9ca3af', border: '1px solid #374151' }
              }
            >
              <i className="fa-light fa-comments mr-1.5" />
              Chatroom
            </button>
          </div>

          {tab === 'explore' && course.units?.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-3">
                {course.units.map((unit, ui) => {
                  const isActive = effectiveUnitId === unit.id
                  return (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => setSelectedUnitId(unit.id)}
                      style={{ '--unit-color': course.color ?? '#6366f1', '--delay': `${ui * 60}ms` }}
                      className={`w-full h-full text-left rounded-xl overflow-hidden bg-gray-900 border-2 transition-colors focus:outline-none animate-in ${
                        isActive ? 'border-[var(--unit-color)]' : 'border-gray-800 hover:border-[var(--unit-color)] focus:border-[var(--unit-color)]'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 p-3 lg:p-4 h-full">
                        <div className="w-full lg:w-24 aspect-[3/2] lg:aspect-square shrink-0 rounded-lg overflow-hidden bg-gray-800">
                          <img
                            src={unit.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-base lg:text-lg mb-1 text-gray-400">
                            {unit.title}
                          </h3>
                          <p className="text-gray-400 text-sm line-clamp-2">
                            {unit.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="text-left min-h-[200px]" style={{ '--unit-color': course.color ?? '#6366f1' }}>
                {selectedUnit ? (
                  <>
                    <h3 className="text-lg font-semibold mb-1 animate-in" style={{ '--delay': '0ms' }}>{selectedUnit.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 animate-in" style={{ '--delay': '60ms' }}>{selectedUnit.description}</p>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3 animate-in" style={{ '--delay': '120ms' }}>Lessons</h4>
                    <ul className="space-y-3">
                      {selectedUnit.lessons?.map((lesson, li) => (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            saveProgress(courseId, { currentLessonId: lesson.id, currentPage: 0 })
                            navigate(`/play/${courseId}`)
                          }}
                          className="group w-full text-left flex items-center gap-4 p-4 rounded-lg bg-gray-900/80 border border-gray-800 hover:border-[var(--unit-color)] transition-colors focus:outline-none animate-in"
                          style={{ '--unit-color': course.color ?? '#6366f1', '--delay': `${180 + li * 60}ms` }}
                        >
                          <div className="min-w-0 flex-1">
                            <h4 className="font-medium text-white">{lesson.title}</h4>
                            <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
                          </div>
                          <span
                            className="shrink-0 w-10 h-10 rounded-full relative flex items-center justify-center border border-gray-600 group-hover:border-[var(--unit-color)] group-hover:bg-[var(--unit-color)]/20 transition-colors"
                            aria-hidden="true"
                          >
                            <i className="fa-light fa-play text-sm ml-0.5 absolute transition-opacity group-hover:opacity-0" />
                            <i className="fa-solid fa-play text-sm ml-0.5 absolute opacity-0 transition-opacity group-hover:opacity-100" />
                          </span>
                        </button>
                      ))}
                    </ul>
                  </>
                ) : (
                  <div className="text-gray-500 text-sm">Select a unit to view its lessons.</div>
                )}
              </div>
            </div>
          )}

          {tab === 'chatroom' && (
            <CourseChatroom
              courseId={courseId}
              courseColor={course.color}
              steps={steps}
            />
          )}
        </section>
      </main>
    </div>
  )
}
