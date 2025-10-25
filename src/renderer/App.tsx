import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import History from '@/pages/History'

import './App.css'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  )
}
