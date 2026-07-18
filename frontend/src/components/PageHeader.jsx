export default function PageHeader({ eyebrow, title, subtitle, right }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
      marginBottom: 36, paddingBottom: 20, borderBottom: '1px solid #EBEBEB', gap: 24, flexWrap: 'wrap'
    }}>
      <div>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 500,
          color: '#C85E38', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: 10
        }}>
          {eyebrow}
        </div>
        <div style={{ fontSize: 30, fontWeight: 700, color: '#1C1F2E', letterSpacing: '-0.6px', marginBottom: subtitle ? 6 : 0 }}>
          {title}
        </div>
        {subtitle && <div style={{ fontSize: 14, color: '#8B8B85' }}>{subtitle}</div>}
      </div>
      {right && <div>{right}</div>}
    </div>
  )
}