import { Link, useLocation } from 'react-router-dom'

export default function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="flex justify-start ml-8 w-full">
      <Link
        to="/"
        className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 rounded-t-lg ${
          isActive('/')
            ? 'text-blue-400 border-blue-400 bg-gray-800/50'
            : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-500'
        }`}
      >
        Record
      </Link>
      <Link
        to="/history"
        className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 rounded-t-lg ${
          isActive('/history')
            ? 'text-blue-400 border-blue-400 bg-gray-800/50'
            : 'text-gray-400 border-transparent hover:text-gray-300 hover:border-gray-500'
        }`}
      >
        History
      </Link>
    </nav>
  )
}

