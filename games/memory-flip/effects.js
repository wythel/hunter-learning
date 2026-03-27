// ================================
// Sound Manager (Web Audio API)
// ================================
const Sound = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tone(freq, type, startAt, dur, vol = 0.2, endFreq = null) {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g);
    g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, startAt);
    if (endFreq) o.frequency.linearRampToValueAtTime(endFreq, startAt + dur);
    g.gain.setValueAtTime(vol, startAt);
    g.gain.exponentialRampToValueAtTime(0.001, startAt + dur);
    o.start(startAt);
    o.stop(startAt + dur);
  }

  return {
    flip() {
      const c = getCtx();
      tone(400, 'sine', c.currentTime, 0.1, 0.12);
    },

    match() {
      const c = getCtx();
      tone(523, 'sine', c.currentTime, 0.1, 0.2);
      tone(659, 'sine', c.currentTime + 0.1, 0.1, 0.2);
      tone(784, 'sine', c.currentTime + 0.2, 0.15, 0.22);
    },

    mismatch() {
      const c = getCtx();
      tone(300, 'sine', c.currentTime, 0.12, 0.15, 200);
    },

    victory() {
      const c = getCtx();
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, i) => tone(f, 'sine', c.currentTime + i * 0.12, 0.2, 0.2));
    },

    click() {
      const c = getCtx();
      tone(700, 'sine', c.currentTime, 0.06, 0.1);
    },
  };
})();

// ================================
// Delay helper
// ================================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
