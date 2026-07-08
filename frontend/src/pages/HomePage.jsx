import { useEffect, useRef } from 'react'

const topics = [
  { label: 'Arrays', symbol: '[ ]', color: '#C85E38' },
  { label: 'Binary Search', symbol: '⌕', color: '#534AB7' },
  { label: 'Dynamic Programming', symbol: '◈', color: '#1D9E75' },
  { label: 'Graphs', symbol: '⬡', color: '#D85A30' },
  { label: 'Linked List', symbol: '⟶', color: '#D4537E' },
  { label: 'Binary Trees', symbol: '⑂', color: '#185FA5' },
  { label: 'Stack & Queues', symbol: '⫶', color: '#639922' },
  { label: 'Recursion', symbol: '↺', color: '#993C1D' },
  { label: 'Strings', symbol: '" "', color: '#0F6E56' },
  { label: 'Heaps', symbol: '△', color: '#7F77DD' },
  { label: 'Greedy', symbol: '⚡', color: '#854F0B' },
  { label: 'Bit Manipulation', symbol: '⊕', color: '#3C3489' },
  { label: 'BST', symbol: '⊤', color: '#3B6D11' },
]

export default function HomePage({ onNavigate }) {
  const logoRef = useRef(null)
  const containerRef = useRef(null)
  const pillsRef = useRef([])
  const statesRef = useRef([])
  const rafRef = useRef(null)
  const busyRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // create pills
    statesRef.current = pillsRef.current.map((el) => ({
      el,
      x: Math.random() * (container.offsetWidth - 150),
      y: Math.random() * (container.offsetHeight - 40),
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
    }))

    function animate() {
      const W = container.offsetWidth
      const H = container.offsetHeight
      statesRef.current.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        const pw = p.el.offsetWidth || 120
        const ph = p.el.offsetHeight || 30
        if (p.x < 0 || p.x + pw > W) p.vx *= -1
        if (p.y < 0 || p.y + ph > H) p.vy *= -1
        p.x = Math.max(0, Math.min(W - pw, p.x))
        p.y = Math.max(0, Math.min(H - ph, p.y))
        p.el.style.left = p.x + 'px'
        p.el.style.top = p.y + 'px'
      })
      rafRef.current = requestAnimationFrame(animate)
    }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  function scramble() {
    if (busyRef.current) return
    busyRef.current = true
    const logo = logoRef.current
    const target = 'ByteFlip'
    const chars = '01'
    let iter = 0
    const max = target.length * 4
    const iv = setInterval(() => {
      const s = target.split('').map((ch, i) =>
        iter > i * 3 ? ch : chars[Math.floor(Math.random() * 2)]
      ).join('')
      logo.innerHTML = `<span style="color:#1C1F2E">${s.slice(0, 4)}</span><span style="color:#C85E38">${s.slice(4)}</span>`
      iter++
      if (iter >= max) {
        logo.innerHTML = `<span style="color:#1C1F2E">Byte</span><span style="color:#C85E38">Flip</span>`
        clearInterval(iv)
        busyRef.current = false
      }
    }, 45)
  }

  return (
    <div ref={containerRef} style={{
      position: 'relative', minHeight: '100vh', background: '#FAFAF8',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', textAlign: 'center', padding: '60px 28px',
      overflow: 'hidden'
    }}>
      {/* dot grid */}
      <svg style={{ position: 'absolute', inset: 0, opacity: .04, pointerEvents: 'none' }}>
        <defs>
          <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="#1C1F2E" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
      </svg>

      {/* floating pills */}
      {topics.map((t, i) => (
        <div
          key={t.label}
          ref={el => pillsRef.current[i] = el}
          style={{
            position: 'absolute', display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500,
            whiteSpace: 'nowrap', border: `1px solid ${t.color}40`,
            background: `${t.color}0D`, color: t.color, opacity: 0.35,
            pointerEvents: 'none'
          }}
        >
          <span style={{ fontSize: 13 }}>{t.symbol}</span>{t.label}
        </div>
      ))}

      {/* content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '2.5px', color: '#C85E38', textTransform: 'uppercase', marginBottom: 20 }}>
          DSA revision system
        </div>

        <div
          ref={logoRef}
          onMouseEnter={scramble}
          style={{ fontSize: 80, fontWeight: 700, letterSpacing: '-3px', cursor: 'default', lineHeight: 1, marginBottom: 16, fontFamily: 'Inter, monospace' }}
        >
          <span style={{ color: '#1C1F2E' }}>Byte</span>
          <span style={{ color: '#C85E38' }}>Flip</span>
        </div>

        <div style={{ fontSize: 16, color: '#888', marginBottom: 40, lineHeight: 1.6, maxWidth: 400 }}>
          Your personal DSA revision tool.<br />
          <span style={{ color: '#1C1F2E', fontWeight: 500 }}>305 problems across 13 topics.</span>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button
            onClick={() => onNavigate('problems')}
            style={{
              padding: '13px 32px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', background: '#1C1F2E', color: '#FAFAF8',
              border: '2px solid #1C1F2E', fontFamily: 'Inter, sans-serif'
            }}
          >
            Problems →
          </button>
          <button
            onClick={() => onNavigate('revision')}
            style={{
              padding: '13px 32px', borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: 'pointer', background: 'transparent', color: '#1C1F2E',
              border: '2px solid #1C1F2E', fontFamily: 'Inter, sans-serif'
            }}
          >
            Start revision
          </button>
        </div>
      </div>
    </div>
  )
}