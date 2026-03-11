import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getCourseWithProgress } from '../data/courses.js'
import { saveProgress } from '../data/progress.js'
import NotificationBell from '../components/NotificationBell.jsx'

export default function CourseDetails() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const course = getCourseWithProgress(courseId)
  const [selectedUnitId, setSelectedUnitId] = useState(null)
  const effectiveUnitId = selectedUnitId ?? course?.units?.[0]?.id ?? null
  const selectedUnit = course?.units?.find((u) => u.id === effectiveUnitId)

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
      {/* Global notification bell */}
      <div className="fixed top-4 right-6 z-50">
        <NotificationBell />
      </div>

      {/* Hero with course image and overlay */}
      <div className="relative h-[40vh] min-h-[280px] w-full overflow-hidden">
        <img
          src={course.image}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent"
          aria-hidden
        />
        <div className="absolute bottom-0 left-0 right-0 px-6 py-6 md:py-10 max-w-3xl mx-auto w-full">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white mb-4"
          >
            <i className="fa-light fa-arrow-left" />
            Back to dashboard
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold">{course.name}</h1>
          {course.progress !== undefined && (
            <p className="text-gray-400 mt-1">{course.progress}% complete</p>
          )}
        </div>
      </div>

      <main className="py-8">
        {/* Description and actions — constrained width */}
        <div className="max-w-3xl mx-auto px-6">
          <div className="space-y-4">
            {course.description?.map((paragraph, i) => (
              <p key={i} className="text-gray-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
          <div className="mt-8">
            <button
              type="button"
              onClick={() => navigate(`/play/${courseId}`)}
              className="group inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950"
              style={{
                backgroundColor: course.color ?? '#6366f1',
              }}
            >
              <span className="relative w-4 h-4">
                <i className="fa-light fa-play absolute inset-0 transition-opacity group-hover:opacity-0" />
                <i className="fa-solid fa-play absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
              </span>
              {course.progress > 0 ? 'Continue' : 'Start'} Course
            </button>
          </div>
        </div>

        {/* Units — 2-column: units left, selected unit content right */}
        {course.units?.length > 0 && (
          <section className="mt-12 pt-10 border-t border-gray-800 px-6">
            <h2 className="text-xl font-bold mb-6 text-center">Pick a Unit to Explore</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {/* Left column: unit list — responsive grid below lg, vertical list at lg */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-1 gap-3">
                {course.units.map((unit) => {
                  const isActive = effectiveUnitId === unit.id
                  return (
                    <button
                      key={unit.id}
                      type="button"
                      onClick={() => setSelectedUnitId(unit.id)}
                      style={{ '--unit-color': course.color ?? '#6366f1' }}
                      className={`w-full h-full text-left rounded-xl overflow-hidden bg-gray-900 border-2 transition-colors focus:outline-none ${
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

              {/* Right column: selected unit title + lessons (no container) */}
              <div className="text-left min-h-[200px]" style={{ '--unit-color': course.color ?? '#6366f1' }}>
                {selectedUnit ? (
                  <>
                    <h3 className="text-lg font-semibold mb-1">{selectedUnit.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{selectedUnit.description}</p>
                    <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Lessons</h4>
                    <ul className="space-y-3">
                      {selectedUnit.lessons?.map((lesson) => (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => {
                            saveProgress(courseId, { currentLessonId: lesson.id, currentPage: 0 })
                            navigate(`/play/${courseId}`)
                          }}
                          className="group w-full text-left flex items-center gap-4 p-4 rounded-lg bg-gray-900/80 border border-gray-800 hover:border-[var(--unit-color)] transition-colors focus:outline-none"
                          style={{ '--unit-color': course.color ?? '#6366f1' }}
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
          </section>
        )}
      </main>
    </div>
  )
}
