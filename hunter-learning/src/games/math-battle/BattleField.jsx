import { motion, AnimatePresence } from 'framer-motion';

const STARS = Array.from({ length: 38 }, (_, i) => ({
  x: (i * 37 + 11) % 100,
  y: (i * 53 + 7) % 85,
  r: i % 4 === 0 ? 1.5 : i % 3 === 0 ? 1.2 : 0.8,
  opacity: 0.12 + (i % 7) * 0.06,
}));

export default function BattleField({
  monsterSvg, monsterName, monsterHP, monsterMaxHP,
  playerSvg, playerHP,
  monsterFlash, playerFlash,
  playerAttacking, monsterAttacking,
}) {
  const maxHP = monsterMaxHP ?? 3;

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Arena sky */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(180deg, #04020e 0%, #0b1222 55%, #121e38 100%)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '10px 20px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Stars */}
        {STARS.map((s, i) => (
          <div key={i} style={{
            position: 'absolute',
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.r * 2,
            height: s.r * 2,
            borderRadius: '50%',
            background: 'white',
            opacity: s.opacity,
            pointerEvents: 'none',
          }} />
        ))}

        {/* Center nebula glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 55% 40% at 50% 55%, rgba(13,207,170,0.055) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* ── Player side (left) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6, zIndex: 1 }}>
          {/* HP hearts */}
          <div style={{ display: 'flex', gap: 5 }}>
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={i === playerHP - 1 && playerFlash ? { scale: [1, 1.5, 1] } : {}}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: 20,
                  filter: i < playerHP
                    ? 'drop-shadow(0 0 5px rgba(255,60,60,0.85))'
                    : 'grayscale(1) opacity(0.25)',
                  lineHeight: 1,
                }}
              >
                ❤️
              </motion.div>
            ))}
          </div>

          {/* Player sprite */}
          <motion.div
            animate={
              playerAttacking
                ? { x: [0, 68, 0] }
                : playerFlash
                ? { x: [0, -10, 10, -8, 8, 0], opacity: [1, 0.3, 1, 0.3, 1] }
                : { y: [0, -5, 0] }
            }
            transition={
              playerAttacking || playerFlash
                ? { duration: 0.45 }
                : { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{
              filter: playerFlash
                ? 'drop-shadow(0 0 10px rgba(255,60,60,0.95)) brightness(1.2)'
                : 'drop-shadow(0 2px 8px rgba(0,200,170,0.45))',
            }}
            dangerouslySetInnerHTML={{ __html: playerSvg }}
          />
        </div>

        {/* ── Monster side (right) ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, zIndex: 1 }}>
          {/* Name badge + HP bar */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
            <div style={{
              background: 'rgba(8,18,34,0.88)',
              border: '1px solid rgba(77,171,247,0.28)',
              borderRadius: 8,
              padding: '3px 10px',
              fontSize: 11,
              fontWeight: 800,
              color: 'rgba(180,205,235,0.9)',
              letterSpacing: '0.04em',
              backdropFilter: 'blur(6px)',
            }}>
              {monsterName}
            </div>
            {/* HP bar track */}
            <div style={{
              width: 86,
              height: 9,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 5,
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.12)',
            }}>
              <motion.div
                animate={{ width: `${Math.max(0, (monsterHP / maxHP)) * 100}%` }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  height: '100%',
                  background: monsterHP > 1
                    ? 'linear-gradient(90deg, #12b886, #0dcfaa)'
                    : 'linear-gradient(90deg, #ff6b6b, #ee3333)',
                  borderRadius: 5,
                  boxShadow: monsterHP > 1
                    ? '0 0 6px rgba(18,184,134,0.6)'
                    : '0 0 6px rgba(255,60,60,0.6)',
                }}
              />
            </div>
          </div>

          {/* Monster sprite */}
          <motion.div
            animate={
              monsterFlash
                ? { x: [0, -5, 5, -4, 0], opacity: [1, 0.2, 1, 0.2, 1] }
                : monsterAttacking
                ? { x: [0, -62, 0] }
                : { y: [0, -5, 0] }
            }
            transition={
              monsterFlash || monsterAttacking
                ? { duration: 0.45 }
                : { duration: 2.2, repeat: Infinity, ease: 'easeInOut' }
            }
            style={{
              filter: monsterFlash
                ? 'drop-shadow(0 0 14px rgba(255,60,60,1)) brightness(1.6) saturate(0.3)'
                : 'drop-shadow(0 2px 10px rgba(0,0,0,0.6))',
            }}
            dangerouslySetInnerHTML={{ __html: monsterSvg }}
          />
        </div>

        {/* ── Attack energy streaks ── */}
        <AnimatePresence>
          {playerAttacking && (
            <motion.div
              key="player-streak"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                left: '28%',
                top: '46%',
                width: '38%',
                height: 3,
                background: 'linear-gradient(90deg, #00ffcc, rgba(0,255,200,0))',
                transformOrigin: 'left',
                borderRadius: 3,
                boxShadow: '0 0 8px rgba(0,255,200,0.7)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          )}
          {monsterAttacking && (
            <motion.div
              key="monster-streak"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{
                position: 'absolute',
                right: '28%',
                top: '46%',
                width: '38%',
                height: 3,
                background: 'linear-gradient(270deg, #ff6b6b, rgba(255,60,60,0))',
                transformOrigin: 'right',
                borderRadius: 3,
                boxShadow: '0 0 8px rgba(255,60,60,0.7)',
                pointerEvents: 'none',
                zIndex: 2,
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Crystal ground platform */}
      <div style={{
        height: 36,
        background: 'linear-gradient(180deg, #162050 0%, #0c1438 100%)',
        position: 'relative',
      }}>
        {/* Glowing top edge */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 2,
          background: 'linear-gradient(90deg, transparent 0%, #4dabf7 15%, #12b886 40%, #0dcfaa 60%, #4dabf7 85%, transparent 100%)',
          opacity: 0.7,
        }} />
        {/* Ground highlight strip */}
        <div style={{
          position: 'absolute',
          top: 2, left: 0, right: 0,
          height: 6,
          background: 'linear-gradient(180deg, rgba(77,171,247,0.15) 0%, transparent 100%)',
        }} />
      </div>
    </div>
  );
}
