import { StrictMode, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))
const CourseDetails = lazy(() => import('./pages/CourseDetails.jsx'))
const CoursePlayer = lazy(() => import('./pages/CoursePlayer.jsx'))
const CourseComplete = lazy(() => import('./pages/CourseComplete.jsx'))
const Notifications = lazy(() => import('./pages/Notifications.jsx'))

localStorage.removeItem('student-progress')
localStorage.removeItem('discussions')
localStorage.removeItem('discussions-read')

function Lazy({ children }) {
  return <Suspense fallback={null}>{children}</Suspense>
}

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <Lazy><Dashboard /></Lazy> },
      { path: '/course/:courseId', element: <Lazy><CourseDetails /></Lazy> },
      { path: '/play/:courseId', element: <Lazy><CoursePlayer /></Lazy> },
      { path: '/course/:courseId/complete', element: <Lazy><CourseComplete /></Lazy> },
      { path: '/notifications', element: <Lazy><Notifications /></Lazy> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
