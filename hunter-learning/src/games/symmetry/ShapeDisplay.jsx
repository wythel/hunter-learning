// ShapeDisplay.jsx — SVG shape viewer for mode 1
// Each shape renders in a 50×50 viewBox, kid-friendly colors

const COLORS = ['#f9896b', '#74c7ec', '#a6e3a1', '#fab387', '#cba6f7', '#89b4fa', '#f38ba8', '#94e2d5'];

// Shape definitions — path or primitive SVG, plus metadata
export const SHAPES = [
  {
    id: 'circle',
    label: '圓形',
    symmetric: true,
    axis: 'both',
    color: '#74c7ec',
    render: () => <circle cx="25" cy="25" r="20" />,
  },
  {
    id: 'square',
    label: '正方形',
    symmetric: true,
    axis: 'both',
    color: '#a6e3a1',
    render: () => <rect x="5" y="5" width="40" height="40" rx="2" />,
  },
  {
    id: 'rectangle',
    label: '長方形',
    symmetric: true,
    axis: 'both',
    color: '#89b4fa',
    render: () => <rect x="3" y="12" width="44" height="26" rx="2" />,
  },
  {
    id: 'equilateral-triangle',
    label: '等邊三角形',
    symmetric: true,
    axis: 'vertical',
    color: '#f9896b',
    render: () => <polygon points="25,4 46,44 4,44" />,
  },
  {
    id: 'hexagon',
    label: '正六邊形',
    symmetric: true,
    axis: 'both',
    color: '#fab387',
    render: () => <polygon points="25,4 44,14.5 44,35.5 25,46 6,35.5 6,14.5" />,
  },
  {
    id: 'heart',
    label: '愛心',
    symmetric: true,
    axis: 'vertical',
    color: '#f38ba8',
    render: () => (
      <path d="M25,40 C25,40 6,28 6,17 C6,10 12,5 18,8 C21,9 23,12 25,14 C27,12 29,9 32,8 C38,5 44,10 44,17 C44,28 25,40 25,40Z" />
    ),
  },
  {
    id: 'diamond',
    label: '菱形',
    symmetric: true,
    axis: 'both',
    color: '#cba6f7',
    render: () => <polygon points="25,3 47,25 25,47 3,25" />,
  },
  {
    id: 'star',
    label: '星形',
    symmetric: true,
    axis: 'vertical',
    color: '#f9e2af',
    render: () => (
      <polygon points="25,3 30,18 46,18 33,28 38,44 25,34 12,44 17,28 4,18 20,18" />
    ),
  },
  {
    id: 'isosceles-triangle',
    label: '等腰三角形',
    symmetric: true,
    axis: 'vertical',
    color: '#94e2d5',
    render: () => <polygon points="25,5 42,45 8,45" />,
  },
  // Non-symmetric shapes
  {
    id: 'scalene-triangle',
    label: '不等邊三角形',
    symmetric: false,
    color: '#eba0ac',
    render: () => <polygon points="8,42 38,42 18,8" />,
  },
  {
    id: 'irregular-quad',
    label: '不規則四邊形',
    symmetric: false,
    color: '#cdd6f4',
    render: () => <polygon points="5,38 42,44 46,12 20,6" />,
  },
  {
    id: 'l-shape',
    label: 'L形',
    symmetric: false,
    color: '#b4befe',
    render: () => <polygon points="8,6 20,6 20,38 44,38 44,46 8,46" />,
  },
  {
    id: 'z-shape',
    label: 'Z形',
    symmetric: false,
    color: '#f2cdcd',
    render: () => (
      <polygon points="6,6 44,6 44,18 18,18 18,34 44,34 44,46 6,46 6,34 32,34 32,18 6,18" />
    ),
  },
  {
    id: 's-shape',
    label: 'S形',
    symmetric: false,
    color: '#a6adc8',
    render: () => (
      <path d="M32,6 C44,6 44,22 25,24 C6,26 6,40 18,44 C24,46 30,44 34,40" strokeWidth="7" stroke="currentColor" fill="none" strokeLinecap="round" />
    ),
  },
];

export function getSymmetricShapes() {
  return SHAPES.filter(s => s.symmetric);
}

export function getNonSymmetricShapes() {
  return SHAPES.filter(s => !s.symmetric);
}

export default function ShapeDisplay({ shape, size = 80, selected = false, feedback = null, onClick }) {
  const isCorrect = feedback === 'correct';
  const isWrong   = feedback === 'wrong';

  let borderColor = 'rgba(48, 54, 61, 0.8)';
  let bg          = 'rgba(22, 27, 34, 0.9)';
  let glowColor   = 'transparent';

  if (selected && isCorrect) {
    borderColor = '#12b886';
    bg          = 'rgba(18, 184, 134, 0.15)';
    glowColor   = 'rgba(18, 184, 134, 0.3)';
  } else if (selected && isWrong) {
    borderColor = '#f85149';
    bg          = 'rgba(248, 81, 73, 0.15)';
    glowColor   = 'rgba(248, 81, 73, 0.3)';
  } else if (isCorrect) {
    // correct but not selected — show the correct answer
    borderColor = '#12b886';
    bg          = 'rgba(18, 184, 134, 0.10)';
  }

  return (
    <button
      onClick={onClick}
      style={{
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            6,
        width:          size,
        height:         size,
        minWidth:       44,
        minHeight:      44,
        borderRadius:   16,
        border:         `2px solid ${borderColor}`,
        background:     bg,
        boxShadow:      glowColor !== 'transparent' ? `0 0 16px ${glowColor}` : 'none',
        cursor:         onClick ? 'pointer' : 'default',
        transition:     'all 0.15s ease',
        padding:        8,
        fontFamily:     'inherit',
      }}
    >
      <svg
        viewBox="0 0 50 50"
        width={size - 24}
        height={size - 24}
        style={{ display: 'block', overflow: 'visible' }}
      >
        <g fill={shape.color} stroke={shape.color} strokeWidth="0">
          {shape.render()}
        </g>
      </svg>
    </button>
  );
}
