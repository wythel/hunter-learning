import { motion } from 'framer-motion';

// Vertical step per staffPos unit (line↔space step).
const STEP = 6;
// y of the bottom line (staffPos 0).
const BASE_Y = 80;

const STAFF_X_START = 56;
const STAFF_X_END   = 254;
const NOTE_X        = 170;

function trebleClefPath() {
  // Stylised treble clef using a path. Approximated — not perfect typography
  // but reads clearly as a G clef.
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
  // Stylised bass (F) clef.
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

function NoteHead({ staffPos, clef, color = '#ffffff', accent = '#818cf8' }) {
  const y = BASE_Y - staffPos * STEP;
  const stemUp = staffPos < 4; // notes below middle line: stem up
  const stemX  = stemUp ? NOTE_X + 8 : NOTE_X - 8;
  const stemY1 = y;
  const stemY2 = stemUp ? y - 30 : y + 30;

  // Ledger lines if note is far above/below staff (not used in current ranges
  // but harmless to keep).
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
        <line key={i} x1={NOTE_X - 13} y1={ly} x2={NOTE_X + 13} y2={ly}
              stroke={color} strokeWidth="1.5" strokeLinecap="round" />
      ))}
      {/* Stem */}
      <line x1={stemX} y1={stemY1} x2={stemX} y2={stemY2}
            stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      {/* Notehead */}
      <ellipse
        cx={NOTE_X}
        cy={y}
        rx="7.5"
        ry="5.5"
        transform={`rotate(-22 ${NOTE_X} ${y})`}
        fill={accent}
        stroke={color}
        strokeWidth="1.2"
      />
    </g>
  );
}

/**
 * Staff renders the 5-line staff with a clef and an optional note.
 * - clef: 'treble' | 'bass'
 * - note: { staffPos, clef } | null
 * - accent: optional note colour (defaults to indigo)
 */
export default function Staff({ clef, note, accent = '#818cf8', width = 280, height = 140 }) {
  const lineColor = 'rgba(220,230,245,0.85)';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: 'block', color: lineColor }}
    >
      {/* 5 staff lines (top at y = BASE_Y - 8*STEP = 32, bottom at 80) */}
      {[0, 1, 2, 3, 4].map(i => {
        const y = BASE_Y - i * 2 * STEP;
        return (
          <line key={i}
                x1={STAFF_X_START} y1={y}
                x2={STAFF_X_END}   y2={y}
                stroke={lineColor} strokeWidth="1.4" strokeLinecap="round" />
        );
      })}

      {/* Clef symbol */}
      {clef === 'treble' ? trebleClefPath() : bassClefPath()}

      {/* Note */}
      {note && (
        <motion.g
          key={`${note.clef}-${note.id}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <NoteHead staffPos={note.staffPos} clef={clef} color={lineColor} accent={accent} />
        </motion.g>
      )}
    </svg>
  );
}
