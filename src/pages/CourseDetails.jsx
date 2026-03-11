import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getCourseWithProgress } from '../data/courses.js'

export default function CourseDetails() {
  const { courseId } = useParams()
  const course = getCourseWithProgress(courseId)
  const [selectedUnitId, setSelectedUnitId] = useState(null)
  const selectedUnit = course?.units?.find((u) => u.id === selectedUnitId)

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
            <i className="fa-solid fa-arrow-left" />
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
              className="px-6 py-3 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-950"
              style={{
                backgroundColor: course.color ?? '#6366f1',
              }}
            >
              {course.progress > 0 ? 'Continue' : 'Start'} course
            </button>
          </div>
        </div>

        {/* Units in this course — full viewport width, tab-like */}
        {course.units?.length > 0 && (
          <section className="mt-12 pt-10 border-t border-gray-800 px-6 text-center">
            <h2 className="text-xl font-bold mb-6">Pick a unit to explore</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {course.units.map((unit) => {
                const isActive = selectedUnitId === unit.id
                return (
                  <button
                    key={unit.id}
                    type="button"
                    onClick={() => setSelectedUnitId(isActive ? null : unit.id)}
                    style={{ '--unit-color': course.color ?? '#6366f1' }}
                    className={`group text-left rounded-xl overflow-hidden bg-gray-900 border-2 transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--unit-color)] focus:ring-offset-2 focus:ring-offset-gray-950 ${
                      isActive
                        ? 'border-[var(--unit-color)] ring-2 ring-[var(--unit-color)]/40'
                        : 'border-gray-800 hover:border-[var(--unit-color)]'
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gray-800">
                      <img
                        src={unit.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className={`font-bold text-lg mb-2 transition-colors ${isActive ? 'text-[var(--unit-color)]' : 'group-hover:text-[var(--unit-color)]'}`}>
                        {unit.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {unit.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>

            {/* Lessons for selected unit */}
            {selectedUnit?.lessons?.length > 0 && (
              <div className="mt-8 max-w-7xl mx-auto">
                <h3 className="text-lg font-semibold mb-4">{selectedUnit.title} — Lessons</h3>
                <ul className="space-y-4">
                  {selectedUnit.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="p-4 rounded-lg bg-gray-900/80 border border-gray-800"
                    >
                      <h4 className="font-medium text-white">{lesson.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{lesson.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
