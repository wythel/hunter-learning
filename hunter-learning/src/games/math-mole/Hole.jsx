import { motion } from 'framer-motion';

export default function Hole({ num, up, onHit, flash }) {
  return (
    <div
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: 88,
        overflow: 'hidden',
      }}
    >
      {/* Hole background */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        width: '80%',
        height: 28,
        borderRadius: '50%',
        background: 'rgba(0,0,0,0.55)',
        zIndex: 0,
      }} />

      {/* Mole */}
      <motion.div
        animate={{ y: up ? 0 : '105%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 20 }}
        onClick={up ? onHit : undefined}
        style={{
          position: 'absolute',
          bottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: up ? 'pointer' : 'default',
          zIndex: 1,
          filter: flash === 'correct' ? 'brightness(2) saturate(3)' : flash === 'wrong' ? 'brightness(0.4)' : 'none',
          transition: 'filter 0.15s',
        }}
      >
        {/* Number badge */}
        <div style={{
          background: up ? '#0ca678' : '#30363d',
          color: '#fff',
          borderRadius: 8,
          padding: '2px 8px',
          fontSize: 14,
          fontWeight: 700,
          marginBottom: 2,
          minWidth: 28,
          textAlign: 'center',
          boxShadow: up ? '0 2px 8px rgba(12, 166, 120, 0.5)' : 'none',
          transition: 'background 0.2s',
        }}>
          {num}
        </div>

        {/* Body */}
        <div style={{ fontSize: 36, lineHeight: 1, userSelect: 'none' }}>🦔</div>
      </motion.div>
    </div>
  );
}
