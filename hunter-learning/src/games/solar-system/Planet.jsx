import { planetByKey } from './data';

// 純 CSS 星球：漸層圓 + 選配光環(土星)/條紋(木星)。無外部圖檔。
export default function Planet({ planetKey, size = 64 }) {
  const p = planetByKey(planetKey);
  if (!p) return null;

  return (
    <div
      data-testid={`planet-${planetKey}`}
      style={{ width: size, height: size, position: 'relative', display: 'inline-block' }}
    >
      {/* 土星光環：畫在球體後方的傾斜橢圓 */}
      {p.ring && (
        <div
          data-ring
          style={{
            position: 'absolute', left: '50%', top: '50%',
            width: size * 1.7, height: size * 0.5,
            transform: 'translate(-50%,-50%) rotate(-20deg)',
            borderRadius: '50%',
            border: `${Math.max(3, size * 0.06)}px solid rgba(226,205,150,0.75)`,
            boxSizing: 'border-box', pointerEvents: 'none',
          }}
        />
      )}
      {/* 球體 */}
      <div
        style={{
          width: size, height: size, borderRadius: '50%',
          background: p.gradient,
          boxShadow: 'inset -6px -6px 14px rgba(0,0,0,0.45), 0 2px 10px rgba(0,0,0,0.35)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* 木星條紋 */}
        {p.stripes && (
          <div
            style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background:
                'repeating-linear-gradient(180deg, rgba(120,80,40,0.28) 0 6px, rgba(255,240,210,0.18) 6px 12px)',
              mixBlendMode: 'multiply',
            }}
          />
        )}
      </div>
    </div>
  );
}
