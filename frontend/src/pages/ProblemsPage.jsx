import { useState, useEffect } from 'react'
import Navbar, { TOPIC_COLORS } from '../components/Navbar'

export default function ProblemsPage({ onNavigate }) {
  const [problems, setProblems] = useState([])
  const [solved, setSolved] = useState([])
  const [collapsed, setCollapsed] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

 async function fetchData() {
  try {
    const [p, s] = await Promise.all([
      fetch('http://localhost:8000/problems').then(r => r.json()),
      fetch('http://localhost:8000/solved').then(r => r.json()),
    ])
    setProblems(p)
    setSolved(s.map(x => x.id))
    // start all collapsed
    const cats = [...new Set(p.map(prob => prob.category))]
    const initCollapsed = {}
    cats.forEach(c => initCollapsed[c] = true)
    setCollapsed(initCollapsed)
  } catch (e) { console.error(e) }
  finally { setLoading(false) }
}

  async function toggleSolved(id) {
    const isSolved = solved.includes(id)
    if (isSolved) {
      await fetch(`http://localhost:8000/solved/${id}`, { method: 'DELETE' })
      setSolved(prev => prev.filter(s => s !== id))
    } else {
      await fetch(`http://localhost:8000/solved/${id}`, { method: 'POST' })
      setSolved(prev => [...prev, id])
    }
  }

  const grouped = problems.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <Navbar current="problems" onNavigate={onNavigate} />
      <div style={{ maxWidth: 700, margin: '0 auto', padding: '28px 24px' }}>
        {loading ? (
          <div style={{ color: '#888', fontStyle: 'italic', padding: '40px 0' }}>Loading...</div>
        ) : (
          Object.entries(grouped).map(([cat, probs]) => {
            const color = TOPIC_COLORS[cat] || '#888'
            const solvedCount = probs.filter(p => solved.includes(p.id)).length
            const isCollapsed = collapsed[cat]
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div
                  onClick={() => setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', background: '#fff', borderRadius: 9,
                    border: '1px solid #EBEBEB', borderLeft: `3px solid ${color}`,
                    cursor: 'pointer', marginBottom: isCollapsed ? 0 : 4
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1F2E', flex: 1 }}>{cat}</span>
                  <span style={{ fontSize: 11, color: '#888', background: '#F3F3F1', padding: '2px 8px', borderRadius: 20 }}>
                    {solvedCount} / {probs.length}
                  </span>
                  <span style={{ fontSize: 11, color: '#bbb' }}>{isCollapsed ? '▸' : '▾'}</span>
                </div>
                {!isCollapsed && probs.map(p => (
                  <div
                    key={p.id}
                    onClick={() => toggleSolved(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '8px 14px 8px 28px', background: '#fff',
                      border: '1px solid #EBEBEB', borderRadius: 8,
                      marginBottom: 3, cursor: 'pointer'
                    }}
                  >
                    <div style={{
                      width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
                      border: `1.5px solid ${solved.includes(p.id) ? color : '#ddd'}`,
                      background: solved.includes(p.id) ? color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, color: '#fff'
                    }}>
                      {solved.includes(p.id) ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: 13, color: '#1C1F2E', flex: 1 }}>{p.title}</span>
                    {p.leetcode && (
                      <a href={p.leetcode} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                        style={{ fontSize: 11, color: '#bbb', textDecoration: 'none' }}>LC ↗</a>
                    )}
                    <span style={{
                      fontSize: 10, padding: '2px 8px', borderRadius: 20, fontWeight: 500,
                      background: p.difficulty === 'Easy' ? '#ECFAEE' : p.difficulty === 'Hard' ? '#FEF0EF' : '#FEF6E7',
                      color: p.difficulty === 'Easy' ? '#1E7B35' : p.difficulty === 'Hard' ? '#B42318' : '#9A5B0A'
                    }}>
                      {p.difficulty}
                    </span>
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}