import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

// Clock radius constants (based on SVG 200x200 viewBox centered at 100,100)
const R = 85;  // clock face radius
const CX = 100, CY = 100;

function deg(hour, minute) {
  const hourDeg   = ((hour % 12) + minute / 60) * 30;   // 360/12 = 30
  const minuteDeg = minute * 6;                           // 360/60 = 6
  return { hourDeg, minuteDeg };
}

function polar(angle, r) {
  const rad = (angle - 90) * (Math.PI / 180);
  return {
    x: CX + r * Math.cos(rad),
    y: CY + r * Math.sin(rad),
  };
}

const ClockSVG = forwardRef(function ClockSVG(
  { hour, minute, size = 220, onClick, inputMode },
  ref
) {
  const { hourDeg, minuteDeg } = deg(hour, minute);

  // Tick marks
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const isMajor = i % 5 === 0;
    const from = polar(i * 6, isMajor ? R - 14 : R - 9);
    const to   = polar(i * 6, R);
    return { from, to, isMajor };
  });

  // Hour numbers
  const nums = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const pos = polar(n * 30, R - 24);
    return { n, ...pos };
  });

  // Hour hand
  const hourTip  = polar(hourDeg, 46);
  const hourBase = polar(hourDeg + 180, 12);

  // Minute hand
  const minTip  = polar(minuteDeg, 65);
  const minBase = polar(minuteDeg + 180, 12);

  // For input mode: inner circle (hour tap) vs outer ring (minute tap)
  function handleSvgClick(e) {
    if (!onClick) return;
    const svg  = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = e.clientX - cx;
    const dy   = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy) / (rect.width / 2) * R;

    // Angle from top (0 = 12 o'clock)
    let angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    if (dist < R * 0.55) {
      // Inner: hour tap
      const h = Math.round(angle / 30) % 12 || 12;
      onClick({ type: 'hour', value: h });
    } else if (dist < R * 1.05) {
      // Outer: minute tap
      if (inputMode === 'half') {
        const m = angle < 180 ? 0 : 30;
        onClick({ type: 'minute', value: m });
      } else {
        const m = Math.round(angle / 6) % 60;
        onClick({ type: 'minute', value: m });
      }
    }
  }

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      style={{ cursor: onClick ? 'pointer' : 'default', userSelect: 'none' }}
      onClick={onClick ? handleSvgClick : undefined}
    >
      {/* Face */}
      <circle cx={CX} cy={CY} r={R} fill="#1a1f2e" stroke="#30363d" strokeWidth={2.5} />

      {/* Ticks */}
      {ticks.map((t, i) => (
        <line
          key={i}
          x1={t.from.x} y1={t.from.y}
          x2={t.to.x}   y2={t.to.y}
          stroke={t.isMajor ? '#8b949e' : '#30363d'}
          strokeWidth={t.isMajor ? 2 : 1}
        />
      ))}

      {/* Numbers */}
      {nums.map(n => (
        <text
          key={n.n}
          x={n.x} y={n.y}
          textAnchor="middle"
          dominantBaseline="central"
          fill="#c9d1d9"
          fontSize={11}
          fontWeight="600"
          fontFamily="Inter, system-ui, sans-serif"
        >
          {n.n}
        </text>
      ))}

      {/* Center dot */}
      <circle cx={CX} cy={CY} r={4} fill="#12b886" />

      {/* Hour hand */}
      <line
        x1={hourBase.x} y1={hourBase.y}
        x2={hourTip.x}  y2={hourTip.y}
        stroke="#e6edf3"
        strokeWidth={5}
        strokeLinecap="round"
        style={{ transition: 'all 0.5s ease' }}
      />

      {/* Minute hand */}
      <line
        x1={minBase.x} y1={minBase.y}
        x2={minTip.x}  y2={minTip.y}
        stroke="#12b886"
        strokeWidth={3}
        strokeLinecap="round"
        style={{ transition: 'all 0.5s ease' }}
      />

      {/* Center cap */}
      <circle cx={CX} cy={CY} r={3} fill="#e6edf3" />
    </svg>
  );
});

export default ClockSVG;
