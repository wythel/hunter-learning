import { useEffect, useRef } from 'react';

const STAR_COUNT = 140;

// Colour palette: mostly ice-blue, occasional teal / warm-white / faint violet
const STAR_COLORS = [
  [200, 230, 255],
  [200, 230, 255],
  [200, 230, 255],
  [180, 210, 255],
  [255, 255, 240],
  [180, 255, 230],
  [220, 200, 255],
];

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx    = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Static twinkling stars
    const stars = Array.from({ length: STAR_COUNT }, () => {
      const col = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
      return {
        x:        Math.random(),
        y:        Math.random(),
        r:        Math.random() * 1.4 + 0.3,
        delay:    Math.random() * 5,
        duration: Math.random() * 3 + 2,
        col,
      };
    });

    // Shooting stars
    const shooters    = [];
    let lastShooterMs = -6000;

    function spawnShooter(now) {
      const angle = Math.PI * 0.65; // ~117° — down-left
      const speed = 340 + Math.random() * 200;
      shooters.push({
        x:       canvas.width  * (0.35 + Math.random() * 0.65),
        y:       canvas.height * (Math.random() * 0.35),
        vx:      Math.cos(angle) * speed,
        vy:      Math.sin(angle) * speed,
        tailLen: 70 + Math.random() * 80,
        born:    now,
        life:    650 + Math.random() * 350,
      });
    }

    let frame;

    function draw(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = now / 1000;

      // Twinkling stars
      for (const s of stars) {
        const t     = ((elapsed - s.delay) / s.duration) % 1;
        const phase = t < 0.5 ? t * 2 : 2 - t * 2;
        const alpha = 0.18 + phase * 0.72;
        const scale = 1    + phase * 0.45;
        ctx.beginPath();
        ctx.arc(s.x * canvas.width, s.y * canvas.height, s.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${s.col[0]},${s.col[1]},${s.col[2]},${alpha})`;
        ctx.fill();
      }

      // Spawn new shooting star every 3–5 s
      if (now - lastShooterMs > 3200 + Math.random() * 2000) {
        spawnShooter(now);
        lastShooterMs = now;
      }

      // Draw shooting stars
      for (let i = shooters.length - 1; i >= 0; i--) {
        const s   = shooters[i];
        const age = (now - s.born) / s.life;
        if (age >= 1) { shooters.splice(i, 1); continue; }

        const t    = age * s.life / 1000;
        const mag  = Math.hypot(s.vx, s.vy);
        const hx   = s.x  + s.vx * t;
        const hy   = s.y  + s.vy * t;
        const tx   = hx   - (s.vx / mag) * s.tailLen;
        const ty   = hy   - (s.vy / mag) * s.tailLen;
        const fade = age < 0.2 ? age / 0.2 : 1 - (age - 0.2) / 0.8;

        const grad = ctx.createLinearGradient(tx, ty, hx, hy);
        grad.addColorStop(0, 'rgba(255,255,255,0)');
        grad.addColorStop(1, `rgba(255,255,255,${fade * 0.85})`);

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(hx, hy);
        ctx.strokeStyle = grad;
        ctx.lineWidth   = 1.6;
        ctx.stroke();

        // Bright head dot
        ctx.beginPath();
        ctx.arc(hx, hy, 1.4, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${fade * 0.95})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }} />
  );
}
