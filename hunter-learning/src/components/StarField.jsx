import { useEffect, useRef } from 'react';

const STAR_COUNT = 120;

export default function StarField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Generate stars once
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
    }));

    let frame;
    let start = performance.now();

    function draw(now) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const elapsed = (now - start) / 1000;

      for (const s of stars) {
        const t = ((elapsed - s.delay) / s.duration) % 1;
        const phase = t < 0.5 ? t * 2 : 2 - t * 2; // triangle wave 0→1→0
        const opacity = 0.2 + phase * 0.7;
        const scale = 1 + phase * 0.4;

        ctx.beginPath();
        ctx.arc(
          s.x * canvas.width,
          s.y * canvas.height,
          s.r * scale,
          0, Math.PI * 2
        );
        ctx.fillStyle = `rgba(200, 230, 255, ${opacity})`;
        ctx.fill();
      }

      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
