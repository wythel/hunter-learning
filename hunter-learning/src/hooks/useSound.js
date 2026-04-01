import { useRef } from 'react';

function tone(ctx, freq, type, startAt, dur, vol = 0.25, endFreq = null) {
  const osc  = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startAt);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, startAt + dur);
  gain.gain.setValueAtTime(vol, startAt);
  gain.gain.exponentialRampToValueAtTime(0.001, startAt + dur);
  osc.start(startAt);
  osc.stop(startAt + dur + 0.01);
}

export function useSound() {
  const ctxRef = useRef(null);

  function getCtx() {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctxRef.current;
  }

  return {
    correct() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 523, 'square', t,        0.08, 0.22);
      tone(ctx, 659, 'square', t + 0.09, 0.08, 0.22);
      tone(ctx, 784, 'square', t + 0.18, 0.18, 0.25);
    },

    wrong() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 280, 'sawtooth', t,       0.18, 0.28, 160);
      tone(ctx, 180, 'sawtooth', t + 0.2, 0.28, 0.28, 90);
    },

    click() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 900, 'sine', t, 0.04, 0.08);
    },

    flip() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 600, 'sine', t, 0.06, 0.12, 400);
    },

    match() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 523, 'square', t,        0.06, 0.18);
      tone(ctx, 784, 'square', t + 0.07, 0.12, 0.2);
      tone(ctx, 1046,'square', t + 0.15, 0.14, 0.2);
    },

    mismatch() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 300, 'sawtooth', t, 0.14, 0.2, 200);
    },

    hit() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 900, 'square', t,        0.04, 0.18, 450);
      tone(ctx, 1300,'sine',   t + 0.05, 0.08, 0.14);
    },

    miss() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 200, 'sawtooth', t, 0.15, 0.2, 120);
    },

    tick() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 1200, 'sine', t, 0.04, 0.1);
    },

    victory() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      [523, 659, 784, 659, 784, 1046, 1046].forEach((f, i) => {
        tone(ctx, f, 'square', t + i * 0.11, 0.14, 0.18);
      });
    },

    gameOver() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      [494, 392, 330, 262].forEach((f, i) => {
        tone(ctx, f, 'sine', t + i * 0.28, 0.35, 0.22);
      });
    },

    playerAttack() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 900, 'square', t,        0.04, 0.18, 450);
      tone(ctx, 1300,'sine',   t + 0.05, 0.08, 0.14);
    },

    monsterAttack() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 140, 'sawtooth', t,       0.22, 0.32, 70);
      tone(ctx, 200, 'square',   t + 0.1, 0.12, 0.15, 100);
    },

    monsterDie() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      [523, 659, 784, 1046].forEach((f, i) => {
        tone(ctx, f, 'square', t + i * 0.1, 0.12, 0.2);
      });
    },

    teaching() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 440, 'sine', t, 0.15, 0.18);
      tone(ctx, 550, 'sine', t + 0.18, 0.15, 0.18);
    },

    ready() {
      const ctx = getCtx();
      const t = ctx.currentTime;
      tone(ctx, 800, 'sine', t, 0.08, 0.15);
    },
  };
}
