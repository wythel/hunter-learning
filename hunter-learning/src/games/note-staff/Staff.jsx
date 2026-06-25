import { motion } from 'framer-motion';

// Vertical step per staffPos unit (line↔space step).
const STEP = 6;
// y of the bottom line (staffPos 0).
const BASE_Y = 80;

const STAFF_X_START = 56;
const STAFF_X_END   = 254;
const NOTE_X_CENTER = 170;
const NOTE_X_SPACING = 56;

// Status → fill colour for the notehead.
const STATUS_COLORS = {
  current: null,                  // use `accent` from props
  correct: '#12b886',
  wrong:   '#f85149',
  pending: 'rgba(170,185,210,0.45)',
};

function trebleClefPath() {
  return (
    <g transform="translate(20,30) scale(0.072)">
      <path
        d="M250 0
           C 180 60, 120 130, 130 240
           C 138 320, 215 360, 260 320
           C 305 280, 305 215, 250 200
           C 195 185, 165 245, 195 290
           C 220 325, 285 320, 305 280
           C 330 230, 290 165, 235 195
           C 200 215, 195 270, 230 295
           M 235 0
           L 200 540
           C 195 575, 220 595, 245 580
           C 270 565, 265 535, 240 525
           C 215 515, 200 540, 220 555"
        fill="none"
        stroke="currentColor"
        strokeWidth="14"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="232" cy="565" r="14" fill="currentColor" />
    </g>
  );
}

function bassClefPath() {
  return (
    <g transform="translate(22,38) scale(0.085)">
      <path
        d="M 60 60
           C 60 20, 130 0, 180 40
           C 240 90, 245 240, 180 320
           C 140 370, 80 380, 50 360"
        fill="none"
        stroke="currentColor"
        strokeWidth="32"
        strokeLinecap="round"
      />
      <circle cx="65" cy="65" r="22" fill="currentColor" />
      <circle cx="240" cy="100" r="14" fill="currentColor" />
      <circle cx="240" cy="170" r="14" fill="currentColor" />
    </g>
  );
}

function NoteHead({ x, staffPos, lineColor, fill, isCurrent }) {
  const y = BASE_Y - staffPos * STEP;
  const stemUp = staffPos < 4;
  const stemX  = stemUp ? x + 8 : x - 8;
  const stemY2 = stemUp ? y - 30 : y + 30;

  const ledgers = [];
  for (let p = -2; p >= staffPos; p -= 2) {
    ledgers.push(BASE_Y - p * STEP);
  }
  for (let p = 10; p <= staffPos; p += 2) {
    ledgers.push(BASE_Y - p * STEP);
  }

  return (
    <g>
      {ledgers.map((ly, i) => (
        <line key={i} x1={x - 13} y1={ly} x2={x + 13} y2={ly}
              stroke={lineColor} strokeWidth="1.5" strokeLinecap="round" />
      ))}
      <line x1={stemX} y1={y} x2={stemX} y2={stemY2}
            stroke={lineColor} strokeWidth="1.8" strokeLinecap="round" />
      <ellipse
        cx={x} cy={y} rx="7.5" ry="5.5"
        transform={`rotate(-22 ${x} ${y})`}
        fill={fill}
        stroke={lineColor}
        strokeWidth="1.2"
      />
      {/* Pulse ring on the current note in a multi-note question */}
      {isCurrent && (
        <motion.circle
          cx={x} cy={y}
          r={12}
          fill="none"
          stroke={fill}
          strokeWidth="2"
          initial={{ opacity: 0.7, scale: 0.8 }}
          animate={{ opacity: [0.7, 0, 0.7], scale: [0.8, 1.6, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          style={{ transformOrigin: `${x}px ${y}px` }}
        />
      )}
    </g>
  );
}

function noteX(idx, total) {
  if (total <= 1) return NOTE_X_CENTER;
  const start = NOTE_X_CENTER - ((total - 1) * NOTE_X_SPACING) / 2;
  return start + idx * NOTE_X_SPACING;
}

/**
 * Staff renders the 5-line staff with a clef and a sequence of notes.
 *
 * Props:
 *  - clef: 'treble' | 'bass'
 *  - notes: array of { staffPos, id, clef }
 *  - note:  (legacy) single note — treated as notes=[note]
 *  - currentIdx: which note in `notes` is being answered now (default 0)
 *  - statuses: optional array of 'pending' | 'current' | 'correct' | 'wrong'
 *              (same length as notes). If omitted, the currentIdx note is
 *              'current' and the rest are 'pending'.
 *  - showPulse: whether to draw the pulsing ring around the current note
 *  - accent: notehead colour for the currently-being-answered note
 */
export default function Staff({
  clef,
  notes,
  note,
  currentIdx = 0,
  statuses,
  showPulse = false,
  accent = '#818cf8',
  width = 280,
  height = 140,
}) {
  const lineColor = 'rgba(220,230,245,0.85)';
  const list = notes ?? (note ? [note] : []);
  const total = list.length;

  const resolvedStatuses = statuses ?? list.map((_, i) =>
    i === currentIdx ? 'current' : 'pending'
  );

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: 'block', color: lineColor }}
    >
      {/* 5 staff lines */}
      {[0, 1, 2, 3, 4].map(i => {
        const y = BASE_Y - i * 2 * STEP;
        return (
          <line key={i}
                x1={STAFF_X_START} y1={y}
                x2={STAFF_X_END}   y2={y}
                stroke={lineColor} strokeWidth="1.4" strokeLinecap="round" />
        );
      })}

      {clef === 'treble' ? trebleClefPath() : bassClefPath()}

      {list.map((n, i) => {
        const status = resolvedStatuses[i] ?? 'pending';
        const fill = status === 'current'
          ? accent
          : STATUS_COLORS[status] ?? STATUS_COLORS.pending;
        return (
          <motion.g
            key={`${n.clef}-${n.id}-${i}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut', delay: i * 0.05 }}
          >
            <NoteHead
              x={noteX(i, total)}
              staffPos={n.staffPos}
              lineColor={lineColor}
              fill={fill}
              isCurrent={showPulse && status === 'current'}
            />
          </motion.g>
        );
      })}
    </svg>
  );
}
