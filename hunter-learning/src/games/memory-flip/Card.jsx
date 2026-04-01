import { motion } from 'framer-motion';

export default function FlipCard({ text, flipped, matched, mismatch, onClick }) {
  let borderColor = 'rgba(48, 54, 61, 0.8)';
  let glowColor   = 'none';

  if (matched)   { borderColor = '#12b886'; glowColor = '0 0 16px rgba(18,184,134,0.5)'; }
  if (mismatch)  { borderColor = '#f85149'; }

  return (
    <div
      onClick={onClick}
      style={{
        perspective: 600,
        cursor: matched ? 'default' : 'pointer',
        aspectRatio: '3/4',
      }}
    >
      <motion.div
        animate={{ rotateY: flipped || matched ? 180 : 0 }}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Back */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          borderRadius: 12,
          border: '1.5px solid rgba(48, 54, 61, 0.8)',
          background: 'rgba(22, 27, 34, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
        }}>
          🎴
        </div>

        {/* Front */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 12,
          border: `1.5px solid ${borderColor}`,
          boxShadow: glowColor,
          background: matched ? 'rgba(18, 184, 134, 0.08)' : 'rgba(30, 38, 48, 0.95)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 6,
          fontSize: text.length > 6 ? 13 : text.length > 3 ? 15 : 20,
          fontWeight: 700,
          color: matched ? '#12b886' : '#e6edf3',
          textAlign: 'center',
          wordBreak: 'break-word',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}>
          {text}
        </div>
      </motion.div>
    </div>
  );
}
