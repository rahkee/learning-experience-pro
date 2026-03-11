import { useParams, Link } from 'react-router-dom'
import { getCourseWithProgress } from '../data/courses.js'

export default function CourseDetails() {
  const { courseId } = useParams()
  const course = getCourseWithProgress(courseId)

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

      {/* Description and actions */}
      <main className="max-w-3xl mx-auto px-6 py-8">
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
      </main>
    </div>
  )
}
