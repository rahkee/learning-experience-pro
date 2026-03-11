import { useNavigate } from 'react-router-dom'
import { getStudent, getAllCoursesWithProgress } from '../data/courses.js'

export default function Dashboard() {
  const navigate = useNavigate()
  const student = getStudent()
  const courses = getAllCoursesWithProgress()

  const initials = [student.firstName, student.lastName]
    .map((n) => n?.charAt(0) ?? '')
    .join('')
    .toUpperCase() || '?'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Fixed transparent top nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-end gap-4 px-6 py-4 bg-transparent"
        aria-label="Main navigation"
      >
        <button
          type="button"
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Notifications"
        >
          <i className="fa-solid fa-bell text-xl" />
        </button>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Messages"
        >
          <i className="fa-solid fa-envelope text-xl" />
        </button>
        <div
          className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-semibold shrink-0"
          aria-hidden
        >
          {initials}
        </div>
      </nav>

      {/* Content below nav */}
      <main className="pt-24 px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {courses.map((course) => (
            <button
              key={course.id}
              type="button"
              onClick={() => navigate(`/course/${course.id}`)}
              style={{ '--course-color': course.color ?? '#6366f1' }}
              className="group text-left rounded-xl overflow-hidden bg-gray-900 border border-gray-800 hover:border-[var(--course-color)] transition-[border-color,box-shadow] duration-200 hover:shadow-[0_0_32px_color-mix(in_srgb,var(--course-color)_40%,transparent)] focus:outline-none focus:ring-2 focus:ring-[var(--course-color)] focus:ring-offset-2 focus:ring-offset-gray-950"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-gray-800">
                <img
                  src={course.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="font-bold text-lg mb-2 group-hover:text-[var(--course-color)] transition-colors">{course.name}</h2>
                <p className="text-gray-400 text-sm line-clamp-3 mb-4">
                  {course.description?.[0] ?? ''}
                </p>
                <div className="space-y-1">
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
            </button>
          ))}
        </div>
      </main>
    </div>
  )
}
