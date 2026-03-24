// ================================
// SVG Clock Engine
// ================================
const Clock = (() => {
  let svgEl, hourEl, minEl, zoneRing;
  let hourDeg = 0, minDeg = 0;
  let tapHandler = null, touchFired = false;

  // ---- SVG helpers ----
  function svg(tag, attrs) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
    return el;
  }

  // ---- Build clock face ----
  function build(el) {
    svgEl = el;
    el.innerHTML = '';

    // Face
    el.appendChild(svg('circle', {
      cx: 150, cy: 150, r: 140,
      fill: '#FFFEF5', stroke: '#3a3a6a', 'stroke-width': 3
    }));

    // Tick marks (12)
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * 2 * Math.PI;
      const rOut = 132;
      const rIn  = (i % 3 === 0) ? 110 : 120;
      el.appendChild(svg('line', {
        x1: 150 + rOut * Math.sin(a),
        y1: 150 - rOut * Math.cos(a),
        x2: 150 + rIn  * Math.sin(a),
        y2: 150 - rIn  * Math.cos(a),
        stroke: '#3a3a6a',
        'stroke-width': i % 3 === 0 ? 4 : 2,
        'stroke-linecap': 'round'
      }));
    }

    // Numbers 1–12
    for (let h = 1; h <= 12; h++) {
      const a = (h / 12) * 2 * Math.PI;
      const r = 98;
      const t = svg('text', {
        x: 150 + r * Math.sin(a),
        y: 150 - r * Math.cos(a),
        'font-size': h % 3 === 0 ? 28 : 23,
        'font-weight': 'bold',
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: '#1e1e3a',
        'font-family': 'Helvetica Neue, Arial, sans-serif',
      });
      t.textContent = h;
      el.appendChild(t);
    }

    // Zone divider ring (shown only in precise mode)
    zoneRing = svg('circle', {
      cx: 150, cy: 150, r: 90,
      stroke: '#9090b0', 'stroke-width': 1.5,
      'stroke-dasharray': '5 4',
      fill: 'none', opacity: 0
    });
    el.appendChild(zoneRing);

    // Hour hand — rect pointing up, bottom at center (150,150)
    // x = 150-6=144, y = 150-82=68, width=12, height=82
    hourEl = svg('rect', {
      id: 'hour-hand',
      x: 144, y: 68, width: 12, height: 82,
      rx: 5, fill: '#1e1e3a'
    });
    el.appendChild(hourEl);

    // Minute hand — longer and thinner
    // x = 150-3=147, y = 150-115=35, width=6, height=115
    minEl = svg('rect', {
      id: 'minute-hand',
      x: 147, y: 35, width: 6, height: 115,
      rx: 2, fill: '#44446a'
    });
    el.appendChild(minEl);

    // Center dot
    el.appendChild(svg('circle', {
      cx: 150, cy: 150, r: 8,
      fill: '#1e1e3a'
    }));

    // Inner highlight dot
    el.appendChild(svg('circle', {
      cx: 150, cy: 150, r: 3,
      fill: '#9090b0'
    }));
  }

  // ---- Rotation helpers ----
  function rotateTo(el, current, targetAbs) {
    let delta = ((targetAbs - (current % 360)) + 360) % 360;
    if (delta > 180) delta -= 360; // shortest path
    const next = current + delta;
    el.style.transform = `rotate(${next}deg)`;
    return next;
  }

  // ---- Set time ----
  // instant=true: snap without animation (for loading a new question)
  function setTime(h, m, instant = false) {
    const hDeg = (h % 12) * 30 + m * 0.5;
    const mDeg = m * 6;

    if (instant) {
      // Disable CSS transition temporarily
      hourEl.style.transition = 'none';
      minEl.style.transition  = 'none';
      hourDeg = hDeg;
      minDeg  = mDeg;
      hourEl.style.transform = `rotate(${hourDeg}deg)`;
      minEl.style.transform  = `rotate(${minDeg}deg)`;
      void hourEl.offsetWidth; // force reflow
      requestAnimationFrame(() => {
        hourEl.style.transition = '';
        minEl.style.transition  = '';
      });
    } else {
      hourDeg = rotateTo(hourEl, hourDeg, hDeg);
      minDeg  = rotateTo(minEl,  minDeg,  mDeg);
    }
  }

  // Set just the minute hand (used by Mode 2 半點 buttons)
  function setMinute(m) {
    minDeg = rotateTo(minEl, minDeg, m * 6);
  }

  // Set just the hour hand (snaps to exact hour, ignoring minute offset)
  function setHour(h) {
    hourDeg = rotateTo(hourEl, hourDeg, (h % 12) * 30);
  }

  // ---- Touch/click helpers ----
  function getAngleAndDist(clientX, clientY) {
    const rect   = svgEl.getBoundingClientRect();
    const scaleX = 300 / rect.width;
    const scaleY = 300 / rect.height;
    const svgX   = (clientX - rect.left) * scaleX;
    const svgY   = (clientY - rect.top)  * scaleY;
    const dx = svgX - 150;
    const dy = svgY - 150;
    const dist = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    return { angle, dist };
  }

  // ---- Enable interactive input (Mode 2) ----
  function enableInput(difficulty, onHour, onMinute) {
    if (difficulty === 'precise' || difficulty === 'half') {
      zoneRing.setAttribute('opacity', '0.55');
    }

    touchFired = false;

    tapHandler = (e) => {
      e.preventDefault();
      if (e.type === 'click' && touchFired) { touchFired = false; return; }
      if (e.type === 'touchend') touchFired = true;

      const pt = e.changedTouches ? e.changedTouches[0] : e;
      const { angle, dist } = getAngleAndDist(pt.clientX, pt.clientY);

      if (dist > 146) return; // outside face

      if ((difficulty === 'precise' || difficulty === 'half') && dist >= 90) {
        // Outer ring → minute
        const minute = difficulty === 'half'
          ? Math.round(angle / 180) * 30 % 60
          : (Math.round(angle / 30) * 5) % 60;
        setMinute(minute);
        onMinute(minute);
      } else if (dist < 90) {
        // Inner area → hour
        const hour = Math.round(angle / 30) % 12 || 12;
        setHour(hour);
        onHour(hour);
      }
    };

    svgEl.addEventListener('touchend', tapHandler, { passive: false });
    svgEl.addEventListener('click',    tapHandler);
    svgEl.style.cursor = 'pointer';
  }

  function disableInput() {
    if (tapHandler) {
      svgEl.removeEventListener('touchend', tapHandler);
      svgEl.removeEventListener('click',    tapHandler);
      tapHandler = null;
    }
    zoneRing.setAttribute('opacity', '0');
    svgEl.style.cursor = '';
  }

  return { build, setTime, setMinute, setHour, enableInput, disableInput };
})();
