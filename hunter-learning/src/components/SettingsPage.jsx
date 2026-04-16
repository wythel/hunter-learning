import { Stack, Text } from '@mantine/core';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from './StarField';
import OptionGroup from './OptionGroup';

export default function SettingsPage({ title, icon, settings, onStart }) {
  const navigate = useNavigate();

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
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y:  0, scale: 1    }}
        transition={{ duration: 0.42, ease: [0.34, 1.56, 0.64, 1] }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(139,163,190,0.7)', fontSize: 14, fontWeight: 700,
            padding: '0 0 18px', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          ← 大廳
        </button>

        <Stack gap={20}>
          {/* Title block */}
          <div style={{ textAlign: 'center' }}>
            <motion.div
              animate={{ scale: [1, 1.09, 1] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 62, lineHeight: 1, marginBottom: 12 }}
            >
              {icon}
            </motion.div>
            <div style={{
              fontSize: 28, fontWeight: 900,
              background: 'linear-gradient(135deg, #12b886, #0dcfaa)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
            }}>
              {title}
            </div>
          </div>

          {/* Settings card */}
          <div style={{
            background: 'rgba(10,22,38,0.92)',
            border: '1px solid rgba(26,44,61,0.95)',
            borderRadius: 24, padding: '22px 20px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.35), 0 1px 0 rgba(255,255,255,0.04) inset',
          }}>
            <Stack gap={20}>
              {settings.map((s, i) => <OptionGroup key={i} {...s} />)}
            </Stack>
          </div>

          {/* Start button */}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={onStart}
            style={{
              width: '100%', padding: '18px 0',
              borderRadius: 20, border: 'none',
              background: 'linear-gradient(135deg, #12b886 0%, #0ca678 60%, #099268 100%)',
              color: '#fff', fontSize: 19, fontWeight: 900,
              cursor: 'pointer', fontFamily: 'inherit',
              letterSpacing: '-0.01em',
              boxShadow: '0 6px 32px rgba(18,184,134,0.5), 0 2px 8px rgba(18,184,134,0.25)',
              position: 'relative', overflow: 'hidden',
            }}
          >
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.14) 50%, transparent 70%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2.8s ease infinite',
              pointerEvents: 'none',
            }} />
            🚀 開始遊戲！
          </motion.button>
        </Stack>
      </motion.div>
    </div>
  );
}
