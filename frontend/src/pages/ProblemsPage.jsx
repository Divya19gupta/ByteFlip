import { useState, useEffect } from 'react'
import Navbar, { TOPIC_COLORS } from '../components/Navbar'
import PageHeader from '../components/PageHeader'
import ByteMeter from '../components/ByteMeter'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function ProblemsPage({ onNavigate }) {
  const [problems, setProblems] = useState([])
  const [solved, setSolved] = useState([])
  const [collapsed, setCollapsed] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    try {
      const [p, s] = await Promise.all([
        fetch(`${API}/problems`).then(r => r.json()),
        fetch(`${API}/solved`).then(r => r.json()),
      ])
      setProblems(p)
      setSolved(s.map(x => x.id))
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
      await fetch(`${API}/solved/${id}`, { method: 'DELETE' })
      setSolved(prev => prev.filter(s => s !== id))
    } else {
      await fetch(`${API}/solved/${id}`, { method: 'POST' })
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
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 60px' }}>
        <PageHeader
          eyebrow="Problem set"
          title="Problems"
          subtitle={loading ? 'Loading your progress…' : `${solved.length} of ${problems.length} solved`}
          right={!loading && <ByteMeter solved={solved.length} total={problems.length} color="#1C1F2E" size="lg" />}
        />

        {loading ? (
          <div style={{ color: '#8B8B85', fontSize: 13, fontFamily: "'JetBrains Mono', monospace", padding: '40px 0' }}>
            loading_problems()...
          </div>
        ) : (
          Object.entries(grouped).map(([cat, probs], idx) => {
            const color = TOPIC_COLORS[cat] || '#888'
            const solvedCount = probs.filter(p => solved.includes(p.id)).length
            const isCollapsed = collapsed[cat]
            return (
              <div key={cat} style={{ marginBottom: 10 }}>
                <div
                  onClick={() => setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '12px 16px', background: '#fff', borderRadius: 10,
                    border: '1px solid #EBEBEB', cursor: 'pointer',
                    marginBottom: isCollapsed ? 0 : 6,
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                    background: `${color}15`, border: `1px solid ${color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color,
                  }}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1F2E', flex: 1 }}>{cat}</span>
                  <ByteMeter solved={solvedCount} total={probs.length} color={color} />
                  <span style={{
                    fontSize: 11, color: '#8B8B85', fontFamily: "'JetBrains Mono', monospace",
                    minWidth: 42, textAlign: 'right'
                  }}>
                    {solvedCount}/{probs.length}
                  </span>
                  <span style={{ fontSize: 11, color: '#C4C3BD', transform: isCollapsed ? 'none' : 'rotate(90deg)', transition: 'transform .15s' }}>▸</span>
                </div>
                {!isCollapsed && probs.map(p => (
                  <div
                    key={p.id}
                    onClick={() => toggleSolved(p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '10px 16px 10px 30px', background: '#fff',
                      border: '1px solid #EBEBEB',
                      borderLeft: `2px solid ${solved.includes(p.id) ? color : '#EBEBEB'}`,
                      borderRadius: 8, marginBottom: 4, cursor: 'pointer',
                    }}
                  >
                    <div style={{
                      width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                      border: `1.5px solid ${solved.includes(p.id) ? color : '#D9D8D2'}`,
                      background: solved.includes(p.id) ? color : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, color: '#fff', fontWeight: 700,
                    }}>
                      {solved.includes(p.id) ? '✓' : ''}
                    </div>
                    <span style={{ fontSize: 13.5, color: '#1C1F2E', flex: 1, fontWeight: solved.includes(p.id) ? 500 : 400 }}>{p.title}</span>
                    {p.leetcode && (
                      <a href={p.leetcode} target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}
                        style={{ fontSize: 10.5, color: '#B7B7B0', textDecoration: 'none', fontFamily: "'JetBrains Mono', monospace" }}>LC ↗</a>
                    )}
                    <span style={{
                      fontSize: 10, padding: '2px 9px', borderRadius: 20, fontWeight: 600,
                      fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.3px',
                      background: p.difficulty === 'Easy' ? '#ECFAEE' : p.difficulty === 'Hard' ? '#FEF0EF' : '#FEF6E7',
                      color: p.difficulty === 'Easy' ? '#1E7B35' : p.difficulty === 'Hard' ? '#B42318' : '#9A5B0A'
                    }}>
                      {p.difficulty.toUpperCase()}
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