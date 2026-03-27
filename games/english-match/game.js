const WORDS = {
  animals: [
    { zh: '狗', en: 'dog', emoji: '🐶' },
    { zh: '貓', en: 'cat', emoji: '🐱' },
    { zh: '魚', en: 'fish', emoji: '🐟' },
    { zh: '鳥', en: 'bird', emoji: '🐦' },
    { zh: '兔子', en: 'rabbit', emoji: '🐰' },
    { zh: '獅子', en: 'lion', emoji: '🦁' },
    { zh: '大象', en: 'elephant', emoji: '🐘' },
    { zh: '老虎', en: 'tiger', emoji: '🐯' },
    { zh: '熊', en: 'bear', emoji: '🐻' },
    { zh: '豬', en: 'pig', emoji: '🐷' },
    { zh: '馬', en: 'horse', emoji: '🐴' },
    { zh: '羊', en: 'sheep', emoji: '🐑' },
    { zh: '雞', en: 'chicken', emoji: '🐔' },
    { zh: '青蛙', en: 'frog', emoji: '🐸' },
    { zh: '蛇', en: 'snake', emoji: '🐍' },
  ],
  fruits: [
    { zh: '蘋果', en: 'apple', emoji: '🍎' },
    { zh: '香蕉', en: 'banana', emoji: '🍌' },
    { zh: '葡萄', en: 'grape', emoji: '🍇' },
    { zh: '西瓜', en: 'watermelon', emoji: '🍉' },
    { zh: '草莓', en: 'strawberry', emoji: '🍓' },
    { zh: '橘子', en: 'orange', emoji: '🍊' },
    { zh: '檸檬', en: 'lemon', emoji: '🍋' },
    { zh: '梨子', en: 'pear', emoji: '🍐' },
    { zh: '桃子', en: 'peach', emoji: '🍑' },
    { zh: '鳳梨', en: 'pineapple', emoji: '🍍' },
    { zh: '芒果', en: 'mango', emoji: '🥭' },
    { zh: '椰子', en: 'coconut', emoji: '🥥' },
    { zh: '藍莓', en: 'blueberry', emoji: '🫐' },
    { zh: '奇異果', en: 'kiwi', emoji: '🥝' },
    { zh: '櫻桃', en: 'cherry', emoji: '🍒' },
  ],
  colors: [
    { zh: '紅色', en: 'red', emoji: '🔴' },
    { zh: '藍色', en: 'blue', emoji: '🔵' },
    { zh: '綠色', en: 'green', emoji: '🟢' },
    { zh: '黃色', en: 'yellow', emoji: '🟡' },
    { zh: '紫色', en: 'purple', emoji: '🟣' },
    { zh: '橘色', en: 'orange', emoji: '🟠' },
    { zh: '白色', en: 'white', emoji: '⚪' },
    { zh: '黑色', en: 'black', emoji: '⚫' },
    { zh: '粉紅色', en: 'pink', emoji: '🩷' },
    { zh: '咖啡色', en: 'brown', emoji: '🟤' },
  ],
  body: [
    { zh: '眼睛', en: 'eye', emoji: '👁️' },
    { zh: '耳朵', en: 'ear', emoji: '👂' },
    { zh: '嘴巴', en: 'mouth', emoji: '👄' },
    { zh: '鼻子', en: 'nose', emoji: '👃' },
    { zh: '手', en: 'hand', emoji: '✋' },
    { zh: '腳', en: 'foot', emoji: '🦶' },
    { zh: '頭', en: 'head', emoji: '🗣️' },
    { zh: '手臂', en: 'arm', emoji: '💪' },
    { zh: '腿', en: 'leg', emoji: '🦵' },
    { zh: '牙齒', en: 'tooth', emoji: '🦷' },
    { zh: '舌頭', en: 'tongue', emoji: '👅' },
    { zh: '手指', en: 'finger', emoji: '☝️' },
  ],
};

// Parse params
const params = new URLSearchParams(location.search);
const topic = params.get('topic') || 'animals';
const TOTAL_Q = parseInt(params.get('count')) || 10;

// Build word pool
let pool;
if (topic === 'mix') {
  pool = [...WORDS.animals, ...WORDS.fruits, ...WORDS.colors, ...WORDS.body];
} else {
  pool = WORDS[topic] || WORDS.animals;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const state = {
  currentQ: 0,
  correctCount: 0,
  wrongCount: 0,
  locked: false,
  startTime: Date.now(),
  questions: [],
};

// Pre-generate shuffled question list
state.questions = shuffle(pool).slice(0, TOTAL_Q);

// DOM refs
const gameScreen = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');
const emojiEl = document.getElementById('emoji-display');
const zhEl = document.getElementById('zh-display');
const progressEl = document.getElementById('progress');
const choiceBtns = document.querySelectorAll('.choice-btn');

let correctIdx = -1;

function loadQuestion() {
  const q = state.questions[state.currentQ];
  progressEl.textContent = `第 ${state.currentQ + 1} / ${TOTAL_Q} 題`;
  emojiEl.textContent = q.emoji;
  zhEl.textContent = q.zh;

  // Generate 4 choices: 1 correct + 3 wrong from pool
  const others = pool.filter(w => w.en !== q.en);
  const wrong3 = shuffle(others).slice(0, 3);
  const choices = shuffle([q, ...wrong3]);
  correctIdx = choices.findIndex(c => c.en === q.en);

  choiceBtns.forEach((btn, i) => {
    btn.textContent = choices[i].en;
    btn.className = 'choice-btn';
    btn.disabled = false;
  });

  state.locked = false;
}

async function handleChoice(idx) {
  if (state.locked) return;
  state.locked = true;

  choiceBtns.forEach(b => b.disabled = true);

  const isCorrect = idx === correctIdx;

  if (isCorrect) {
    choiceBtns[idx].classList.add('correct');
    Sound.correct();
    // bounce emoji
    emojiEl.classList.remove('bounce');
    void emojiEl.offsetWidth;
    emojiEl.classList.add('bounce');
    state.correctCount++;
  } else {
    choiceBtns[idx].classList.add('wrong');
    choiceBtns[correctIdx].classList.add('correct');
    Sound.wrong();
    state.wrongCount++;
  }

  await delay(isCorrect ? 800 : 1100);

  state.currentQ++;
  if (state.currentQ >= TOTAL_Q) {
    endGame();
  } else {
    loadQuestion();
  }
}

choiceBtns.forEach((btn, i) => {
  btn.addEventListener('click', () => handleChoice(i));
});

function endGame() {
  gameScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');

  const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
  const wrong = state.wrongCount;
  const total = TOTAL_Q;
  const pct = wrong / total;

  let stars = 0, title = '';
  if (pct === 0)        { stars = 3; title = '全部答對！'; }
  else if (pct <= 0.2)  { stars = 3; title = '非常棒！'; }
  else if (pct <= 0.4)  { stars = 2; title = '繼續努力！'; }
  else if (pct <= 0.6)  { stars = 1; title = '多練習！'; }
  else                  { stars = 0; title = '再試一次！'; }

  const starStr = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

  document.getElementById('result-title').textContent = title;
  const starsEl = document.getElementById('stars-display');
  starsEl.textContent = starStr;
  starsEl.style.opacity = '0';
  document.getElementById('correct-count').textContent = `${state.correctCount} 題`;
  document.getElementById('wrong-count').textContent = `${state.wrongCount} 題`;
  document.getElementById('time-count').textContent = `${elapsed} 秒`;

  setTimeout(() => {
    starsEl.style.transition = 'opacity 0.4s';
    starsEl.style.opacity = '1';
    Sound.victory();
  }, 200);
}

// Result buttons
document.getElementById('retry-btn').addEventListener('click', () => location.reload());
document.getElementById('menu-btn').addEventListener('click', () => location.href = 'index.html');
document.getElementById('lobby-btn').addEventListener('click', () => location.href = '../../index.html');

// Start
loadQuestion();
