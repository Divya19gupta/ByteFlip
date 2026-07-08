const TOPIC_COLORS = {
  'Solve Problems on Arrays': '#C85E38',
  'Binary Search': '#534AB7',
  'Dynamic Programming': '#1D9E75',
  'Graphs': '#D85A30',
  'Learn LinkedList': '#D4537E',
  'Binary Trees': '#185FA5',
  'Stack and Queues': '#639922',
  'Recursion': '#993C1D',
  'Strings': '#0F6E56',
  'Heaps': '#7F77DD',
  'Greedy Algorithms': '#854F0B',
  'Bit Manipulation': '#3C3489',
  'Binary Search Trees': '#3B6D11',
  'Learn the basics': '#888',
  'Learn Important Sorting': '#C85E38',
}

export { TOPIC_COLORS }

export default function Navbar({ current, onNavigate }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '16px 32px', background: '#fff', borderBottom: '1px solid #EBEBEB',
      position: 'sticky', top: 0, zIndex: 100
    }}>
      <div
        onClick={() => onNavigate('home')}
        style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px', cursor: 'pointer', color: '#1C1F2E' }}
      >
        Byte<span style={{ color: '#C85E38' }}>Flip</span>
      </div>
      <div style={{ display: 'flex', gap: 4, background: '#F3F3F1', borderRadius: 9, padding: 3 }}>
        {['problems', 'revision'].map(p => (
          <div
            key={p}
            onClick={() => onNavigate(p)}
            style={{
              padding: '7px 20px', borderRadius: 7, fontSize: 13, fontWeight: 500,
              cursor: 'pointer', textTransform: 'capitalize',
              background: current === p ? '#fff' : 'transparent',
              color: current === p ? '#1C1F2E' : '#888',
              boxShadow: current === p ? '0 1px 2px rgba(0,0,0,.06)' : 'none',
              transition: 'all .15s'
            }}
          >
            {p}
          </div>
        ))}
      </div>
    </nav>
  )
}