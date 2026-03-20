// ================================
// Sound Manager (Web Audio API)
// ================================
const Sound = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  function tone(freq, type, startAt, dur, vol = 0.25, endFreq = null) {
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
      tone(523, 'square', t,       0.08, 0.22);  // C5
      tone(659, 'square', t + 0.09, 0.08, 0.22);  // E5
      tone(784, 'square', t + 0.18, 0.18, 0.25);  // G5
    },

    wrong() {
      const t = getCtx().currentTime;
      tone(280, 'sawtooth', t,       0.18, 0.28, 160);
      tone(180, 'sawtooth', t + 0.2, 0.28, 0.28, 90);
    },

    playerAttack() {
      const t = getCtx().currentTime;
      tone(900, 'square', t,        0.04, 0.18, 450);
      tone(1300, 'sine',  t + 0.05, 0.08, 0.14);
    },

    monsterAttack() {
      const t = getCtx().currentTime;
      tone(140, 'sawtooth', t,       0.22, 0.32, 70);
      tone(200, 'square',   t + 0.1, 0.12, 0.15, 100);
    },

    monsterDie() {
      const t = getCtx().currentTime;
      [523, 659, 784, 1046].forEach((f, i) => {
        tone(f, 'square', t + i * 0.1, 0.12, 0.2);
      });
    },

    victory() {
      const t = getCtx().currentTime;
      [523, 659, 784, 659, 784, 1046, 1046].forEach((f, i) => {
        tone(f, 'square', t + i * 0.11, 0.14, 0.18);
      });
    },

    gameOver() {
      const t = getCtx().currentTime;
      [494, 392, 330, 262].forEach((f, i) => {
        tone(f, 'sine', t + i * 0.28, 0.35, 0.22);
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

// ================================
// Visual Effects
// ================================
const FX = {
  async playerAttacks() {
    const player  = document.getElementById('player-sprite');
    const monster = document.getElementById('enemy-sprite');

    Sound.playerAttack();
    player.classList.add('anim-player-attack');

    await delay(320);
    monster.classList.add('anim-monster-hit');
    this._floatDamage('enemy', '💥');

    await delay(650);
    player.classList.remove('anim-player-attack');
    monster.classList.remove('anim-monster-hit');
  },

  async monsterAttacks() {
    const player  = document.getElementById('player-sprite');
    const monster = document.getElementById('enemy-sprite');
    const flash   = document.getElementById('flash-overlay');

    Sound.monsterAttack();
    monster.classList.add('anim-monster-attack');

    await delay(320);
    player.classList.add('anim-player-hit');
    flash.classList.add('anim-screen-flash');
    this._floatDamage('player', '💢');
    setTimeout(() => flash.classList.remove('anim-screen-flash'), 500);

    await delay(650);
    monster.classList.remove('anim-monster-attack');
    player.classList.remove('anim-player-hit');
  },

  async monsterDies() {
    const monster = document.getElementById('enemy-sprite');
    Sound.monsterDie();
    monster.classList.add('anim-monster-die');
    await delay(560);
    monster.classList.remove('anim-monster-die');
    monster.style.opacity = '0';
  },

  async newMonster(svg, name) {
    const monster = document.getElementById('enemy-sprite');
    const nameEl  = document.getElementById('enemy-name');

    monster.style.opacity = '';
    monster.innerHTML     = svg;
    nameEl.textContent    = name;

    // Reset HP segments
    document.querySelectorAll('.hp-seg').forEach(seg => seg.classList.remove('empty'));

    monster.classList.add('anim-monster-appear');
    await delay(500);
    monster.classList.remove('anim-monster-appear');
  },

  loseHeart(index) {
    const heart = document.getElementById(`heart-${index}`);
    heart.classList.add('anim-heart-lost');
    setTimeout(() => {
      heart.classList.remove('anim-heart-lost');
      heart.textContent = '🖤';
      heart.classList.add('lost');
    }, 400);
  },

  depleteMonsterHP(remaining) {
    // remaining = 2: empty seg-2; remaining = 1: empty seg-1; remaining = 0: all empty
    const idx = remaining; // seg to empty matches remaining count
    const seg = document.getElementById(`hp-seg-${idx}`);
    if (seg) seg.classList.add('empty');
  },

  _floatDamage(target, text) {
    const el = document.getElementById(`${target}-damage`);
    el.textContent = text;
    el.classList.remove('anim-float-dmg');
    // Force reflow so animation restarts
    void el.offsetWidth;
    el.classList.add('anim-float-dmg');
    setTimeout(() => {
      el.classList.remove('anim-float-dmg');
      el.textContent = '';
    }, 920);
  },
};
