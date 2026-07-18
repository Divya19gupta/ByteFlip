import { useState, useEffect } from 'react'
import Navbar, { TOPIC_COLORS } from '../components/Navbar'
import PageHeader from '../components/PageHeader'

const API = import.meta.env.VITE_API_URL || ' https://byteflip-ep4x.onrender.com'

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
  const [hint, setHint] = useState(null)
  const [hintLoading, setHintLoading] = useState(false)
  const [solvedCount, setSolvedCount] = useState(0)
  const [sessionStatus, setSessionStatus] = useState({ seen: 0, remaining: 0 })
  const [remainingAfter, setRemainingAfter] = useState(null)

  useEffect(() => {
    fetchSolvedCount()
    fetchSessionStatus()
  }, [])

  function fetchSolvedCount() {
    fetch(`${API}/solved`)
      .then(r => r.json())
      .then(data => setSolvedCount(data.length))
      .catch(e => console.error(e))
  }

  function fetchSessionStatus() {
    fetch(`${API}/session/status`)
      .then(r => r.json())
      .then(data => setSessionStatus({ seen: data.seen || 0, remaining: data.remaining || 0 }))
      .catch(e => console.error(e))
  }

  async function startRevision() {
    if (solvedCount === 0) return
    setLoading(true)
    setRevealed([])
    setHint(null)
    try {
      const res = await fetch(`${API}/session/current`)
      const data = await res.json()
      setCard(data.current_problem)
      setRemainingAfter(data.remaining_after ?? 0)
      setView('card')
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function nextCard() {
    setLoading(true)
    setRevealed([])
    setHint(null)
    try {
      const res = await fetch(`${API}/session/current`, { method: 'POST' })
      const data = await res.json()
      setCard(data.current_problem)
      setRemainingAfter(data.remaining_after ?? 0)
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  async function finishSession() {
    try {
      await fetch(`${API}/session/current`, { method: 'POST' })
    } catch (e) { console.error(e) }
    fetchSolvedCount()
    fetchSessionStatus()
    onNavigate('problems')
  }

  async function getHint() {
    setHintLoading(true)
    try {
      const res = await fetch(`${API}/hint/${card.id}`, { method: 'POST' })
      const data = await res.json()
      setHint(data.hint)
    } catch (e) { console.error(e) }
    finally { setHintLoading(false) }
  }

  function reveal(type) {
    if (type === 'all' || type === 'brute') setRevealed(['brute', 'optimal', 'tc', 'trick', 'similar'])
    else if (type === 'optimal') setRevealed(['optimal', 'tc', 'trick', 'similar'])
    else if (type === 'trick') setRevealed(['trick', 'similar'])
  }

  const cardColor = card ? (TOPIC_COLORS[card.category] || '#C85E38') : '#C85E38'
  const disabled = solvedCount === 0
  const hasProgress = sessionStatus.seen > 0

  return (
    <div style={{ background: '#FAFAF8', minHeight: '100vh' }}>
      <Navbar current="revision" onNavigate={onNavigate} />

      {view === 'home' && (
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 60px' }}>
          <PageHeader eyebrow="Revision" title="Revision mode" subtitle="Pick a mode to start your session." />

          <div
            onClick={startRevision}
            style={{
              background: disabled ? '#2A2E40' : '#1C1F2E',
              borderRadius: 14,
              padding: '30px 30px',
              marginBottom: 28,
              cursor: disabled ? 'not-allowed' : 'pointer',
              position: 'relative',
              overflow: 'hidden',
              opacity: disabled ? 0.75 : 1,
            }}
          >
            <svg style={{ position: 'absolute', inset: 0, opacity: .05, pointerEvents: 'none' }}>
              <defs>
                <pattern id="rdots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="1" cy="1" r="1" fill="#fff" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#rdots)" />
            </svg>
            <div style={{
              position: 'absolute', right: 24, top: 24, fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11, color: 'rgba(255,255,255,0.18)', letterSpacing: '2px'
            }}>
              01000010 01011001 01010100 01000101
            </div>

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#D97D5C', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                {disabled ? 'Locked' : hasProgress ? 'In progress' : 'Start now'}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.3px' }}>
                All problems
              </div>
              <div style={{ fontSize: 13.5, color: '#9098B1', marginBottom: 22, maxWidth: 380, lineHeight: 1.6 }}>
                {disabled
                  ? 'Tick off a problem on the Problems page first — then it lands here, shuffled and ready to revise.'
                  : hasProgress
                    ? `${sessionStatus.seen} seen · ${sessionStatus.remaining} left in this round`
                    : `${solvedCount} problem${solvedCount === 1 ? '' : 's'} solved — shuffled and ready.`}
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: disabled ? 'rgba(200,94,56,0.35)' : '#C85E38', color: '#fff', padding: '9px 20px',
                borderRadius: 8, fontSize: 13, fontWeight: 600
              }}>
                {disabled ? 'Solve a problem first' : hasProgress ? 'Resume session →' : 'Start session →'}
              </div>
            </div>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: '#B7B7B0', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: 12, fontFamily: "'JetBrains Mono', monospace" }}>
            By topic — coming soon
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {topics.map((t, idx) => {
              const color = TOPIC_COLORS[t] || '#888'
              return (
                <div key={t} style={{
                  background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10,
                  padding: '14px 16px', position: 'relative', cursor: 'not-allowed',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                      background: `${color}15`, border: `1px solid ${color}35`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 9.5, fontWeight: 600, color,
                    }}>
                      {String(idx + 1).padStart(2, '0')}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: '#1C1F2E' }}>{t}</div>
                  </div>
                  <div style={{
                    position: 'absolute', top: 12, right: 12,
                    fontSize: 9.5, background: '#F3F3F1', color: '#B7B7B0',
                    padding: '3px 8px', borderRadius: 20, fontFamily: "'JetBrains Mono', monospace",
                    letterSpacing: '.5px', fontWeight: 600,
                  }}>SOON</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'card' && !loading && card && (
        <div>
          <div style={{ padding: '28px 24px', maxWidth: 700, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
            <div onClick={() => { fetchSessionStatus(); setView('home') }} style={{ fontSize: 13, color: '#8B8B85', cursor: 'pointer', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
              ← All problems
            </div>

            <div style={{
              background: `${cardColor}0D`,
              border: `1.5px solid ${cardColor}35`,
              borderLeft: `4px solid ${cardColor}`,
              borderRadius: 12,
              padding: '24px 24px 20px',
              marginBottom: 16
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: cardColor }} />
                  <span style={{ fontSize: 11, color: cardColor, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', fontFamily: "'JetBrains Mono', monospace" }}>{card.category}</span>
                </div>
                <span style={{
                  fontSize: 10.5, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
                  fontFamily: "'JetBrains Mono', monospace", letterSpacing: '.3px',
                  background: card.difficulty === 'Easy' ? '#ECFAEE' : card.difficulty === 'Hard' ? '#FEF0EF' : '#FEF6E7',
                  color: card.difficulty === 'Easy' ? '#1E7B35' : card.difficulty === 'Hard' ? '#B42318' : '#9A5B0A'
                }}>{card.difficulty.toUpperCase()}</span>
              </div>
              <div style={{ fontSize: 27, fontWeight: 700, color: '#1C1F2E', letterSpacing: '-0.5px', marginBottom: 6 }}>{card.title}</div>
              <div style={{ fontSize: 13, color: '#8B8B85' }}>Pick your confidence below to reveal the answer.</div>
            </div>

            <div
              onClick={hintLoading || hint ? undefined : getHint}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500,
                background: hint ? '#F3F3F1' : '#fff',
                color: hint ? '#B7B7B0' : '#1C1F2E',
                cursor: hintLoading || hint ? 'default' : 'pointer',
                marginBottom: 16,
                border: `1px solid ${hint ? '#EBEBEB' : cardColor + '40'}`,
                opacity: hintLoading ? 0.6 : 1,
              }}
            >
              <span style={{ fontSize: 14 }}>💡</span>
              {hintLoading ? 'Thinking…' : hint ? 'Hint shown' : 'Get a hint'}
            </div>

            {hint && (
              <div style={{
                background: `${cardColor}0D`,
                border: `1px solid ${cardColor}30`,
                borderLeft: `3px solid ${cardColor}`,
                borderRadius: 10,
                padding: '16px 18px',
                marginBottom: 16,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontSize: 10, fontWeight: 600, color: cardColor,
                  textTransform: 'uppercase', letterSpacing: '1px',
                  fontFamily: "'JetBrains Mono', monospace", marginBottom: 8,
                }}>
                  <span>💡</span> Hint
                </div>
                <div style={{ fontSize: 13.5, color: '#333', lineHeight: 1.75 }}>
                  {hint}
                </div>
              </div>
            )}

            {revealed.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {revealed.includes('brute') && card.brute && (
                  <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10, padding: '16px 18px' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: cardColor, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Brute force</div>
                    <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}>{card.brute}</div>
                  </div>
                )}
                {revealed.includes('optimal') && card.optimal && (
                  <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10, padding: '16px 18px' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: cardColor, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Optimal</div>
                    <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}>{card.optimal}</div>
                  </div>
                )}
                {revealed.includes('tc') && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[['Time', card.time_complexity], ['Space', card.space_complexity]].map(([lbl, val]) => (
                      <div key={lbl} style={{ background: '#fff', border: `1px solid ${cardColor}30`, borderRadius: 10, padding: '12px 16px' }}>
                        <div style={{ fontSize: 10, color: cardColor, textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace" }}>{lbl}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#1C1F2E', fontFamily: "'JetBrains Mono', monospace" }}>{val}</div>
                      </div>
                    ))}
                  </div>
                )}
                {revealed.includes('trick') && card.trick && (
                  <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10, padding: '16px 18px' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: cardColor, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 8, fontFamily: "'JetBrains Mono', monospace" }}>Trick</div>
                    <div style={{ fontSize: 13, color: '#333', lineHeight: 1.7 }}>{card.trick}</div>
                  </div>
                )}
                {revealed.includes('similar') && card.similar?.length > 0 && (
                  <div style={{ background: '#fff', border: '1px solid #EBEBEB', borderRadius: 10, padding: '16px 18px' }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: cardColor, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: 10, fontFamily: "'JetBrains Mono', monospace" }}>Similar</div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {card.similar.map(s => (
                        <span key={s} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 20, background: `${cardColor}10`, color: cardColor, border: `1px solid ${cardColor}30`, fontWeight: 500 }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {card.pattern && (
                  <div style={{ padding: '4px 0' }}>
                    <span style={{ fontSize: 11.5, padding: '5px 14px', borderRadius: 20, background: `${cardColor}15`, color: cardColor, fontWeight: 600, border: `1px solid ${cardColor}30`, fontFamily: "'JetBrains Mono', monospace" }}>
                      Pattern: {card.pattern}
                    </span>
                  </div>
                )}
              </div>
            )}
            <div style={{ height: 100 }} />
          </div>

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
              {remainingAfter === 0 ? (
                <div onClick={finishSession} style={{
                  padding: '10px 20px', borderRadius: 8, background: '#1E7B35',
                  color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                }}>Finish ✓</div>
              ) : (
                <div onClick={nextCard} style={{
                  padding: '10px 20px', borderRadius: 8, background: '#1C1F2E',
                  color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap'
                }}>Next →</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}