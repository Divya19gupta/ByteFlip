export default function ByteMeter({ solved = 0, total = 0, color = '#1C1F2E', size = 'sm' }) {
  const bits = 8
  const filled = total > 0 ? Math.round((solved / total) * bits) : 0
  const dim = size === 'lg' ? 8 : 5
  const gap = size === 'lg' ? 3 : 2
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center' }} aria-hidden="true">
      {Array.from({ length: bits }).map((_, i) => (
        <div key={i} style={{
          width: dim, height: dim, borderRadius: 1,
          background: i < filled ? color : 'transparent',
          border: `1px solid ${i < filled ? color : '#D9D8D2'}`,
        }} />
      ))}
    </div>
  )
}