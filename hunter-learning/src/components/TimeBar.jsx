// Shrinking countdown bar for timed mode. Turns red and pulses when ≤30% left.
export default function TimeBar({ fraction }) {
  const clamped = Math.max(0, Math.min(1, fraction));
  const low = clamped <= 0.3;

  return (
    <div style={{
      height: 8, borderRadius: 6,
      background: 'rgba(139,163,190,0.15)',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100%',
        width: `${clamped * 100}%`,
        background: low ? '#f85149' : 'linear-gradient(90deg, #12b886, #0dcfaa)',
        borderRadius: 6,
        boxShadow: low ? '0 0 8px rgba(248,81,73,0.6)' : '0 0 6px rgba(18,184,134,0.4)',
        transition: 'width 0.1s linear',
        animation: low ? 'timebar-pulse 0.5s ease-in-out infinite alternate' : 'none',
      }} />
    </div>
  );
}
