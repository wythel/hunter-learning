import { motion } from 'framer-motion';

const WHITE_W = 28;
const WHITE_H = 110;
const BLACK_W = 18;
const BLACK_H = 68;

/**
 * Piano renders a tappable keyboard.
 *
 * Props:
 *  - whites: [{ midi, letter, solfege, id }]
 *  - blacks: [{ midi, afterWhite }]
 *  - answerMidi: midi of the correct key (highlights green when revealed)
 *  - wrongMidi:  midi of the user's wrong tap (highlights red)
 *  - tappedMidi: midi the user just tapped (waiting feedback)
 *  - revealCorrect: whether to glow the correct answer (after a wrong tap or for teaching)
 *  - highlightMidis: extra keys to softly highlight (used by Teaching screen)
 *  - showLabels: 'all' | 'do' | 'none'
 *  - onTap(midi): tap handler (no-op if not provided)
 */
export default function Piano({
  whites,
  blacks,
  answerMidi    = null,
  wrongMidi     = null,
  tappedMidi    = null,
  revealCorrect = false,
  highlightMidis = [],
  showLabels    = 'all',
  onTap,
}) {
  const width  = whites.length * WHITE_W;
  const height = WHITE_H + 4;
  const interactive = typeof onTap === 'function';

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      style={{ maxWidth: width, display: 'block' }}
    >
      {/* White keys */}
      {whites.map((w, i) => {
        const x = i * WHITE_W;
        const isAnswer  = w.midi === answerMidi;
        const isWrong   = w.midi === wrongMidi;
        const isHighlit = highlightMidis.includes(w.midi);
        const showGlow  = revealCorrect && isAnswer;

        let fill = '#fafafa';
        let stroke = 'rgba(20,20,30,0.85)';
        if (isWrong)        { fill = '#ffd9d9'; stroke = '#f85149'; }
        else if (showGlow)  { fill = '#c8f7d8'; stroke = '#12b886'; }
        else if (isHighlit) { fill = '#e8e9ff'; stroke = '#818cf8'; }

        return (
          <motion.g
            key={`w-${w.midi}`}
            whileTap={interactive ? { scale: 0.94 } : undefined}
            style={{ originX: `${x + WHITE_W / 2}px`, originY: `${WHITE_H}px`, cursor: interactive ? 'pointer' : 'default' }}
            onClick={interactive ? () => onTap(w.midi) : undefined}
          >
            <rect
              x={x + 0.5}
              y={0.5}
              width={WHITE_W - 1}
              height={WHITE_H}
              rx={3}
              ry={3}
              fill={fill}
              stroke={stroke}
              strokeWidth="1"
            />
            {showLabels !== 'none' && (showLabels === 'all' || w.letter === 'C') && (
              <text
                x={x + WHITE_W / 2}
                y={WHITE_H - 8}
                textAnchor="middle"
                fontSize="10"
                fontWeight="800"
                fill={w.letter === 'C' ? '#818cf8' : '#4a5568'}
                style={{ pointerEvents: 'none' }}
              >
                {w.letter}
              </text>
            )}
            {showGlow && (
              <text
                x={x + WHITE_W / 2}
                y={20}
                textAnchor="middle"
                fontSize="14"
                style={{ pointerEvents: 'none' }}
              >
                ✓
              </text>
            )}
          </motion.g>
        );
      })}

      {/* Black keys, drawn on top */}
      {blacks.map(b => {
        const cx = (b.afterWhite + 1) * WHITE_W;
        const x  = cx - BLACK_W / 2;
        return (
          <rect
            key={`b-${b.midi}`}
            x={x}
            y={0}
            width={BLACK_W}
            height={BLACK_H}
            rx={2}
            ry={2}
            fill="#1a1a25"
            stroke="rgba(0,0,0,0.9)"
            strokeWidth="1"
            style={{ pointerEvents: 'none' }}
          />
        );
      })}
    </svg>
  );
}
