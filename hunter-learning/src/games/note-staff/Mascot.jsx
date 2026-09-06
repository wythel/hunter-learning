import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SOLFEGE_COLOR } from './notes';
import { JIGGLYPUFF } from './sprites';

// 胖丁在音符星球當小老師:平常輕輕飄浮,
// 答對時跳起來唱出音名,答錯時搖搖頭告訴你正確答案。

export default function Mascot({ feedback = null, solfege, size = 76 }) {
  const [broken, setBroken] = useState(false);
  if (broken) return null;

  const color = feedback === 'correct' ? (SOLFEGE_COLOR[solfege] || '#818cf8') : '#f85149';

  const animate =
    feedback === 'correct' ? { y: [0, -20, 0], scale: [1, 1.14, 1] }
    : feedback === 'wrong' ? { x: [0, -6, 6, -5, 5, 0], rotate: [0, -5, 5, -4, 4, 0] }
    : { y: [0, -5, 0] };

  const transition = feedback
    ? { duration: feedback === 'correct' ? 0.5 : 0.45 }
    : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' };

  return (
    <div style={{ position: 'relative', width: size, height: size, pointerEvents: 'none' }}>
      {/* 說話泡泡:答對唱音名,答錯公布答案 */}
      <AnimatePresence>
        {feedback && solfege && (
          <motion.div
            key={`${feedback}-${solfege}`}
            initial={{ opacity: 0, scale: 0.6, x: 8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            style={{
              position: 'absolute',
              right: size - 12,
              top: 4,
              padding: '5px 10px',
              borderRadius: 12,
              whiteSpace: 'nowrap',
              background: 'rgba(10,22,38,0.95)',
              border: `1.5px solid ${color}`,
              color,
              fontSize: 13,
              fontWeight: 900,
              boxShadow: `0 0 14px ${color}55`,
            }}
          >
            {feedback === 'correct' ? `♪ ${solfege}` : `是 ${solfege}`}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        animate={animate}
        transition={transition}
        style={{
          filter: feedback === 'correct'
            ? `drop-shadow(0 0 12px ${color}aa)`
            : 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))',
        }}
      >
        <img
          src={JIGGLYPUFF.img}
          alt={JIGGLYPUFF.name}
          draggable={false}
          onError={() => setBroken(true)}
          style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
        />
      </motion.div>
    </div>
  );
}
