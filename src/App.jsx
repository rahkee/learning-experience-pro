import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8">
      <h1 className="text-4xl font-bold">
        <i className="fa-brands fa-react text-cyan-400 mr-3"></i>
        Vite + React
      </h1>

      <div className="flex gap-4">
        <button
          className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-lg font-medium transition-colors cursor-pointer"
          onClick={() => setCount((c) => c + 1)}
        >
          <i className="fa-solid fa-plus mr-2"></i>
          Count is {count}
        </button>
      </div>

      <p className="text-gray-400 text-sm">
        <i className="fa-solid fa-check text-green-400 mr-2"></i>
        Tailwind CSS &amp; FontAwesome Pro are loaded
      </p>
    </div>
  )
}

export default App
