import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import CourseDetails from './pages/CourseDetails.jsx'
import CoursePlayer from './pages/CoursePlayer.jsx'
import CourseComplete from './pages/CourseComplete.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/course/:courseId" element={<CourseDetails />} />
      <Route path="/play/:courseId" element={<CoursePlayer />} />
      <Route path="/course/:courseId/complete" element={<CourseComplete />} />
    </Routes>
  )
}

export default App
