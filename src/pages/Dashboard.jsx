import { Link } from 'react-router-dom'
import { getAllCoursesWithProgress } from '../data/courses.js'

export default function Dashboard() {
  const courses = getAllCoursesWithProgress()

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <main className="pt-24 px-6 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {courses.map((course, i) => {
            const base = 60 + i * 80
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
      </main>
    </div>
  )
}
