import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import CoursePlayer from './pages/CoursePlayer.jsx'
import CourseComplete from './pages/CourseComplete.jsx'
import Notifications from './pages/Notifications.jsx'

localStorage.removeItem('student-progress')
localStorage.removeItem('discussions')
localStorage.removeItem('discussions-read')

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      { path: '/', element: <Dashboard /> },
      { path: '/course/:courseId', element: <CourseDetails /> },
      { path: '/play/:courseId', element: <CoursePlayer /> },
      { path: '/course/:courseId/complete', element: <CourseComplete /> },
      { path: '/notifications', element: <Notifications /> },
    ],
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
