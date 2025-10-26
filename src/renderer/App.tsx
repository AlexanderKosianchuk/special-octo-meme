import { MemoryRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/components/pages/Home'
import History from '@/components/pages/History'
import Transcript from '@/components/pages/Transcript'

import './App.css'

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/history" element={<History />} />
        <Route path="/transcript" element={<Transcript />} />
      </Routes>
    </Router>
  )
}
