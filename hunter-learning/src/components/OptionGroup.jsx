import { Text } from '@mantine/core';
import { motion } from 'framer-motion';

export default function OptionGroup({ label, options, selected, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <Text size="xs" style={{ color: 'rgba(139,163,190,0.65)', fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
        {label}
      </Text>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${options.length}, 1fr)`, gap: 8 }}>
        {options.map(opt => {
          const active = selected === opt.value;
          return (
            <motion.button
              key={opt.value}
              whileTap={{ scale: 0.93 }}
              onClick={() => onChange(opt.value)}
              style={{
                padding: '13px 8px',
                borderRadius: 16,
                border: active ? '2px solid rgba(18,184,134,0.85)' : '2px solid rgba(26,44,61,0.9)',
                background: active
                  ? 'linear-gradient(145deg, rgba(18,184,134,0.22), rgba(13,207,170,0.10))'
                  : 'rgba(10,22,38,0.75)',
                color: active ? '#12b886' : 'rgba(100,120,145,0.9)',
                cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                fontFamily: 'inherit',
                boxShadow: active ? '0 0 18px rgba(18,184,134,0.22), inset 0 0 12px rgba(18,184,134,0.06)' : 'none',
                transition: 'all 0.18s ease',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {active && (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(105deg, transparent 30%, rgba(18,184,134,0.1) 50%, transparent 70%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2.2s ease infinite',
                  pointerEvents: 'none',
                }} />
              )}
              {opt.icon && <span style={{ fontSize: 24, lineHeight: 1 }}>{opt.icon}</span>}
              <Text size="sm" style={{ color: 'inherit', fontWeight: active ? 800 : 600, lineHeight: 1.2 }}>{opt.text}</Text>
              {opt.sub && (
                <Text size="xs" style={{ color: active ? 'rgba(18,184,134,0.65)' : 'rgba(100,120,145,0.6)', lineHeight: 1.2 }}>
                  {opt.sub}
                </Text>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
