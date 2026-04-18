import { motion } from 'framer-motion';

const NUM_LAYOUT = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['back', '0', 'ok'],
];

export default function BattleUI({ question, answer, currentQ, count, onKey, locked }) {
  const progress = count > 0 ? currentQ / count : 0;

  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(6,12,24,0.98) 0%, rgba(4,8,18,1) 100%)',
      borderTop: '1px solid rgba(77,171,247,0.18)',
      padding: '10px 16px',
      paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
    }}>
      {/* Progress bar */}
      <div style={{
        height: 3,
        background: 'rgba(255,255,255,0.06)',
        borderRadius: 2,
        marginBottom: 10,
        overflow: 'hidden',
      }}>
        <motion.div
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: 'linear-gradient(90deg, #12b886, #4dabf7)',
            borderRadius: 2,
            boxShadow: '0 0 6px rgba(18,184,134,0.5)',
          }}
        />
      </div>

      {/* Progress label + question */}
      <div style={{ textAlign: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 11, color: 'rgba(139,163,190,0.55)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: 4 }}>
          第 {currentQ + 1} / {count} 題
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: '#e6edf3', letterSpacing: '0.02em' }}>
            {question} =
          </span>
          <span style={{
            fontSize: 24,
            fontWeight: 900,
            color: answer ? '#e6edf3' : '#12b886',
            textShadow: answer ? 'none' : '0 0 14px rgba(18,184,134,0.7)',
            minWidth: 32,
            textAlign: 'left',
          }}>
            {answer || '?'}
          </span>
        </div>
      </div>

      {/* Numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
        {NUM_LAYOUT.flat().map(key => {
          const isOk = key === 'ok';
          const isBack = key === 'back';
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9 }}
              disabled={locked}
              onClick={() => onKey(key)}
              style={{
                height: 48,
                borderRadius: 13,
                border: isOk
                  ? '1.5px solid rgba(18,184,134,0.7)'
                  : isBack
                  ? '1.5px solid rgba(255,100,100,0.4)'
                  : '1.5px solid rgba(50,75,110,0.7)',
                background: isOk
                  ? 'linear-gradient(145deg, rgba(18,184,134,0.28), rgba(13,207,170,0.15))'
                  : isBack
                  ? 'rgba(50,18,18,0.85)'
                  : 'rgba(14,22,40,0.92)',
                color: isOk
                  ? '#12b886'
                  : isBack
                  ? '#f87171'
                  : '#d6e4f7',
                fontSize: isOk ? 14 : isBack ? 20 : 22,
                fontWeight: isOk ? 900 : 700,
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.55 : 1,
                fontFamily: 'inherit',
                boxShadow: isOk
                  ? '0 0 14px rgba(18,184,134,0.2), inset 0 0 8px rgba(18,184,134,0.07)'
                  : 'none',
                letterSpacing: isOk ? '0.02em' : '0',
                transition: 'opacity 0.15s',
              }}
            >
              {isBack ? '⌫' : isOk ? '確定' : key}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
