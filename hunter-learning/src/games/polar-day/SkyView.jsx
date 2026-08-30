import { TILT } from './geometry';

// 小人抬頭看天空：畫地平線，太陽依「一天」在天上的高度移動。
// 太陽高度角 alt： sin(alt) = sinφ·sinδ + cosφ·cosδ·cosH
//   正常：升起→劃過天空→落下（會沉到地平線下）
//   永晝：一整天都在地平線上（繞圈不落下）
//   永夜：一整天都在地平線下（看不到太陽）

const rad = d => (d * Math.PI) / 180;
const deg = r => (r * 180) / Math.PI;

function altitude(latDeg, season, hourDeg) {
  const phi = rad(latDeg), dec = rad(TILT * season), H = rad(hourDeg);
  const s = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
  return deg(Math.asin(Math.max(-1, Math.min(1, s))));
}

export default function SkyView({ latitude, season, spin }) {
  const W = 320, Hgt = 150;
  const HORIZON = 112;
  const DOME = 96;                       // alt 90° 對到多少像素高
  const norm = h => ((h + 180) % 360) - 180;   // 0..360 → -180..180（正午 0）

  // H=0 為正午，讓小人一開始看到白天：把 spin 位移半天
  const hourFor = s => norm(s + 180);
  const xForHour = h => 22 + ((h + 180) / 360) * (W - 44);
  const yForAlt = alt => HORIZON - (Math.max(alt, 0) / 90) * DOME;

  // 太陽整天的軌跡（只畫地平線以上的部分）
  const M = 96;
  const pts = [];
  for (let i = 0; i <= M; i++) {
    const h = -180 + (i / M) * 360;
    const alt = altitude(latitude, season, h);
    pts.push({ x: xForHour(h), alt, up: alt > 0 });
  }
  // 連續在地平線上的線段
  const segs = [];
  let seg = null;
  for (const p of pts) {
    if (p.up) { (seg ??= []).push(p); }
    else if (seg) { segs.push(seg); seg = null; }
  }
  if (seg) segs.push(seg);

  // 現在的太陽
  const curH = hourFor(spin);
  const curAlt = altitude(latitude, season, curH);
  const sunUp = curAlt > 0;
  const sunX = xForHour(curH);
  const sunY = yForAlt(curAlt);

  const stars = [[40, 26], [96, 46], [150, 20], [210, 40], [268, 24], [180, 62], [70, 66]];

  return (
    <svg viewBox={`0 0 ${W} ${Hgt}`} style={{ width: '100%', maxWidth: 360, userSelect: 'none' }}>
      <defs>
        <linearGradient id="skyDay" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5aa9e0" />
          <stop offset="100%" stopColor="#bfe3ff" />
        </linearGradient>
        <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0c1630" />
          <stop offset="100%" stopColor="#1e2c4c" />
        </linearGradient>
      </defs>

      {/* 天空 */}
      <rect x="0" y="0" width={W} height={HORIZON} fill={sunUp ? 'url(#skyDay)' : 'url(#skyNight)'} />

      {/* 夜晚星星 */}
      {!sunUp && stars.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.5" fill="rgba(255,255,255,0.85)" />
      ))}

      {/* 太陽軌跡（地平線以上） */}
      {segs.map((s, i) => (
        <path key={i} d={s.map((p, j) => `${j ? 'L' : 'M'} ${p.x.toFixed(1)} ${yForAlt(p.alt).toFixed(1)}`).join(' ')}
          fill="none" stroke="rgba(255,213,74,0.55)" strokeWidth="2" strokeDasharray="4 5" />
      ))}

      {/* 太陽（在地平線上才畫） */}
      {sunUp && (
        <g>
          <circle cx={sunX} cy={sunY} r="16" fill="rgba(255,210,63,0.28)" />
          <circle cx={sunX} cy={sunY} r="10" fill="#ffd23f" stroke="#ffb703" strokeWidth="2.5" />
        </g>
      )}

      {/* 地面 */}
      <rect x="0" y={HORIZON} width={W} height={Hgt - HORIZON} fill="#2f7d4f" />
      <rect x="0" y={HORIZON} width={W} height="3" fill="#256a41" />

      {/* 小人 */}
      <text x={W / 2} y={Hgt - 8} textAnchor="middle" fontSize="30">🧍</text>
    </svg>
  );
}
