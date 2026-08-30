import { TILT, nearestSeasonKey } from './geometry';

// 從上往下看的公轉圖：太陽在中間，地球繞著轉。
// 地軸方向永遠固定（朝右上），所以地球轉到不同位置時，
// 北極有時朝太陽（夏→永晝）、有時背太陽（冬→永夜）。
//
// 公轉角 θ：0=春分。螢幕位置 α=θ+90（春在上、夏在左、秋在下、冬在右，逆時針走）。

const rad = d => (d * Math.PI) / 180;

const SEASONS = [
  { key: 'spring', th: 0,   name: '春天', icon: '🌱' },
  { key: 'summer', th: 90,  name: '夏天', icon: '☀️' },
  { key: 'autumn', th: 180, name: '秋天', icon: '🍂' },
  { key: 'winter', th: 270, name: '冬天', icon: '❄️' },
];

export default function OrbitView({ orbitAngle, onPickSeason }) {
  const activeKey = nearestSeasonKey(orbitAngle);
  const W = 320, Hgt = 208;
  const C = { x: 160, y: 104 };          // 太陽
  const RX = 128, RY = 66;               // 軌道橢圓
  const rE = 15;                          // 小地球半徑

  const posOf = th => {
    const a = rad(th + 90);
    return { x: C.x + RX * Math.cos(a), y: C.y - RY * Math.sin(a) };
  };

  const earth = posOf(orbitAngle);

  // 地軸固定朝右上（北極端）
  const n = { x: Math.sin(rad(TILT)), y: -Math.cos(rad(TILT)) };
  const np = { x: earth.x + n.x * rE * 1.35, y: earth.y + n.y * rE * 1.35 };
  const sp = { x: earth.x - n.x * rE * 1.35, y: earth.y - n.y * rE * 1.35 };

  // 朝太陽的半邊發亮（terminator 垂直於「地球→太陽」方向）
  const beta = Math.atan2(C.y - earth.y, C.x - earth.x);
  const p1 = { x: earth.x + rE * Math.cos(beta - Math.PI / 2), y: earth.y + rE * Math.sin(beta - Math.PI / 2) };
  const p2 = { x: earth.x + rE * Math.cos(beta + Math.PI / 2), y: earth.y + rE * Math.sin(beta + Math.PI / 2) };
  const litPath = `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} A ${rE} ${rE} 0 0 1 ${p2.x.toFixed(1)} ${p2.y.toFixed(1)} Z`;

  // 北極端朝太陽嗎？→ 永晝 / 永夜的原因
  const sunDir = { x: (C.x - earth.x), y: (C.y - earth.y) };
  const northLit = (n.x * sunDir.x + n.y * sunDir.y) > 0;

  const cur = SEASONS.find(s => s.key === activeKey);

  return (
    <svg viewBox={`0 0 ${W} ${Hgt}`} style={{ width: '100%', maxWidth: 360, touchAction: 'none', userSelect: 'none' }}>
      <defs>
        <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff4c2" />
          <stop offset="60%" stopColor="#ffd23f" />
          <stop offset="100%" stopColor="#ffb703" />
        </radialGradient>
      </defs>

      {/* 軌道 */}
      <ellipse cx={C.x} cy={C.y} rx={RX} ry={RY} fill="none"
        stroke="rgba(255,255,255,0.16)" strokeWidth="1.5" strokeDasharray="4 6" />

      {/* 太陽 */}
      <circle cx={C.x} cy={C.y} r="34" fill="rgba(255,210,63,0.15)" />
      <circle cx={C.x} cy={C.y} r="22" fill="url(#sunGlow)" />

      {/* 四季定點（可點） */}
      {SEASONS.map(s => {
        const p = posOf(s.th);
        const active = activeKey === s.key;
        return (
          <g key={s.key} onClick={() => onPickSeason(s.th)} style={{ cursor: 'pointer' }}>
            <circle cx={p.x} cy={p.y} r="22" fill="transparent" />
            <circle cx={p.x} cy={p.y} r="5" fill={active ? '#ffd43b' : 'rgba(255,255,255,0.35)'} />
            <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="15">{s.icon}</text>
            <text x={p.x} y={p.y + 22} textAnchor="middle" fontSize="11" fontWeight="800"
              fill={active ? '#ffd43b' : 'rgba(180,195,215,0.75)'}>{s.name}</text>
          </g>
        );
      })}

      {/* 地球 */}
      <g>
        {/* 地軸（固定方向） */}
        <line x1={np.x} y1={np.y} x2={sp.x} y2={sp.y} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
        {/* 夜半球 + 朝太陽的亮半球 */}
        <circle cx={earth.x} cy={earth.y} r={rE} fill="#182238" stroke="rgba(255,255,255,0.25)" strokeWidth="1" />
        <path d={litPath} fill="#5b9bd8" />
        {/* 北極端：朝太陽發亮＝永晝，背對變暗＝永夜 */}
        <circle cx={np.x} cy={np.y} r="4.5" fill={northLit ? '#ffd43b' : '#46597e'} stroke="#fff" strokeWidth="1.5" />
      </g>

      {/* 現在的季節 */}
      <text x={C.x} y={Hgt - 6} textAnchor="middle" fontSize="14" fontWeight="900" fill="#e9edf7">
        現在：{cur.icon} {cur.name}
      </text>
    </svg>
  );
}
