import { useState } from 'react'
import Navbar, { TOPIC_COLORS } from '../components/Navbar'

const topics = [
  'Solve Problems on Arrays', 'Binary Search', 'Dynamic Programming',
  'Graphs', 'Learn LinkedList', 'Binary Trees', 'Stack and Queues',
  'Recursion', 'Strings', 'Heaps', 'Greedy Algorithms', 'Bit Manipulation', 'Binary Search Trees'
]

export default function RevisionPage({ onNavigate }) {
  const [view, setView] = useState('home')
  const [card, setCard] = useState(null)
  const [revealed, setRevealed] = useState([])
  const [loading, setLoading] = useState(false)

  async function startRevision() {
    setLoading(true)
    setRevealed([])
    try {
      const res = await fetch('http://localhost:8000/quiz')
      const data = await res.json()
      setCard(data)
      setView('card')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function nextCard() {
    setLoading(true)
    setRevealed([])
    try {
      const res = await fetch('http://localhost:8000/quiz')
      const data = await res.json()
      setCard(data)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  function reveal(type) {
    if (type === 'all' || type === 'brute') setRevealed(['brute', 'optimal', 'tc', 'trick', 'similar'])
    else if (type === 'optimal') setRevealed(['optimal', 'tc', 'trick', 'similar'])
    else if (type === 'trick') setRevealed(['trick', 'similar'])
  }

  const cardColor = card ? (TOPIC_COLORS[card.category] || '#C85E38') : '#C85E38'

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <Navbar current="revision" onNavigate={onNavigate} />

      {view === 'home' && (
  <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
    
    {/* Header */}
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1F2E', letterSpacing: '-0.5px', marginBottom: 6 }}>Revision mode</div>
      <div style={{ fontSize: 14, color: '#888' }}>Pick a mode to start your session.</div>
    </div>

    {/* All problems — featured card */}
    <div
      onClick={startRevision}
      style={{
        background: '#1C1F2E',
        borderRadius: 14,
        padding: '28px 28px',
        marginBottom: 24,
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* subtle dot pattern */}
      <svg style={{ position: 'absolute', inset: 0, opacity: .04, pointerEvents: 'none' }}>
        <defs>
          <pattern id="rdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#fff" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#rdots)" />
      </svg>

      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#C85E38', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 10 }}>
          Start now
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 6, letterSpacing: '-0.3px' }}>
          All problems
        </div>
        <div style={{ fontSize: 13, color: '#9098B1', marginBottom: 20 }}>
          Every problem you've solved — shuffled and ready.
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#C85E38', color: '#fff', padding: '9px 20px',
          borderRadius: 8, fontSize: 13, fontWeight: 600
        }}>
          Start session →
        </div>
      </div>
    </div>

    {/* By topic label */}
    <div style={{ fontSize: 11, fontWeight: 600, color: '#bbb', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 12 }}>
      By topic — coming soon
    </div>

    {/* Topic grid */}
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {topics.map(t => {
        const color = TOPIC_COLORS[t] || '#888'
        return (
          <div key={t} style={{
            background: '#fff',
            border: '1px solid #EBEBEB',
            borderTop: `3px solid ${color}`,
            borderRadius: 10,
            padding: '14px 16px',
            opacity: 0.7,
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1F2E' }}>{t}</div>
            </div>
            <div style={{
              position: 'absolute', top: 10, right: 10,
              fontSize: 10, background: '#F3F3F1', color: '#bbb',
              padding: '2px 8px', borderRadius: 20
            }}>Soon</div>
          </div>
        )
      })}
    </div>
  </div>
)}

    {view === 'card' && !loading && card && (
 <div>
  <div style={{ padding: '28px 24px', maxWidth: 700, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>   
      <div onClick={() => setView('home')} style={{ fontSize: 13, color: '#888', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
        ← All problems
      </div>

      {/* Fixed question card - never changes size */}
      <div style={{
        background: `${cardColor}10`,
        border: `1.5px solid ${cardColor}40`,
        borderLeft: `4px solid ${cardColor}`,
        borderRadius: 12,
        padding: '24px 24px 20px',
        marginBottom: 16
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cardColor }} />
            <span style={{ fontSize: 11, color: cardColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.8px' }}>{card.category}</span>
          </div>
          <span style={{
            fontSize: 11, padding: '3px 10px', borderRadius: 20, fontWeight: 500,
            background: card.difficulty === 'Easy' ? '#ECFAEE' : card.difficulty === 'Hard' ? '#FEF0EF' : '#FEF6E7',
            color: card.difficulty === 'Easy' ? '#1E7B35' : card.difficulty === 'Hard' ? '#B42318' : '#9A5B0A'
          }}>{card.difficulty}</span>
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, color: '#1C1F2E', letterSpacing: '-0.5px', marginBottom: 6 }}>{card.title}</div>
        <div style={{ fontSize: 13, color: '#888' }}>Pick your confidence below to reveal the answer.</div>
      </div>

      {/* Answer content - only shows after clicking */}
      {revealed.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {revealed.includes('brute') && card.brute && (
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: cardColor, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>Brute force</div>
              <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}>{card.brute}</div>
            </div>
          )}

          {revealed.includes('optimal') && card.optimal && (
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: cardColor, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>Optimal</div>
              <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}>{card.optimal}</div>
            </div>
          )}

          {revealed.includes('tc') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {[['Time', card.time_complexity], ['Space', card.space_complexity]].map(([lbl, val]) => (
                <div key={lbl} style={{ background: '#fff', border: `1px solid ${cardColor}30`, borderRadius: 10, padding: '12px 16px' }}>
                  <div style={{ fontSize: 10, color: cardColor, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4, fontWeight: 600 }}>{lbl}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1F2E', fontFamily: 'monospace' }}>{val}</div>
                </div>
              ))}
            </div>
          )}

          {revealed.includes('trick') && card.trick && (
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: cardColor, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8 }}>Trick</div>
              <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}>{card.trick}</div>
            </div>
          )}

          {revealed.includes('similar') && card.similar?.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10, padding: '16px 18px' }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: cardColor, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10 }}>Similar</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {card.similar.map(s => (
                  <span key={s} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: `${cardColor}10`, color: cardColor, border: `1px solid ${cardColor}30`, fontWeight: 500 }}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {card.pattern && (
            <div style={{ padding: '4px 0' }}>
              <span style={{ fontSize: 12, padding: '5px 14px', borderRadius: 20, background: `${cardColor}15`, color: cardColor, fontWeight: 600, border: `1px solid ${cardColor}30` }}>
                Pattern: {card.pattern}
              </span>
            </div>
          )}
        </div>
      )}

      <div style={{ height: 100 }} />
    </div>

    {/* Fixed bottom bar */}
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #EBEBEB', padding: '14px 24px', zIndex: 50 }}>
      <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', gap: 8 }}>
        {[
          { label: 'No idea', type: 'brute', bg: '#FEF0EF', border: '#FECDCA', color: '#B42318' },
          { label: 'Vague', type: 'optimal', bg: '#FEF6E7', border: '#FEDF89', color: '#9A5B0A' },
          { label: 'Got it', type: 'trick', bg: '#ECFAEE', border: '#ABEFC6', color: '#1E7B35' },
          { label: 'Show all', type: 'all', bg: '#F3F3F1', border: '#E0E0DC', color: '#1C1F2E' },
        ].map(btn => (
          <div key={btn.type} onClick={() => reveal(btn.type)} style={{
            flex: 1, padding: '10px 6px', borderRadius: 8,
            border: `1px solid ${btn.border}`, background: btn.bg,
            color: btn.color, fontSize: 13, fontWeight: 500,
            cursor: 'pointer', textAlign: 'center'
          }}>{btn.label}</div>
        ))}
        <div onClick={nextCard} style={{
          padding: '10px 20px', borderRadius: 8, background: '#1C1F2E',
          color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
        }}>Next →</div>
      </div>
    </div>
  </div>
)}
    </div>
  )
}