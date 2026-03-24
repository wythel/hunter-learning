// ================================
// Config from URL params
// ================================
const params     = new URLSearchParams(window.location.search);
const DIFFICULTY = params.get('difficulty') || 'easy';
const TOTAL_Q    = parseInt(params.get('count')) || 10;

// ================================
// Sprites
// ================================
const PLAYER_SVG = `<svg viewBox="0 0 80 110" width="80" height="110" xmlns="http://www.w3.org/2000/svg">
  <path d="M25,55 Q8,75 12,108 L40,100 L40,55Z" fill="#9922EE"/>
  <path d="M55,55 Q72,75 68,108 L40,100 L40,55Z" fill="#7711CC"/>
  <rect x="26" y="56" width="28" height="34" rx="7" fill="#2244CC"/>
  <rect x="30" y="60" width="20" height="12" rx="4" fill="#4466EE"/>
  <rect x="30" y="60" width="20" height="5" rx="2" fill="#6688FF"/>
  <ellipse cx="40" cy="36" rx="22" ry="22" fill="#2244CC" stroke="#1122AA" stroke-width="2.5"/>
  <ellipse cx="40" cy="33" rx="18" ry="17" fill="#3355DD"/>
  <path d="M22,42 Q40,50 58,42" fill="#111833" stroke="#0a1055" stroke-width="1"/>
  <ellipse cx="33" cy="41" rx="5.5" ry="4" fill="#33FFAA"/>
  <ellipse cx="47" cy="41" rx="5.5" ry="4" fill="#33FFAA"/>
  <rect x="68" y="15" width="6" height="56" rx="2.5" fill="#B8CCDD"/>
  <rect x="61" y="33" width="20" height="6" rx="2.5" fill="#FFAA00"/>
  <circle cx="71" cy="15" r="7" fill="#FFAA00"/>
  <rect x="56" y="58" width="14" height="22" rx="6" fill="#2244CC"/>
  <ellipse cx="63" cy="80" rx="8" ry="6" fill="#3355DD"/>
  <rect x="27" y="86" width="12" height="20" rx="5" fill="#1833AA"/>
  <rect x="41" y="86" width="12" height="20" rx="5" fill="#1833AA"/>
  <ellipse cx="33" cy="108" rx="9" ry="5" fill="#0d1444"/>
  <ellipse cx="47" cy="108" rx="9" ry="5" fill="#0d1444"/>
</svg>`;

const MONSTERS = [
  {
    name: '史萊姆',
    svg: `<svg viewBox="0 0 100 100" width="105" height="105" xmlns="http://www.w3.org/2000/svg">
  <path d="M14,62 C8,38 20,12 50,10 C80,12 92,38 86,62 C80,82 68,96 50,96 C32,96 20,82 14,62Z" fill="#44CC33" stroke="#228811" stroke-width="3"/>
  <ellipse cx="38" cy="35" rx="13" ry="9" fill="#77EE55" opacity="0.45"/>
  <ellipse cx="37" cy="58" rx="11" ry="12" fill="white"/>
  <ellipse cx="63" cy="58" rx="11" ry="12" fill="white"/>
  <circle cx="39" cy="60" r="7" fill="#1a1a1a"/>
  <circle cx="65" cy="60" r="7" fill="#1a1a1a"/>
  <circle cx="37" cy="57" r="3" fill="white"/>
  <circle cx="63" cy="57" r="3" fill="white"/>
  <path d="M38,74 Q50,83 62,74" stroke="#228811" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>`
  },
  {
    name: '小蝙蝠',
    svg: `<svg viewBox="0 0 134 96" width="134" height="96" xmlns="http://www.w3.org/2000/svg">
  <path d="M46,52 C34,40 14,26 4,32 C0,44 10,60 24,62 C32,64 40,60 46,54Z" fill="#5522AA" stroke="#330088" stroke-width="2"/>
  <path d="M88,52 C100,40 120,26 130,32 C134,44 124,60 110,62 C102,64 94,60 88,54Z" fill="#5522AA" stroke="#330088" stroke-width="2"/>
  <ellipse cx="67" cy="58" rx="30" ry="33" fill="#6633BB" stroke="#330088" stroke-width="2.5"/>
  <polygon points="52,30 46,6 60,24" fill="#6633BB" stroke="#330088" stroke-width="2"/>
  <polygon points="82,30 88,6 74,24" fill="#6633BB" stroke="#330088" stroke-width="2"/>
  <polygon points="54,28 48,12 58,24" fill="#FF88BB" opacity="0.5"/>
  <polygon points="80,28 86,12 76,24" fill="#FF88BB" opacity="0.5"/>
  <ellipse cx="56" cy="52" rx="9" ry="10" fill="#FF2222"/>
  <ellipse cx="78" cy="52" rx="9" ry="10" fill="#FF2222"/>
  <ellipse cx="56" cy="52" rx="4" ry="7" fill="#110000"/>
  <ellipse cx="78" cy="52" rx="4" ry="7" fill="#110000"/>
  <circle cx="54" cy="49" r="2" fill="white" opacity="0.8"/>
  <circle cx="76" cy="49" r="2" fill="white" opacity="0.8"/>
  <polygon points="60,76 55,88 65,76" fill="white"/>
  <polygon points="74,76 69,88 79,76" fill="white"/>
</svg>`
  },
  {
    name: '小螃蟹',
    svg: `<svg viewBox="0 0 140 108" width="140" height="108" xmlns="http://www.w3.org/2000/svg">
  <line x1="50" y1="82" x2="34" y2="102" stroke="#AA1100" stroke-width="5" stroke-linecap="round"/>
  <line x1="44" y1="88" x2="25" y2="104" stroke="#AA1100" stroke-width="5" stroke-linecap="round"/>
  <line x1="90" y1="82" x2="106" y2="102" stroke="#AA1100" stroke-width="5" stroke-linecap="round"/>
  <line x1="96" y1="88" x2="115" y2="104" stroke="#AA1100" stroke-width="5" stroke-linecap="round"/>
  <path d="M40,65 Q22,58 14,48" stroke="#CC3311" stroke-width="12" fill="none" stroke-linecap="round"/>
  <circle cx="10" cy="42" r="16" fill="#DD3322" stroke="#AA1100" stroke-width="2.5"/>
  <path d="M100,65 Q118,58 126,48" stroke="#CC3311" stroke-width="12" fill="none" stroke-linecap="round"/>
  <circle cx="130" cy="42" r="16" fill="#DD3322" stroke="#AA1100" stroke-width="2.5"/>
  <line x1="4" y1="38" x2="14" y2="44" stroke="#881100" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="4" y1="46" x2="14" y2="40" stroke="#881100" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="136" y1="38" x2="126" y2="44" stroke="#881100" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="136" y1="46" x2="126" y2="40" stroke="#881100" stroke-width="2.5" stroke-linecap="round"/>
  <ellipse cx="70" cy="74" rx="38" ry="30" fill="#EE4433" stroke="#AA1100" stroke-width="2.5"/>
  <ellipse cx="70" cy="68" rx="24" ry="15" fill="#FF6655" opacity="0.35"/>
  <rect x="56" y="40" width="6" height="18" rx="3" fill="#AA1100"/>
  <rect x="78" y="40" width="6" height="18" rx="3" fill="#AA1100"/>
  <circle cx="59" cy="38" r="11" fill="white" stroke="#AA1100" stroke-width="2"/>
  <circle cx="81" cy="38" r="11" fill="white" stroke="#AA1100" stroke-width="2"/>
  <circle cx="61" cy="39" r="6.5" fill="#1a1a1a"/>
  <circle cx="83" cy="39" r="6.5" fill="#1a1a1a"/>
  <circle cx="58" cy="36" r="2.5" fill="white"/>
  <circle cx="80" cy="36" r="2.5" fill="white"/>
</svg>`
  },
  {
    name: '小幽靈',
    svg: `<svg viewBox="0 0 100 112" width="100" height="112" xmlns="http://www.w3.org/2000/svg">
  <ellipse cx="50" cy="54" rx="46" ry="50" fill="#AACCFF" opacity="0.18"/>
  <path d="M12,54 C12,24 28,8 50,8 C72,8 88,24 88,54 L88,88 Q78,80 68,88 Q59,95 50,88 Q41,95 32,88 Q22,80 12,88 Z" fill="#DDEEFF" stroke="#8899BB" stroke-width="2.5"/>
  <ellipse cx="36" cy="54" rx="10" ry="11" fill="#6688AA"/>
  <ellipse cx="64" cy="54" rx="10" ry="11" fill="#6688AA"/>
  <ellipse cx="36" cy="54" rx="4.5" ry="7" fill="#1a1a2a"/>
  <ellipse cx="64" cy="54" rx="4.5" ry="7" fill="#1a1a2a"/>
  <circle cx="34" cy="51" r="2.5" fill="white" opacity="0.8"/>
  <circle cx="62" cy="51" r="2.5" fill="white" opacity="0.8"/>
  <path d="M38,70 Q44,76 50,70 Q56,76 62,70" stroke="#6688AA" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <ellipse cx="24" cy="64" rx="9" ry="5" fill="#FFAABB" opacity="0.35"/>
  <ellipse cx="76" cy="64" rx="9" ry="5" fill="#FFAABB" opacity="0.35"/>
</svg>`
  },
  {
    name: '火焰龍',
    svg: `<svg viewBox="0 0 120 112" width="120" height="112" xmlns="http://www.w3.org/2000/svg">
  <path d="M36,22 L28,2 L44,18Z" fill="#BB4400" stroke="#882200" stroke-width="1.5"/>
  <path d="M84,22 L92,2 L76,18Z" fill="#BB4400" stroke="#882200" stroke-width="1.5"/>
  <ellipse cx="60" cy="58" rx="50" ry="44" fill="#33AA33" stroke="#1A7722" stroke-width="3"/>
  <ellipse cx="60" cy="80" rx="28" ry="20" fill="#44BB44" stroke="#1A7722" stroke-width="2"/>
  <ellipse cx="50" cy="77" rx="5" ry="4" fill="#1A7722"/>
  <ellipse cx="70" cy="77" rx="5" ry="4" fill="#1A7722"/>
  <path d="M22,52 Q28,47 34,52 Q40,47 46,52 Q52,47 58,52 Q64,47 70,52 Q76,47 82,52 Q88,47 94,52 Q100,47 106,52" stroke="#1A7722" stroke-width="1.5" fill="none"/>
  <path d="M26,64 Q32,59 38,64 Q44,59 50,64 Q56,59 62,64 Q68,59 74,64 Q80,59 86,64 Q92,59 98,64" stroke="#1A7722" stroke-width="1.5" fill="none"/>
  <ellipse cx="40" cy="46" rx="14" ry="13" fill="#FFCC00" stroke="#1A7722" stroke-width="2"/>
  <ellipse cx="80" cy="46" rx="14" ry="13" fill="#FFCC00" stroke="#1A7722" stroke-width="2"/>
  <ellipse cx="40" cy="46" rx="4.5" ry="11" fill="#110000"/>
  <ellipse cx="80" cy="46" rx="4.5" ry="11" fill="#110000"/>
  <circle cx="37" cy="41" r="2" fill="white" opacity="0.7"/>
  <circle cx="77" cy="41" r="2" fill="white" opacity="0.7"/>
  <path d="M46,97 Q38,106 36,112 Q44,107 50,112 Q56,107 60,112 Q64,107 70,112 Q76,107 74,97Z" fill="#FF8800"/>
  <path d="M48,100 Q42,107 40,112 Q47,108 52,112 Q58,108 60,112 Q62,108 68,112 Q66,107 72,100Z" fill="#FFD700"/>
</svg>`
  },
];

// ================================
// Game State
// ================================
const state = {
  currentQ:     0,
  correctCount: 0,
  wrongCount:   0,
  playerHP:     3,       // 3 hearts
  monsterHP:    1,       // 1 HP per monster
  monsterIdx:   0,
  answer:       '',
  locked:       false,   // block input during animations
  startTime:    Date.now(),
};

// ================================
// Question Generator
// ================================
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateQuestion() {
  const easy  = DIFFICULTY === 'easy';
  const isAdd = Math.random() > 0.38; // ~62% addition
  let a, b;

  if (easy) {
    if (isAdd) {
      a = rand(1, 9);
      b = rand(1, 9);
    } else {
      a = rand(2, 9);
      b = rand(1, a - 1);
    }
  } else {
    if (isAdd) {
      a = rand(10, 60);
      b = rand(10, Math.min(99 - a, 50));
    } else {
      a = rand(20, 99);
      b = rand(10, a - 1);
    }
  }

  const answer = isAdd ? a + b : a - b;
  const text   = `${a} ${isAdd ? '+' : '−'} ${b} = ?`;
  return { text, answer };
}

// ================================
// DOM refs
// ================================
const questionEl    = document.getElementById('question');
const answerDisplay = document.getElementById('answer-display');
const progressEl    = document.getElementById('progress');
const battleScreen  = document.getElementById('battle-screen');
const resultScreen  = document.getElementById('result-screen');

let currentQuestion = null;

// ================================
// Display update
// ================================
function refreshDisplay() {
  questionEl.textContent    = currentQuestion.text;
  answerDisplay.textContent = state.answer === '' ? '_' : state.answer;
  progressEl.textContent    = `第 ${state.currentQ + 1} / ${TOTAL_Q} 題`;
}

// ================================
// Answer submission
// ================================
async function submitAnswer() {
  if (state.locked || state.answer === '') return;
  state.locked = true;

  const userAns = parseInt(state.answer, 10);
  const correct = userAns === currentQuestion.answer;

  state.currentQ++;
  state.answer = '';

  if (correct) {
    state.correctCount++;
    Sound.correct();
    await FX.playerAttacks();

    // Deplete monster HP
    state.monsterHP--;
    FX.depleteMonsterHP(state.monsterHP);

    if (state.monsterHP === 0) {
      await FX.monsterDies();
      state.monsterHP = 1;
      state.monsterIdx = (state.monsterIdx + 1) % MONSTERS.length;
      const next = MONSTERS[state.monsterIdx];
      await FX.newMonster(next.svg, next.name);
    }

  } else {
    state.wrongCount++;
    Sound.wrong();
    await FX.monsterAttacks();

    state.playerHP--;
    FX.loseHeart(state.playerHP); // loses heart at current index (2→1→0)

    if (state.playerHP === 0) {
      await delay(500);
      Sound.gameOver();
      await delay(1200);
      endGame(false);
      return;
    }
  }

  if (state.currentQ >= TOTAL_Q) {
    await delay(300);
    Sound.victory();
    await delay(800);
    endGame(true);
    return;
  }

  currentQuestion = generateQuestion();
  refreshDisplay();
  state.locked = false;
}

// ================================
// End Game
// ================================
function endGame(completed) {
  battleScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');

  const elapsed  = Math.floor((Date.now() - state.startTime) / 1000);
  const total    = state.correctCount + state.wrongCount;
  const accuracy = total > 0 ? state.correctCount / total : 0;

  let stars;
  if (state.wrongCount === 0)       stars = 3;
  else if (state.wrongCount === 1)  stars = 3;
  else if (accuracy >= 0.7)         stars = 2;
  else if (accuracy >= 0.4)         stars = 1;
  else                              stars = 0;

  const starStr = ['☆☆☆', '⭐☆☆', '⭐⭐☆', '⭐⭐⭐'][stars];

  document.getElementById('result-title').textContent =
    !completed          ? '勇者倒下了...' :
    stars === 3         ? '完美通關！' :
    stars >= 2          ? '戰鬥結束！' : '辛苦了！';

  document.getElementById('stars-display').textContent = starStr;
  document.getElementById('correct-count').textContent = `${state.correctCount} 題`;
  document.getElementById('wrong-count').textContent   = `${state.wrongCount} 題`;
  document.getElementById('time-count').textContent    = `${elapsed} 秒`;

  // Animate stars in with slight delay
  const starsEl = document.getElementById('stars-display');
  starsEl.style.opacity = '0';
  setTimeout(() => {
    starsEl.style.transition = 'opacity 0.4s';
    starsEl.style.opacity = '1';
  }, 200);
}

// ================================
// Numpad input
// ================================
document.querySelector('.numpad').addEventListener('click', e => {
  const btn = e.target.closest('.num-btn');
  if (!btn || state.locked) return;

  const val = btn.dataset.num;
  Sound.click();

  if (val === 'back') {
    state.answer = state.answer.slice(0, -1);
    refreshDisplay();
  } else if (val === 'ok') {
    submitAnswer();
  } else {
    if (state.answer.length >= 3) return; // max 3 digits
    state.answer += val;
    refreshDisplay();
  }
});

// Keyboard support (desktop testing)
document.addEventListener('keydown', e => {
  if (state.locked) return;
  if (e.key >= '0' && e.key <= '9') {
    if (state.answer.length < 3) {
      state.answer += e.key;
      refreshDisplay();
    }
  } else if (e.key === 'Backspace') {
    state.answer = state.answer.slice(0, -1);
    refreshDisplay();
  } else if (e.key === 'Enter') {
    submitAnswer();
  }
});

// ================================
// Result screen buttons
// ================================
document.getElementById('retry-btn').addEventListener('click', () => {
  window.location.reload();
});

document.getElementById('menu-btn').addEventListener('click', () => {
  window.location.href = 'index.html';
});

document.getElementById('lobby-btn').addEventListener('click', () => {
  window.location.href = '../../index.html';
});

// ================================
// Init
// ================================
const initMonster = MONSTERS[state.monsterIdx];
document.getElementById('enemy-sprite').innerHTML = initMonster.svg;
document.getElementById('enemy-name').textContent = initMonster.name;
document.getElementById('player-sprite').innerHTML = PLAYER_SVG;

currentQuestion = generateQuestion();
refreshDisplay();
