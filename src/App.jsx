import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import CoursePlayer from './pages/CoursePlayer.jsx'
import CourseComplete from './pages/CourseComplete.jsx'
import Notifications from './pages/Notifications.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/course/:courseId" element={<CourseDetails />} />
        <Route path="/play/:courseId" element={<CoursePlayer />} />
        <Route path="/course/:courseId/complete" element={<CourseComplete />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </>
  )
}

export default App
