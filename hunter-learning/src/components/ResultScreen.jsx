import { Stack, Text, Group } from '@mantine/core';
import { motion } from 'framer-motion';
import StarField from './StarField';

// Tier styling per star count
const TIER = {
  3: { grad: 'linear-gradient(135deg,#ffd700,#ffaa00)', glow: 'rgba(255,215,0,0.35)',   ring: 'rgba(255,215,0,0.22)',   label: '金' },
  2: { grad: 'linear-gradient(135deg,#c8d6e5,#8395a7)', glow: 'rgba(180,200,220,0.28)', ring: 'rgba(180,200,220,0.15)', label: '銀' },
  1: { grad: 'linear-gradient(135deg,#cd8a3a,#9c5f1d)', glow: 'rgba(205,138,58,0.28)',  ring: 'rgba(205,138,58,0.15)',  label: '銅' },
  0: { grad: 'linear-gradient(135deg,#6e7681,#4a5568)', glow: 'rgba(110,118,129,0.2)',  ring: 'rgba(110,118,129,0.1)',  label: '' },
};

const starVariants = {
  hidden:  { scale: 0, rotate: -45, opacity: 0 },
  visible: i => ({
    scale: 1, rotate: 0, opacity: 1,
    transition: { delay: 0.25 + i * 0.18, type: 'spring', stiffness: 420, damping: 14 },
  }),
};

export default function ResultScreen({ title, stars, stats, onRetry, onMenu, onLobby }) {
  const tier = TIER[Math.min(stars, 3)] ?? TIER[0];

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 20px',
      paddingTop: 'max(24px, env(safe-area-inset-top))',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      position: 'relative',
    }}>
      <StarField />

      <motion.div
        initial={{ opacity: 0, scale: 0.82, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        transition={{ duration: 0.45, type: 'spring', stiffness: 280, damping: 24 }}
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >
        {/* Outer glow ring */}
        <div style={{
          borderRadius: 28,
          background: 'rgba(10,22,38,0.95)',
          border: `1px solid rgba(26,44,61,0.9)`,
          backdropFilter: 'blur(18px)',
          boxShadow: `0 0 60px ${tier.ring}, 0 12px 48px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset`,
          padding: '28px 24px 24px',
          overflow: 'hidden',
          position: 'relative',
        }}>
          {/* Tier colour bloom at top */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 120,
            background: `radial-gradient(ellipse 80% 100% at 50% 0%, ${tier.ring} 0%, transparent 100%)`,
            pointerEvents: 'none',
          }} />

          <Stack gap={22} align="center" style={{ position: 'relative' }}>

            {/* Stars */}
            <Group gap={10} justify="center">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  custom={i}
                  variants={starVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Text style={{
                    fontSize: 52,
                    filter: i < stars
                      ? `drop-shadow(0 0 14px ${tier.glow})`
                      : 'grayscale(1) opacity(0.22)',
                    lineHeight: 1,
                  }}>
                    ⭐
                  </Text>
                </motion.div>
              ))}
            </Group>

            {/* Title */}
            <div style={{
              fontSize: 26, fontWeight: 900,
              background: tier.grad,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              textAlign: 'center',
            }}>
              {title}
            </div>

            {/* Stats */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {stats.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(26,44,61,0.8)',
                  borderRadius: 12, padding: '10px 16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Text style={{ fontSize: 18 }}>{s.icon}</Text>
                    <Text size="sm" style={{ color: 'rgba(139,163,190,0.8)', fontWeight: 600 }}>{s.label}</Text>
                  </div>
                  <Text style={{ fontWeight: 800, fontSize: 15, color: '#12b886' }}>{s.value}</Text>
                </div>
              ))}
            </div>

            {/* Buttons */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* Retry — primary */}
              <motion.button
                whileTap={{ scale: 0.96 }}
                onClick={onRetry}
                style={{
                  width: '100%', padding: '15px 0',
                  borderRadius: 16, border: 'none',
                  background: 'linear-gradient(135deg, #12b886, #0ca678)',
                  color: '#fff', fontSize: 17, fontWeight: 900,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 4px 20px rgba(18,184,134,0.4)',
                  position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.12) 50%, transparent 70%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2.4s ease infinite',
                  pointerEvents: 'none',
                }} />
                🔄 再玩一次
              </motion.button>

              {/* Secondary row */}
              <div style={{ display: 'flex', gap: 10 }}>
                {[
                  { label: '⚙️ 設定', onClick: onMenu  },
                  { label: '🏠 大廳', onClick: onLobby },
                ].map(btn => (
                  <motion.button
                    key={btn.label}
                    whileTap={{ scale: 0.96 }}
                    onClick={btn.onClick}
                    style={{
                      flex: 1, padding: '13px 0',
                      borderRadius: 16,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1.5px solid rgba(26,44,61,0.9)',
                      color: 'rgba(139,163,190,0.85)', fontSize: 15, fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {btn.label}
                  </motion.button>
                ))}
              </div>
            </div>

          </Stack>
        </div>
      </motion.div>
    </div>
  );
}
