import { Link } from 'react-router-dom'
import { getAllCoursesWithProgress, flattenCoursePages } from '../data/courses.js'

export default function Dashboard() {
  const courses = getAllCoursesWithProgress()
  const heroCourse = courses.find((course) => course.id === 'science')
  const otherCourses = courses.filter((course) => course.id !== 'science')

  const getResumeStep = (course) => {
    if (!course) return null
    const steps = flattenCoursePages(course)
    if (steps.length === 0) return null
    const index = steps.findIndex(
      (step) =>
        step.lessonId === course.currentLessonId &&
        step.pageIndex === (course.currentPage ?? 0)
    )
    const stepIndex = index >= 0 ? index : 0
    return { stepIndex, step: steps[stepIndex] }
  }

  const heroResume = getResumeStep(heroCourse)

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="pt-24 px-6 pb-12">
        <div className="max-w-6xl mx-auto space-y-6">
          {heroCourse && (
            <section
              style={{ '--course-color': heroCourse.color ?? '#6366f1' }}
              className="rounded-2xl overflow-hidden bg-gray-900 border border-[var(--course-color)]/60"
            >
              <div className="grid grid-cols-1 lg:grid-cols-5">
                <div
                  className="lg:col-span-2 aspect-[16/10] lg:aspect-auto lg:h-full w-full overflow-hidden bg-gray-800 animate-fade"
                  style={{ '--delay': '60ms' }}
                >
                  <img
                    src={heroCourse.image}
                    alt=""
                    className="w-full h-full object-cover img-fade"
                    onLoad={(e) => e.currentTarget.classList.add('loaded')}
                  />
                </div>
                <div className="lg:col-span-3 p-6 flex flex-col">
                  <p className="text-xs uppercase tracking-wide text-[var(--course-color)] font-semibold mb-2 animate-in" style={{ '--delay': '90ms' }}>
                    Recommended for today
                  </p>
                  <h2
                    className="font-bold text-2xl mb-2 animate-in"
                    style={{ '--delay': '120ms' }}
                  >
                    {heroCourse.name}
                  </h2>
                  <p
                    className="text-gray-300 text-sm mb-4 animate-in"
                    style={{ '--delay': '160ms' }}
                  >
                    {heroCourse.description?.[0] ?? ''}
                  </p>

                  {heroResume?.step && (
                    <div className="rounded-lg border border-gray-800 bg-gray-950/50 px-4 py-3 mb-4 animate-in" style={{ '--delay': '200ms' }}>
                      <div className="flex items-center gap-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-400 mb-1">Continue from</p>
                          <p className="text-sm font-semibold text-gray-100 truncate">
                            {heroResume.step.lessonTitle} - Page {heroResume.step.pageIndex + 1}
                          </p>
                          <p className="text-xs text-gray-500 mt-1 truncate">{heroResume.step.unitTitle}</p>
                        </div>
                      <Link
                        to={`/play/${heroCourse.id}`}
                        state={{ stepIndex: heroResume.stepIndex, ts: Date.now() }}
                        viewTransition
                        className="group shrink-0 w-10 h-10 rounded-full relative flex items-center justify-center border border-gray-600 hover:border-[var(--course-color)] hover:bg-[var(--course-color)]/20 transition-colors"
                        aria-label={`Continue ${heroResume.step.lessonTitle}`}
                      >
                        <i className="fa-light fa-play text-sm ml-0.5 absolute transition-opacity group-hover:opacity-0" />
                        <i className="fa-solid fa-play text-sm ml-0.5 absolute opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                      </div>
                    </div>
                  )}

                  <div
                    className="space-y-2 animate-in"
                    style={{ '--delay': '240ms' }}
                  >
                    <div className="h-2.5 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${heroCourse.progress}%`,
                          backgroundColor: heroCourse.color ?? '#6366f1',
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-400">{heroCourse.progress}% complete</p>
                  </div>

                </div>
              </div>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {otherCourses.map((course, i) => {
              const base = 320 + i * 80
              return (
                <Link
                  key={course.id}
                  to={`/course/${course.id}`}
                  viewTransition
                  style={{ '--course-color': course.color ?? '#6366f1' }}
                  className="group text-left rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-[var(--course-color)] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--course-color)] focus:ring-offset-2 focus:ring-offset-gray-950"
                >
                  <div
                    className="aspect-[4/3] w-full overflow-hidden bg-gray-800 animate-fade"
                    style={{ '--delay': `${base}ms` }}
                  >
                    <img
                      src={course.image}
                      alt=""
                      className="w-full h-full object-cover img-fade"
                      onLoad={(e) => e.currentTarget.classList.add('loaded')}
                    />
                  </div>
                  <div className="p-4">
                    <h2
                      className="font-bold text-lg mb-2 group-hover:text-[var(--course-color)] transition-colors animate-in"
                      style={{ '--delay': `${base + 80}ms` }}
                    >
                      {course.name}
                    </h2>
                    <p
                      className="text-gray-400 text-sm line-clamp-3 mb-4 animate-in"
                      style={{ '--delay': `${base + 140}ms` }}
                    >
                      {course.description?.[0] ?? ''}
                    </p>
                    <div
                      className="space-y-1 animate-in"
                      style={{ '--delay': `${base + 200}ms` }}
                    >
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${course.progress}%`,
                            backgroundColor: course.color ?? '#6366f1',
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">{course.progress}% complete</p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
