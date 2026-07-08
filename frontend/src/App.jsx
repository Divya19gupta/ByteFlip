import { useState } from 'react'
import HomePage from './pages/HomePage'
import ProblemsPage from './pages/ProblemsPage'
import RevisionPage from './pages/RevisionPage'

export default function App() {
  const [page, setPage] = useState('home')

  return (
    <div>
      {page === 'home' && <HomePage onNavigate={setPage} />}
      {page === 'problems' && <ProblemsPage onNavigate={setPage} />}
      {page === 'revision' && <RevisionPage onNavigate={setPage} />}
    </div>
  )
}