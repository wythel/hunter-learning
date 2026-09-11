import { useState } from 'react';
// motion 只在 JSX 裡當標籤用,這份 flat config 沒有 jsx-uses-vars 認不得,是誤報
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { pokemonSprite } from '../../utils/pokemon';

// 直式計算每題配一隻夥伴(名單來自算數大戰的進化池)。
// 平常輕輕浮著,填對一位彈一下,按錯搖頭,整題填完跳起來被收服;
// 限時逾時那題則變灰淡出——沒收服到。
export default function Buddy({
  monster,
  filled = 0,
  wrongShake = 0,
  celebrating = false,
  fainted = false,
  size = 'min(72px, 17vw)',
}) {
  const [broken, setBroken] = useState(false);
  if (!monster || broken) return null;

  return (
    <div style={{
      position: 'relative', width: size, flexShrink: 1, minWidth: 0,
      pointerEvents: 'none', textAlign: 'center',
    }}>
      {/* 收服泡泡:整題填完才冒出來 */}
      <AnimatePresence>
        {celebrating && !fainted && (
          <motion.div
            key="caught"
            initial={{ opacity: 0, scale: 0.6, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 20 }}
            style={{
              position: 'absolute', left: '50%', top: -6,
              transform: 'translateX(-50%)',
              padding: '4px 10px', borderRadius: 12, whiteSpace: 'nowrap',
              background: 'rgba(10,22,38,0.95)',
              border: '1.5px solid #12b886',
              color: '#12b886', fontSize: 13, fontWeight: 900,
              boxShadow: '0 0 14px rgba(18,184,134,0.45)',
              zIndex: 2,
            }}
          >
            收服！
          </motion.div>
        )}
      </AnimatePresence>

      {/* 按錯:搖頭 */}
      <motion.div
        key={`w${wrongShake}`}
        animate={wrongShake ? { x: [0, -6, 6, -5, 5, 0] } : {}}
        transition={{ duration: 0.35 }}
      >
        {/* 填對一位:彈一下 */}
        <motion.div
          key={`f${filled}`}
          animate={filled ? { scale: [1, 1.12, 1] } : {}}
          transition={{ duration: 0.25 }}
        >
          {/* 平常浮動,整題填完跳起來 */}
          <motion.div
            animate={celebrating ? { y: [0, -22, 0], scale: [1, 1.16, 1] } : { y: [0, -5, 0] }}
            transition={celebrating
              ? { duration: 0.55 }
              : { duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              filter: celebrating
                ? 'drop-shadow(0 0 14px rgba(18,184,134,0.7))'
                : 'drop-shadow(0 3px 8px rgba(0,0,0,0.5))',
            }}
          >
            <img
              src={monster.img}
              alt={monster.name}
              draggable={false}
              onError={() => setBroken(true)}
              style={{
                width: '100%', aspectRatio: '1', objectFit: 'contain', display: 'block',
                opacity: fainted ? 0.35 : 1,
                filter: fainted ? 'grayscale(1)' : 'none',
                transition: 'opacity 0.3s, filter 0.3s',
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      <div style={{
        marginTop: 2, fontSize: 11, fontWeight: 900,
        color: celebrating ? '#12b886' : 'rgba(139,163,190,0.8)',
        letterSpacing: '0.04em',
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {monster.name}
      </div>
    </div>
  );
}

// 收服排取代原本那條 3px 進度條,所以高度是 load-bearing:
// 遊戲畫面是 100dvh + overflow:hidden,這裡長高就會把數字鍵盤擠出畫面。有測試守著。
export const CAUGHT_ROW_HEIGHT = 24;

const slotSize = total => (total > 12 ? 16 : total > 8 ? 20 : 22);

// 一題一格:收服的亮出 96x96 經典 sprite(約 600 bytes),還沒收服的是灰點。
export function CaughtRow({ caught = [], total = 0 }) {
  const size = slotSize(total);
  const dot = Math.round(size * 0.42);

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      gap: 3, height: CAUGHT_ROW_HEIGHT,
    }}>
      {Array.from({ length: total }, (_, i) => {
        const m = caught[i];
        if (!m) {
          return (
            <div key={i} style={{
              width: dot, height: dot, borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
            }} />
          );
        }
        return (
          <motion.img
            key={i}
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 420, damping: 16 }}
            src={pokemonSprite(m.id)}
            alt={m.name}
            title={m.name}
            draggable={false}
            style={{
              width: size, height: size, objectFit: 'contain',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 0 4px rgba(18,184,134,0.55))',
            }}
          />
        );
      })}
    </div>
  );
}
