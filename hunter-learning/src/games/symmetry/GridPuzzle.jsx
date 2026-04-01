// GridPuzzle.jsx — Interactive 5×5 symmetry grid for mode 2
// Column indices: 0,1 = left (read-only, teal), 2 = axis, 3,4 = right (clickable)
// Mirror: col 0 <-> col 4, col 1 <-> col 3

import { Text } from '@mantine/core';

const CELL_SIZE = 52; // px — touch-friendly

function mirrorCol(col) {
  if (col === 0) return 4;
  if (col === 1) return 3;
  if (col === 3) return 1;
  if (col === 4) return 0;
  return col;
}

export default function GridPuzzle({ pattern, userGrid, onCellClick, cellFeedback }) {
  // pattern: boolean[5][2] — left half [row][col 0-1]
  // userGrid: boolean[5][2] — right half [row][col 3-4] → stored as [row][0]=col3, [row][1]=col4
  // cellFeedback: { [row-col]: 'correct'|'wrong' }

  return (
    <div
      style={{
        display:        'grid',
        gridTemplateColumns: `repeat(5, ${CELL_SIZE}px)`,
        gridTemplateRows:    `repeat(5, ${CELL_SIZE}px)`,
        gap:            4,
        userSelect:     'none',
      }}
    >
      {Array.from({ length: 5 }, (_, row) =>
        Array.from({ length: 5 }, (_, col) => {
          const key = `${row}-${col}`;

          // Axis column
          if (col === 2) {
            return (
              <div
                key={key}
                style={{
                  width:          CELL_SIZE,
                  height:         CELL_SIZE,
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  position:       'relative',
                }}
              >
                <div
                  style={{
                    position:  'absolute',
                    top:       0,
                    bottom:    0,
                    left:      '50%',
                    transform: 'translateX(-50%)',
                    width:     2,
                    background: 'repeating-linear-gradient(to bottom, #12b886 0px, #12b886 6px, transparent 6px, transparent 12px)',
                  }}
                />
              </div>
            );
          }

          // Left side (cols 0,1) — read-only, pre-filled
          if (col < 2) {
            const filled = pattern[row][col];
            return (
              <div
                key={key}
                style={{
                  width:        CELL_SIZE,
                  height:       CELL_SIZE,
                  borderRadius: 8,
                  background:   filled ? 'rgba(18,184,134,0.75)' : 'rgba(48,54,61,0.35)',
                  border:       filled
                    ? '2px solid rgba(18,184,134,0.9)'
                    : '2px solid rgba(48,54,61,0.5)',
                  transition:   'background 0.1s',
                }}
              />
            );
          }

          // Right side (cols 3,4) — clickable
          // userGrid[row][0] = col3, userGrid[row][1] = col4
          const rightIdx   = col - 3;  // col3→0, col4→1
          const isFilled   = userGrid[row][rightIdx];
          const fbKey      = `${row}-${rightIdx}`;
          const fb         = cellFeedback ? cellFeedback[fbKey] : null;

          let bg     = isFilled ? 'rgba(18,184,134,0.55)'  : 'rgba(48,54,61,0.35)';
          let border = isFilled ? '2px solid rgba(18,184,134,0.8)' : '2px solid rgba(48,54,61,0.5)';

          if (fb === 'correct') {
            bg     = 'rgba(18,184,134,0.85)';
            border = '2px solid #12b886';
          } else if (fb === 'wrong') {
            bg     = 'rgba(248,81,73,0.55)';
            border = '2px solid #f85149';
          }

          return (
            <button
              key={key}
              onClick={() => onCellClick(row, rightIdx)}
              style={{
                width:        CELL_SIZE,
                height:       CELL_SIZE,
                borderRadius: 8,
                background:   bg,
                border,
                cursor:       'pointer',
                transition:   'background 0.12s, border-color 0.12s',
                minWidth:     44,
                minHeight:    44,
                padding:      0,
              }}
            />
          );
        })
      )}
    </div>
  );
}
