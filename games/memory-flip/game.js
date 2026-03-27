const params = new URLSearchParams(location.search);
const pairType = params.get('type') || 'en-zh';
const difficulty = params.get('difficulty') || 'easy';
const PAIRS = difficulty === 'easy' ? 6 : 8;
const COLS  = difficulty === 'easy' ? 3 : 4;

// Card data sources
const EN_ZH_PAIRS = [
  { a: 'apple',  b: '🍎蘋果' },
  { a: 'banana', b: '🍌香蕉' },
  { a: 'cat',    b: '🐱貓' },
  { a: 'dog',    b: '🐶狗' },
  { a: 'fish',   b: '🐟魚' },
  { a: 'bird',   b: '🐦鳥' },
  { a: 'lion',   b: '🦁獅子' },
  { a: 'tiger',  b: '🐯老虎' },
  { a: 'bear',   b: '🐻熊' },
  { a: 'rabbit', b: '🐰兔子' },
  { a: 'red',    b: '🔴紅色' },
  { a: 'blue',   b: '🔵藍色' },
  { a: 'green',  b: '🟢綠色' },
  { a: 'yellow', b: '🟡黃色' },
  { a: 'hand',   b: '✋手' },
  { a: 'eye',    b: '👁️眼睛' },
];

const MATH_PAIRS = [
  { a: '2 + 3',  b: '5' },
  { a: '4 + 2',  b: '6' },
  { a: '7 − 3',  b: '4' },
  { a: '5 + 4',  b: '9' },
  { a: '8 − 5',  b: '3' },
  { a: '6 + 3',  b: '9' },
  { a: '9 − 4',  b: '5' },
  { a: '3 + 7',  b: '10' },
  { a: '2 × 4',  b: '8' },
  { a: '3 × 3',  b: '9' },
  { a: '10 − 6', b: '4' },
  { a: '5 + 6',  b: '11' },
  { a: '4 × 2',  b: '8' },
  { a: '7 + 5',  b: '12' },
  { a: '9 − 6',  b: '3' },
  { a: '6 × 2',  b: '12' },
];

const ZH_EN_PAIRS = EN_ZH_PAIRS.map(p => ({ a: p.b, b: p.a }));

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

let source;
if (pairType === 'math')  source = MATH_PAIRS;
else if (pairType === 'zh-en') source = ZH_EN_PAIRS;
else source = EN_ZH_PAIRS;

const selectedPairs = shuffle(source).slice(0, PAIRS);

// Build card data: each pair becomes 2 cards with same pairId
const cardData = [];
selectedPairs.forEach((p, pairId) => {
  cardData.push({ id: cardData.length, pairId, text: p.a, matched: false });
  cardData.push({ id: cardData.length, pairId, text: p.b, matched: false });
});
const shuffledCards = shuffle(cardData);

// State
const state = {
  flipped: [],    // indices of currently face-up (unmatched) cards
  matched: 0,
  flips: 0,
  locked: false,
  startTime: Date.now(),
};

// Render grid
const grid = document.getElementById('card-grid');
grid.style.gridTemplateColumns = `repeat(${COLS}, 1fr)`;

const cardEls = shuffledCards.map((card, i) => {
  const el = document.createElement('div');
  el.className = 'card';
  el.innerHTML = `
    <div class="card-inner">
      <div class="card-face card-back">🎴</div>
      <div class="card-face card-front">${card.text}</div>
    </div>`;
  el.addEventListener('click', () => handleFlip(i));
  grid.appendChild(el);
  return el;
});

function updateStats() {
  document.getElementById('progress-text').textContent = `${PAIRS} 對 / ${state.matched} 配對`;
  document.getElementById('flips-text').textContent = `翻牌：${state.flips} 次`;
}

async function handleFlip(i) {
  if (state.locked) return;
  const el = cardEls[i];
  if (el.classList.contains('flipped') || el.classList.contains('matched')) return;

  Sound.flip();
  el.classList.add('flipped');
  state.flipped.push(i);

  if (state.flipped.length < 2) return;

  state.flips++;
  updateStats();
  state.locked = true;

  const [i1, i2] = state.flipped;
  state.flipped = [];

  await delay(400);

  if (shuffledCards[i1].pairId === shuffledCards[i2].pairId) {
    // Match!
    cardEls[i1].classList.replace('flipped', 'matched');
    cardEls[i2].classList.replace('flipped', 'matched');
    Sound.match();
    state.matched++;
    updateStats();

    if (state.matched >= PAIRS) {
      await delay(600);
      endGame();
      return;
    }
  } else {
    // Mismatch
    cardEls[i1].classList.add('mismatch');
    cardEls[i2].classList.add('mismatch');
    Sound.mismatch();
    await delay(700);
    cardEls[i1].classList.remove('flipped', 'mismatch');
    cardEls[i2].classList.remove('flipped', 'mismatch');
  }

  state.locked = false;
}

function endGame() {
  document.getElementById('game-screen').classList.add('hidden');
  const resultScreen = document.getElementById('result-screen');
  resultScreen.classList.remove('hidden');

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const ratio = state.flips / PAIRS;

  let stars, title;
  if (ratio <= 1.5)       { stars = 3; title = '記憶力超強！'; }
  else if (ratio <= 2.5)  { stars = 2; title = '做得很好！'; }
  else if (ratio <= 4)    { stars = 1; title = '繼續練習！'; }
  else                    { stars = 0; title = '再試試看！'; }

  document.getElementById('result-title').textContent = title;
  const starsEl = document.getElementById('stars-display');
  starsEl.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  starsEl.style.opacity = '0';
  document.getElementById('correct-count').textContent = `${PAIRS} 對`;
  document.getElementById('wrong-count').textContent = `${state.flips} 次`;
  document.getElementById('time-count').textContent = `${elapsed} 秒`;

  setTimeout(() => {
    starsEl.style.transition = 'opacity 0.4s';
    starsEl.style.opacity = '1';
    Sound.victory();
  }, 200);
}

document.getElementById('retry-btn').addEventListener('click', () => location.reload());
document.getElementById('menu-btn').addEventListener('click', () => location.href = 'index.html');
document.getElementById('lobby-btn').addEventListener('click', () => location.href = '../../index.html');

updateStats();
