import { TILT } from './geometry';

// 側視圖：太陽在左，水平光線打到地球。地球以中線分成
// 左半（照到太陽＝白天）與右半（照不到＝晚上）。
// 地軸依季節朝／背太陽傾斜；小人所在緯度是一圈軌跡，
// 自轉時小人沿軌跡走，靠左＝白天、靠右＝晚上。
//
// 3D → 螢幕投影（與 geometry.dayInfo 的亮暗一致）：
//   太陽方向 S=(-1,0,0)，p_x<0 即被照亮。
//   地軸 n=(-sin a, cos a, 0)，a = TILT*season（+夏天朝太陽）。
//   緯度 φ、時角 H 的地表點：
//     p_x = cosφ·cosH·cos a − sinφ·sin a
//     p_y = cosφ·cosH·sin a + sinφ·cos a
//     p_z = cosφ·sinH               (>0 朝觀眾，<0 在地球背面)

const rad = d => (d * Math.PI) / 180;

function spherePoint(latDeg, season, hourDeg) {
  const a = rad(TILT * season);
  const phi = rad(latDeg);
  const H = rad(hourDeg);
  const cphi = Math.cos(phi), sphi = Math.sin(phi);
  return {
    x: cphi * Math.cos(H) * Math.cos(a) - sphi * Math.sin(a),
    y: cphi * Math.cos(H) * Math.sin(a) + sphi * Math.cos(a),
    z: cphi * Math.sin(H),
  };
}

export default function EarthSystem({ latitude, season, spin }) {
  const W = 320, Hgt = 280;
  const EC = { x: 196, y: 140 }, R = 92;   // 地球中心與半徑
  const SUN = { x: 44, y: 140, r: 24 };

  const toScreen = p => ({ x: EC.x + p.x * R, y: EC.y - p.y * R });

  // ── 緯度軌跡：取樣一整圈時角 ──
  const N = 72;
  const ring = Array.from({ length: N + 1 }, (_, i) => {
    const p = spherePoint(latitude, season, (i / N) * 360);
    return { ...toScreen(p), z: p.z, lit: p.x < 0 };
  });
  const ringPath = ring.map((s, i) => `${i ? 'L' : 'M'} ${s.x.toFixed(1)} ${s.y.toFixed(1)}`).join(' ');

  // 小人現在的位置
  const cur = spherePoint(latitude, season, spin);
  const curS = toScreen(cur);
  const curLit = cur.x < 0;
  const curBehind = cur.z < 0;

  // ── 地軸（過南北極） ──
  const a = rad(TILT * season);
  const axis = { x: -Math.sin(a), y: Math.cos(a) };
  const npole = toScreen({ x: axis.x * 1.06, y: axis.y * 1.06 });
  const spole = toScreen({ x: -axis.x * 1.06, y: -axis.y * 1.06 });

  const DAY = '#5b9bd8', NIGHT = '#182238';
  const litColor = '#ffd43b', darkColor = '#46597e';

  return (
    <svg viewBox={`0 0 ${W} ${Hgt}`} style={{ width: '100%', maxWidth: 360, touchAction: 'none', userSelect: 'none' }}>
      <defs>
        {/* 白天半球的柔和高光 */}
        <radialGradient id="dayGlow" cx="30%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#bfe0ff" />
          <stop offset="100%" stopColor={DAY} />
        </radialGradient>
        <clipPath id="earthClip">
          <circle cx={EC.x} cy={EC.y} r={R} />
        </clipPath>
      </defs>

      {/* 太陽光線（水平，只打到白天側） */}
      {[-58, -30, 0, 30, 58].map((dy, i) => (
        <line key={i} x1={SUN.x + SUN.r} y1={SUN.y + dy} x2={EC.x - 8} y2={SUN.y + dy}
          stroke="rgba(255,213,74,0.45)" strokeWidth="2.5" strokeDasharray="7 7" />
      ))}

      {/* 太陽 */}
      <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill="#ffd23f" />
      <circle cx={SUN.x} cy={SUN.y} r={SUN.r} fill="none" stroke="#ffb703" strokeWidth="3" />

      {/* ── 地球：左半亮、右半暗 ── */}
      <g clipPath="url(#earthClip)">
        <rect x={EC.x - R} y={EC.y - R} width={R} height={2 * R} fill="url(#dayGlow)" />
        <rect x={EC.x} y={EC.y - R} width={R} height={2 * R} fill={NIGHT} />
        {/* 夜側幾顆小星星 */}
        {[[36, -52], [64, 8], [30, 46], [72, -18]].map(([dx, dy], i) => (
          <circle key={i} cx={EC.x + dx} cy={EC.y + dy} r="1.4" fill="rgba(255,255,255,0.7)" />
        ))}
      </g>
      <circle cx={EC.x} cy={EC.y} r={R} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1.5" />

      {/* 地軸 */}
      <line x1={npole.x} y1={npole.y} x2={spole.x} y2={spole.y}
        stroke="rgba(255,255,255,0.5)" strokeWidth="2" strokeDasharray="4 4" />
      <text x={npole.x} y={npole.y - 6} textAnchor="middle" fontSize="13" fontWeight="900" fill="#e9edf7">北</text>

      {/* ── 緯度軌跡：背面較淡，前面較亮 ── */}
      <path d={ringPath} fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="2" strokeDasharray="3 4" />

      {/* 小人（location pin） */}
      <g transform={`translate(${curS.x} ${curS.y})`} opacity={curBehind ? 0.5 : 1}>
        {curLit && <circle r="13" fill="rgba(255,213,74,0.4)" />}
        <circle r="7.5" fill={curLit ? litColor : darkColor}
          stroke="#fff" strokeWidth="2.5" />
        <text y="-15" textAnchor="middle" fontSize="19">🧍</text>
      </g>
    </svg>
  );
}
