import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard.jsx'
import CourseDetails from './pages/CourseDetails.jsx'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/course/:courseId" element={<CourseDetails />} />
    </Routes>
  )
}

export default App
