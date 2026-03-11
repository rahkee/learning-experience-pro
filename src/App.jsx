import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import GlobalNav from './components/GlobalNav.jsx'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function App() {
  return (
    <>
      <ScrollToTop />
      <GlobalNav />
      <Outlet />
    </>
  )
}

export default App
