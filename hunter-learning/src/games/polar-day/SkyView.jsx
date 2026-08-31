import { TILT } from './geometry';

// 小人抬頭看天空：太陽依「一天」在天上的高度移動。
// 天色隨太陽高度連續漸變（深夜藍→晨昏橘→白天藍），星星淡入淡出，
// 永夜時天上飄極光；地景跟著緯度變（雪地／草地／熱帶）。
//   sin(alt) = sinφ·sinδ + cosφ·cosδ·cosH

const rad = d => (d * Math.PI) / 180;
const deg = r => (r * 180) / Math.PI;

function altitude(latDeg, season, hourDeg) {
  const phi = rad(latDeg), dec = rad(TILT * season), H = rad(hourDeg);
  const s = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H);
  return deg(Math.asin(Math.max(-1, Math.min(1, s))));
}

// ── 顏色工具：hex 線性插值 ──
const hex2rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const mix = (a, b, t) => {
  const A = hex2rgb(a), B = hex2rgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`;
};
const clamp01 = v => Math.max(0, Math.min(1, v));

// 天色三段：深夜 → 晨昏 → 白天
const SKY = {
  night: { top: '#070d20', bot: '#1b2a4e' },
  dawn:  { top: '#2a3b6e', bot: '#ff9e5e' },
  day:   { top: '#4d9ee0', bot: '#bfe3ff' },
};
function skyColors(alt) {
  if (alt <= -10) return SKY.night;
  if (alt < 0) {
    const t = (alt + 10) / 10;
    return { top: mix(SKY.night.top, SKY.dawn.top, t), bot: mix(SKY.night.bot, SKY.dawn.bot, t) };
  }
  const t = clamp01(alt / 14);
  return { top: mix(SKY.dawn.top, SKY.day.top, t), bot: mix(SKY.dawn.bot, SKY.day.bot, t) };
}

const STARS = [
  [46, 30], [104, 58], [168, 24], [232, 48], [296, 30], [352, 62], [420, 26],
  [78, 82], [146, 70], [214, 88], [282, 72], [366, 92], [440, 66], [30, 68],
];

// 地景 = 緯度 × 季節：
//   熱帶永遠 🌴；溫帶隨四季換裝（雪→花→樹→楓）；
//   北極圈夏天是凍原（🦌），其他時候都是雪地（⛄）。
function terrainFor(latitude, season, seasonKey) {
  if (latitude < 23.5) return { ground: '#3f9b5c', night: '#152a1d', decor: '🌴' };
  if (latitude >= 60) {
    return season > 0.35
      ? { ground: '#7a8a5e', night: '#1e2a1c', decor: '🦌' }
      : { ground: '#dce8f4', night: '#2c3a52', decor: '⛄' };
  }
  if (season < -0.35) return { ground: '#dce8f4', night: '#2c3a52', decor: '⛄' };
  if (seasonKey === 'autumn') return { ground: '#8a7a3a', night: '#241f10', decor: '🍁' };
  if (seasonKey === 'spring') return { ground: '#4a8f4f', night: '#152a1d', decor: '🌷' };
  return { ground: '#2f7d4f', night: '#152a1d', decor: '🌳' };
}

export default function SkyView({ latitude, season, spin, seasonKey }) {
  const W = 480, Hgt = 200;
  const HORIZON = 152;
  const DOME = 128;
  const norm = h => ((h + 180) % 360) - 180;
  const hourFor = s => norm(s + 180);
  const xForHour = h => 26 + ((h + 180) / 360) * (W - 52);
  const yForAlt = alt => HORIZON - (Math.max(alt, 0) / 90) * DOME;

  // 太陽整天的軌跡（地平線以上的分段）
  const M = 120;
  const pts = [];
  for (let i = 0; i <= M; i++) {
    const h = -180 + (i / M) * 360;
    const alt = altitude(latitude, season, h);
    pts.push({ x: xForHour(h), alt, up: alt > 0 });
  }
  const segs = [];
  let seg = null;
  for (const p of pts) {
    if (p.up) { (seg ??= []).push(p); }
    else if (seg) { segs.push(seg); seg = null; }
  }
  if (seg) segs.push(seg);

  const curH = hourFor(spin);
  const curAlt = altitude(latitude, season, curH);
  const sunUp = curAlt > 0;
  const sunX = xForHour(curH);
  const sunY = yForAlt(curAlt);

  const sky = skyColors(curAlt);
  const starOpacity = clamp01(-curAlt / 9);
  const nightT = clamp01(-curAlt / 8);
  const lowSun = clamp01(1 - curAlt / 22);
  const sunCol = mix('#ffd23f', '#ff8642', lowSun);
  const polarNight = segs.length === 0;

  const terrain = terrainFor(latitude, season, seasonKey);
  const groundCol = mix(terrain.ground, terrain.night, nightT);
  const decor = terrain.decor;

  return (
    <svg viewBox={`0 0 ${W} ${Hgt}`} style={{ width: '100%', display: 'block', userSelect: 'none' }}>
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={sky.top} />
          <stop offset="100%" stopColor={sky.bot} />
        </linearGradient>
        <linearGradient id="auroraGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(99,230,190,0)" />
          <stop offset="30%" stopColor="rgba(99,230,190,0.55)" />
          <stop offset="65%" stopColor="rgba(151,117,250,0.45)" />
          <stop offset="100%" stopColor="rgba(99,230,190,0)" />
        </linearGradient>
        <filter id="auroraBlur"><feGaussianBlur stdDeviation="3.5" /></filter>
        <radialGradient id="sunHalo">
          <stop offset="0%" stopColor={sunCol} stopOpacity="0.5" />
          <stop offset="100%" stopColor={sunCol} stopOpacity="0" />
        </radialGradient>
      </defs>

      <style>{`
        @keyframes auroraSway {
          from { transform: translateX(-20px); }
          to   { transform: translateX(20px); }
        }
      `}</style>

      {/* 天空 */}
      <rect x="0" y="0" width={W} height={HORIZON} fill="url(#skyGrad)" />

      {/* 星星 */}
      {starOpacity > 0.02 && STARS.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 ? 1.3 : 1.8}
          fill="#fff" opacity={starOpacity * (i % 2 ? 0.9 : 0.55)} />
      ))}

      {/* 夜裡的月亮 */}
      {starOpacity > 0.05 && (
        <text x={W - 54} y={48} fontSize="26" opacity={starOpacity}>🌙</text>
      )}

      {/* 永夜限定：飄動的極光簾 */}
      {polarNight && (
        <g filter="url(#auroraBlur)" opacity="0.9">
          <path d="M -20 76 C 90 46, 190 90, 290 58 S 460 70, 500 44 L 500 12 L -20 12 Z"
            fill="url(#auroraGrad)"
            style={{ animation: 'auroraSway 5.5s ease-in-out infinite alternate' }} />
          <path d="M -20 104 C 120 80, 230 116, 340 88 S 470 96, 500 78 L 500 52 L -20 58 Z"
            fill="url(#auroraGrad)" opacity="0.6"
            style={{ animation: 'auroraSway 7.5s ease-in-out infinite alternate-reverse' }} />
        </g>
      )}

      {/* 太陽軌跡（地平線以上） */}
      {segs.map((s, i) => (
        <path key={i} d={s.map((p, j) => `${j ? 'L' : 'M'} ${p.x.toFixed(1)} ${yForAlt(p.alt).toFixed(1)}`).join(' ')}
          fill="none" stroke="rgba(255,213,74,0.5)" strokeWidth="2" strokeDasharray="4 5" />
      ))}

      {/* 太陽（低空更大更橘） */}
      {sunUp && (
        <g>
          <circle cx={sunX} cy={sunY} r={22 + lowSun * 9} fill="url(#sunHalo)" />
          <circle cx={sunX} cy={sunY} r={10 + lowSun * 3} fill={sunCol}
            stroke={mix('#ffb703', '#ff6d2e', lowSun)} strokeWidth="2.5" />
        </g>
      )}

      {/* 地面（跟緯度、日夜走） */}
      <rect x="0" y={HORIZON} width={W} height={Hgt - HORIZON} fill={groundCol} />
      <rect x="0" y={HORIZON} width={W} height="3" fill="rgba(0,0,0,0.22)" />

      {/* 地景 + 小人 */}
      <text x={W / 2 - 58} y={Hgt - 12} textAnchor="middle" fontSize="26">{decor}</text>
      <text x={W / 2} y={Hgt - 10} textAnchor="middle" fontSize="34">🧍</text>
    </svg>
  );
}
