// ================================
// Sound Manager (Web Audio API)
// ================================
const Sound = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tone(freq, type, startAt, dur, vol = 0.22, endFreq = null) {
    const c = getCtx();
    const osc  = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startAt);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, startAt + dur);
    gain.gain.setValueAtTime(vol, startAt);
    gain.gain.exponentialRampToValueAtTime(0.001, startAt + dur);
    osc.start(startAt);
    osc.stop(startAt + dur + 0.01);
  }

  return {
    correct() {
      const t = getCtx().currentTime;
      tone(523, 'square', t,        0.08, 0.22);
      tone(659, 'square', t + 0.09, 0.08, 0.22);
      tone(784, 'square', t + 0.18, 0.18, 0.25);
    },

    wrong() {
      const t = getCtx().currentTime;
      tone(280, 'sawtooth', t,       0.18, 0.28, 160);
      tone(180, 'sawtooth', t + 0.2, 0.28, 0.28, 90);
    },

    victory() {
      const t = getCtx().currentTime;
      [523, 659, 784, 659, 784, 1046, 1046].forEach((f, i) => {
        tone(f, 'square', t + i * 0.11, 0.14, 0.18);
      });
    },

    click() {
      const t = getCtx().currentTime;
      tone(900, 'sine', t, 0.04, 0.08);
    },
  };
})();

// ================================
// Delay helper
// ================================
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
