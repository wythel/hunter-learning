import { useRef } from 'react';
import { illuminatedFraction, isWaxing, classifyPhase } from './data';

// ── 地球視角的月相盤：暗盤上疊亮半圓與 terminator 半橢圓 ──
function MoonDisk({ angle, R, cx, cy }) {
  const illum   = illuminatedFraction(angle);
  const waxing  = isWaxing(angle);
  const litSide = waxing ? 'right' : 'left';
  const darkSide = waxing ? 'left' : 'right';
  const rx = Math.abs(R * Math.cos((angle * Math.PI) / 180));

  const LIGHT = '#f6f2df';
  const DARK  = '#26324e';

  // 亮側半圓：sweep 1=右半、0=左半
  const semi = side => {
    const s = side === 'right' ? 1 : 0;
    return `M 0 ${-R} A ${R} ${R} 0 0 ${s} 0 ${R} Z`;
  };
  // 以 rx 為水平半徑的半橢圓（同樣 sweep 規則）
  const halfEllipse = side => {
    const s = side === 'right' ? 1 : 0;
    return `M 0 ${-R} A ${rx} ${R} 0 0 ${s} 0 ${R} Z`;
  };

  const gibbous = illum > 0.5;

  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r={R} fill={DARK} stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
      <path d={semi(litSide)} fill={LIGHT} />
      {Math.abs(illum - 0.5) > 0.001 && (
        gibbous
          ? <path d={halfEllipse(darkSide)} fill={LIGHT} />
          : <path d={halfEllipse(litSide)}  fill={DARK}  />
      )}
    </g>
  );
}

export default function MoonSystem({ angle, onAngleChange, difficulty = 'easy', showLabel = true }) {
  const svgRef = useRef(null);

  // 版面座標（viewBox 320×440：上半俯視、下半月相盤）
  const W = 320;
  const ORBIT = { cx: 160, cy: 150, r: 95 };  // 地球在軌道中心
  const SUN   = { cx: 300, cy: 150, r: 20 };
  const rad   = (angle * Math.PI) / 180;
  // φ=0 月亮在地球右側（朝太陽）；螢幕上 x 向右、y 向上→用 -sin 讓角度逆時針增加
  const moon = {
    x: ORBIT.cx + ORBIT.r * Math.cos(rad),
    y: ORBIT.cy - ORBIT.r * Math.sin(rad),
  };

  const phase = classifyPhase(angle, difficulty);

  function pointToAngle(clientX, clientY) {
    const svg = svgRef.current;
    const rect = svg.getBoundingClientRect();
    // 換算到 viewBox 座標
    const vx = ((clientX - rect.left) / rect.width) * W;
    const vy = ((clientY - rect.top) / rect.height) * 440;
    const dx = vx - ORBIT.cx;
    const dy = ORBIT.cy - vy;           // 螢幕 y 向下 → 幾何 y 向上
    let a = (Math.atan2(dy, dx) * 180) / Math.PI;
    return ((a % 360) + 360) % 360;
  }

  const draggable = typeof onAngleChange === 'function';

  function startDrag(e) {
    if (!draggable) return;
    e.preventDefault();
    const move = ev => {
      const p = ev.touches ? ev.touches[0] : ev;
      onAngleChange(pointToAngle(p.clientX, p.clientY));
    };
    const up = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    move(e);
  }

  // 太陽平行光線（由右向左）
  const rays = [90, 130, 150, 170, 210].map((y, i) => (
    <line key={i} x1={W} y1={y} x2={ORBIT.cx + 40} y2={y}
      stroke="rgba(255,214,102,0.5)" strokeWidth="2" strokeDasharray="6 6" />
  ));

  return (
    <div style={{ width: '100%', maxWidth: 360, margin: '0 auto' }}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} 440`}
        style={{ width: '100%', touchAction: 'none', userSelect: 'none' }}
      >
        {/* ── 上半：上帝俯視圖 ── */}
        {rays}
        {/* 太陽 */}
        <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill="#ffd23f" />
        <circle cx={SUN.cx} cy={SUN.cy} r={SUN.r} fill="none" stroke="#ffb703" strokeWidth="3" />
        {/* 軌道 */}
        <circle cx={ORBIT.cx} cy={ORBIT.cy} r={ORBIT.r}
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" strokeDasharray="4 5" />
        {/* 地球 */}
        <circle cx={ORBIT.cx} cy={ORBIT.cy} r="16" fill="#3a7bd5" />
        <circle cx={ORBIT.cx} cy={ORBIT.cy} r="16" fill="#2f9e6e" opacity="0.55" />
        {/* 視線虛線 地球→月亮 */}
        <line x1={ORBIT.cx} y1={ORBIT.cy} x2={moon.x} y2={moon.y}
          stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeDasharray="3 4" />
        {/* 小月亮：右半亮、左半暗（太陽恆照右側） */}
        <g transform={`translate(${moon.x} ${moon.y})`} onPointerDown={startDrag}
           style={{ cursor: draggable ? 'grab' : 'default' }}>
          <circle r="13" fill="#26324e" />
          <path d="M 0 -13 A 13 13 0 0 1 0 13 Z" fill="#f6f2df" />
          {draggable && <circle r="20" fill="transparent" />}
        </g>

        {/* ── 下半：地球視角月相盤 ── */}
        <MoonDisk angle={angle} R={70} cx={160} cy={330} />
      </svg>

      {showLabel && (
        <div style={{ textAlign: 'center', marginTop: 4 }}>
          <span style={{ fontSize: 26, fontWeight: 900, color: '#e9edf7' }}>{phase.name}</span>
        </div>
      )}
    </div>
  );
}
