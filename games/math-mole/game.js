const params = new URLSearchParams(location.search);
const difficulty = params.get('difficulty') || 'easy';
const timeLimit = parseInt(params.get('time')) || 60;
const maxAnswer = difficulty === 'easy' ? 10 : 20;

function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

const state = {
  score: 0,
  correct: 0,
  total: 0,
  timeLeft: timeLimit,
  locked: false,
  timerInterval: null,
  moleTimers: [],
  currentAnswer: 0,
  running: false,
};

// DOM
const timerEl    = document.getElementById('timer-display');
const scoreEl    = document.getElementById('score-display');
const questionEl = document.getElementById('question-display');
const moleGrid   = document.getElementById('mole-grid');

// Initialize timer display
timerEl.textContent = timeLimit;

// Create 9 holes
const holes = Array.from({ length: 9 }, (_, i) => {
  const hole = document.createElement('div');
  hole.className = 'hole';
  hole.innerHTML = `
    <div class="hole-bg"></div>
    <div class="mole" data-idx="${i}">
      <div class="mole-body">🦔</div>
      <div class="mole-badge">?</div>
    </div>`;
  moleGrid.appendChild(hole);
  return {
    el: hole,
    moleEl: hole.querySelector('.mole'),
    badgeEl: hole.querySelector('.mole-badge'),
    bodyEl: hole.querySelector('.mole-body'),
    num: null,
    up: false,
  };
});

holes.forEach((h, i) => {
  h.moleEl.addEventListener('click', () => handleHit(i));
});

function generateQuestion() {
  const a = randInt(1, Math.floor(maxAnswer / 2));
  const b = randInt(1, maxAnswer - a);
  const useAdd = Math.random() < 0.6;
  let answer, text;

  if (useAdd) {
    answer = a + b;
    text = `${a} + ${b} = ?`;
  } else {
    // subtraction: show (a+b) - b = a
    answer = a;
    text = `${a + b} − ${b} = ?`;
  }

  state.currentAnswer = answer;
  questionEl.textContent = text;
}

function pickActiveMoles(count) {
  const indices = [];
  while (indices.length < count) {
    const i = randInt(0, 8);
    if (!indices.includes(i)) indices.push(i);
  }
  return indices;
}

function retractAll() {
  state.moleTimers.forEach(t => clearTimeout(t));
  state.moleTimers = [];
  holes.forEach(h => {
    h.moleEl.classList.remove('up');
    h.up = false;
    h.num = null;
  });
}

function showMoles() {
  if (!state.running) return;
  retractAll();
  generateQuestion();

  const answer = state.currentAnswer;
  const count = randInt(3, 4);
  const activeIdx = pickActiveMoles(count);

  // Assign numbers: one gets the correct answer, rest get wrong
  const wrongNums = new Set();
  while (wrongNums.size < count - 1) {
    const n = randInt(1, maxAnswer);
    if (n !== answer) wrongNums.add(n);
  }
  const nums = [answer, ...wrongNums];

  // Shuffle nums
  for (let i = nums.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }

  activeIdx.forEach((hIdx, i) => {
    const h = holes[hIdx];
    h.num = nums[i];
    h.badgeEl.textContent = nums[i];
    const t = setTimeout(() => {
      if (state.running) {
        h.moleEl.classList.add('up');
        h.up = true;
      }
    }, i * 80);
    state.moleTimers.push(t);
  });

  // Auto retract after 2.5s and show new moles
  const autoT = setTimeout(() => {
    if (state.running) showMoles();
  }, 2500);
  state.moleTimers.push(autoT);
}

async function handleHit(idx) {
  if (!state.running || state.locked) return;
  const h = holes[idx];
  if (!h.up) return;

  state.total++;
  const isCorrect = h.num === state.currentAnswer;

  if (isCorrect) {
    h.moleEl.classList.add('correct-hit');
    Sound.hit();
    state.score += 10;
    state.correct++;
    scoreEl.textContent = `${state.score} 分`;
    state.locked = true;
    await delay(300);
    h.moleEl.classList.remove('correct-hit', 'up');
    h.up = false;
    state.locked = false;
    showMoles();
  } else {
    h.moleEl.classList.add('wrong-hit');
    Sound.miss();
    await delay(350);
    h.moleEl.classList.remove('wrong-hit');
  }
}

function startTimer() {
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    timerEl.textContent = state.timeLeft;
    if (state.timeLeft <= 10) {
      timerEl.classList.add('urgent');
      Sound.tick();
    }
    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  state.running = false;
  retractAll();

  const resultScreen = document.getElementById('result-screen');
  document.getElementById('game-screen').classList.add('hidden');
  resultScreen.classList.remove('hidden');

  const accuracy = state.total > 0 ? state.correct / state.total : 0;
  const wrongCount = state.total - state.correct;

  let stars, title;
  if (accuracy >= 0.9 && state.correct >= 8) { stars = 3; title = '反應超快！'; }
  else if (accuracy >= 0.7)                   { stars = 2; title = '打得不錯！'; }
  else if (accuracy >= 0.4)                   { stars = 1; title = '繼續練習！'; }
  else                                        { stars = 0; title = '再試一次！'; }

  document.getElementById('result-title').textContent = title;
  const starsEl = document.getElementById('stars-display');
  starsEl.textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  starsEl.style.opacity = '0';
  document.getElementById('correct-count').textContent = `${state.correct} 題`;
  document.getElementById('wrong-count').textContent = `${wrongCount} 次`;
  document.getElementById('time-count').textContent = `${state.score} 分`;

  setTimeout(() => {
    starsEl.style.transition = 'opacity 0.4s';
    starsEl.style.opacity = '1';
    Sound.victory();
  }, 200);
}

document.getElementById('retry-btn').addEventListener('click', () => location.reload());
document.getElementById('menu-btn').addEventListener('click', () => location.href = 'index.html');
document.getElementById('lobby-btn').addEventListener('click', () => location.href = '../../index.html');

// Start game
state.running = true;
showMoles();
startTimer();
