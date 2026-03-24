// ================================
// Config from URL params
// ================================
const params     = new URLSearchParams(window.location.search);
const MODE       = params.get('mode')       || 'read';
const DIFFICULTY = params.get('difficulty') || 'hour';
const TOTAL_Q    = parseInt(params.get('count')) || 10;

// ================================
// Game State
// ================================
const state = {
  currentQ:     0,
  correctCount: 0,
  wrongCount:   0,
  locked:       false,
  startTime:    Date.now(),
};

// Mode 2 sub-state
const m2 = {
  hourSet:   false,
  minuteSet: false,
  hour:      null,
  minute:    null,
};

let currentQuestion = null;

// ================================
// DOM refs
// ================================
const clockSvg     = document.getElementById('clock-svg');
const digHour      = document.getElementById('dig-hour');
const digMinute    = document.getElementById('dig-minute');
const digClock     = document.getElementById('digital-clock');
const instruction  = document.getElementById('set-instruction');
const progressEl   = document.getElementById('progress');
const choicesGrid  = document.getElementById('choices-grid');
const setControls  = document.getElementById('set-controls');
const confirmBtn   = document.getElementById('confirm-btn');
const gameScreen   = document.getElementById('game-screen');
const resultScreen = document.getElementById('result-screen');

// ================================
// Helpers
// ================================
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTime(h, m) {
  return `${h}:${String(m).padStart(2, '0')}`;
}

function setDigital(h, m) {
  digHour.textContent   = String(h);
  digMinute.textContent = String(m).padStart(2, '0');
}

function setDigitalBlank() {
  digHour.textContent   = '?';
  digMinute.textContent = '??';
}

function revealDigital(h, m) {
  setDigital(h, m);
  digClock.classList.remove('no-blink', 'reveal');
  void digClock.offsetWidth;
  digClock.classList.add('reveal', 'no-blink');
}

function setInstruction(text, ready = false) {
  instruction.textContent = text;
  instruction.classList.toggle('ready', ready);
}

function updateProgress() {
  progressEl.textContent = `第 ${state.currentQ + 1} / ${TOTAL_Q} 題`;
}

// ================================
// Question Generation
// ================================
function generateQuestion() {
  const hour = rand(1, 12);
  let minute;
  if (DIFFICULTY === 'hour')    minute = 0;
  else if (DIFFICULTY === 'half') minute = Math.random() < 0.5 ? 0 : 30;
  else                            minute = rand(0, 11) * 5;
  return { hour, minute };
}

function generateChoices(q) {
  const used    = new Set([q.hour * 100 + q.minute]);
  const choices = [{ ...q }];
  let attempts  = 0;

  while (choices.length < 4 && attempts < 200) {
    attempts++;
    const h = rand(1, 12);
    let m;
    if (DIFFICULTY === 'hour')    m = 0;
    else if (DIFFICULTY === 'half') m = Math.random() < 0.5 ? 0 : 30;
    else                            m = rand(0, 11) * 5;

    const key = h * 100 + m;
    if (!used.has(key)) {
      used.add(key);
      choices.push({ hour: h, minute: m });
    }
  }

  // Shuffle (Fisher-Yates)
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices;
}

// ================================
// Mode 1 — Load question
// ================================
function loadMode1Question() {
  currentQuestion = generateQuestion();

  // Show analog clock at question time (instant)
  Clock.setTime(currentQuestion.hour, currentQuestion.minute, true);

  // Hide digital clock
  setDigitalBlank();
  digClock.classList.add('no-blink');

  // Generate and populate choices
  const choices = generateChoices(currentQuestion);
  document.querySelectorAll('.choice-btn').forEach((btn, i) => {
    btn.textContent      = formatTime(choices[i].hour, choices[i].minute);
    btn.dataset.hour     = choices[i].hour;
    btn.dataset.minute   = choices[i].minute;
    btn.className        = 'choice-btn';
    btn.disabled         = false;
  });

  updateProgress();
}

// ================================
// Mode 1 — Handle choice tap
// ================================
async function handleChoice(btn) {
  if (state.locked) return;
  state.locked = true;

  // Disable all buttons
  document.querySelectorAll('.choice-btn').forEach(b => b.disabled = true);

  const h = parseInt(btn.dataset.hour);
  const m = parseInt(btn.dataset.minute);
  const correct = (h === currentQuestion.hour && m === currentQuestion.minute);

  // Always reveal digital clock with correct answer
  revealDigital(currentQuestion.hour, currentQuestion.minute);

  if (correct) {
    Sound.correct();
    btn.classList.add('choice-correct');
    clockBounce();
    state.correctCount++;
    await delay(900);
  } else {
    Sound.wrong();
    btn.classList.add('choice-wrong');

    // Highlight the correct button
    document.querySelectorAll('.choice-btn').forEach(b => {
      if (parseInt(b.dataset.hour)   === currentQuestion.hour &&
          parseInt(b.dataset.minute) === currentQuestion.minute) {
        b.classList.add('choice-correct');
      }
    });

    // Teaching: bounce clock to emphasize analog↔digital connection
    await delay(350);
    Sound.teaching();
    clockBounce();
    await delay(1000);
    state.wrongCount++;
  }

  state.currentQ++;
  if (state.currentQ >= TOTAL_Q) {
    await delay(200);
    endGame();
    return;
  }

  await delay(200);
  loadMode1Question();
  state.locked = false;
}

// ================================
// Mode 2 — Load question
// ================================
function loadMode2Question() {
  currentQuestion = generateQuestion();

  // Reset sub-state
  m2.hourSet = m2.minuteSet = false;
  m2.hour = m2.minute = null;

  // Show digital clock as the question (what to set)
  setDigital(currentQuestion.hour, currentQuestion.minute);
  digClock.classList.add('no-blink');

  // Start analog at a neutral position (±4 hours from answer, prevents giving it away)
  const neutralHour = (currentQuestion.hour + 4 - 1) % 12 + 1;
  Clock.setTime(neutralHour, 0, true);


  // Reset confirm button
  confirmBtn.disabled = true;
  confirmBtn.classList.remove('active');

  // Set instruction
  const instrMap = {
    hour:    '點時鐘，設定幾點',
    half:    '點時鐘中間設時、外圍選整半點',
    precise: '點時鐘中間設時、外圍設分',
  };
  setInstruction(instrMap[DIFFICULTY]);

  // Enable clock input
  Clock.enableInput(DIFFICULTY, onHourTap, onMinuteTap);

  updateProgress();
}

// ================================
// Mode 2 — Clock tap callbacks
// ================================
function onHourTap(hour) {
  if (state.locked) return;
  m2.hourSet = true;
  m2.hour    = hour;

  // Live-update digital display
  const mStr = m2.minuteSet ? String(m2.minute).padStart(2, '0') : '??';
  setDigital(hour, mStr);

  if (DIFFICULTY === 'hour') {
    // Minute is always 0, auto-confirm ready
    m2.minute    = 0;
    m2.minuteSet = true;
    setDigital(hour, '00');
    activateConfirm();
  } else if (DIFFICULTY === 'half') {
    // Wait for outer-ring minute tap
    if (m2.minuteSet) activateConfirm();
    else setInstruction('點時鐘外圍，選整點或半點');
  } else {
    // Precise: wait for outer ring minute tap
    if (m2.minuteSet) activateConfirm();
    else setInstruction('點時鐘外圍，設定分鐘');
  }
}

function onMinuteTap(minute) {
  if (state.locked) return;
  Sound.tickMinute();
  m2.minuteSet = true;
  m2.minute    = minute;

  if (m2.hourSet) {
    setDigital(m2.hour, minute);
    activateConfirm();
  } else {
    // Minute set before hour (precise mode edge case)
    setDigital('?', minute);
    setInstruction('點時鐘中間，設定幾點');
  }
}

function activateConfirm() {
  confirmBtn.disabled = false;
  confirmBtn.classList.add('active');
  Sound.ready();
  setInstruction('按確認送出！', true);
}

// ================================
// Mode 2 — Confirm
// ================================
async function handleConfirm() {
  if (state.locked || !confirmBtn.classList.contains('active')) return;
  state.locked = true;

  Clock.disableInput();

  const correct = (m2.hour === currentQuestion.hour && m2.minute === currentQuestion.minute);

  if (correct) {
    Sound.correct();
    // Animate hands to exact position (including minute offset on hour hand)
    Clock.setTime(currentQuestion.hour, currentQuestion.minute);
    clockBounce();
    state.correctCount++;
    await delay(900);
  } else {
    Sound.wrong();
    await delay(350);
    // Teaching: animate both hands to correct position
    Sound.teaching();
    clockSvg.classList.add('teaching-anim');
    Clock.setTime(currentQuestion.hour, currentQuestion.minute);
    // Also update digital to show correct
    revealDigital(currentQuestion.hour, currentQuestion.minute);
    await delay(1100);
    clockSvg.classList.remove('teaching-anim');
    state.wrongCount++;
  }

  state.currentQ++;
  if (state.currentQ >= TOTAL_Q) {
    await delay(200);
    endGame();
    return;
  }

  await delay(200);
  loadMode2Question();
  state.locked = false;
}

confirmBtn.addEventListener('click', handleConfirm);

// ================================
// Mode 1 — Choice button listeners
// ================================
choicesGrid.addEventListener('click', e => {
  const btn = e.target.closest('.choice-btn');
  if (!btn || btn.disabled) return;
  handleChoice(btn);
});

// ================================
// End Game
// ================================
function endGame() {
  gameScreen.classList.add('hidden');
  resultScreen.classList.remove('hidden');

  const elapsed  = Math.floor((Date.now() - state.startTime) / 1000);
  const total    = state.correctCount + state.wrongCount;
  const pct      = total > 0 ? state.wrongCount / total : 0;

  let stars;
  if (pct === 0)       stars = 3;
  else if (pct <= 0.2) stars = 2;
  else if (pct <= 0.5) stars = 1;
  else                 stars = 0;

  const starStr = ['☆☆☆', '⭐☆☆', '⭐⭐☆', '⭐⭐⭐'][stars];
  const titles  = ['再試一次！', '繼續練習！', '非常好！', '完美！'];

  document.getElementById('result-title').textContent  = titles[stars];
  document.getElementById('stars-display').textContent = starStr;
  document.getElementById('correct-count').textContent = `${state.correctCount} 題`;
  document.getElementById('wrong-count').textContent   = `${state.wrongCount} 題`;
  document.getElementById('time-count').textContent    = `${elapsed} 秒`;

  const starsEl = document.getElementById('stars-display');
  starsEl.style.opacity = '0';
  setTimeout(() => {
    starsEl.style.transition = 'opacity 0.4s';
    starsEl.style.opacity    = '1';
    Sound.victory();
  }, 300);
}

document.getElementById('retry-btn').addEventListener('click', () => window.location.reload());
document.getElementById('menu-btn').addEventListener('click',  () => window.location.href = 'index.html');

// ================================
// Init
// ================================
Clock.build(clockSvg);

if (MODE === 'read') {
  setControls.classList.add('hidden');
  choicesGrid.classList.remove('hidden');
  loadMode1Question();
} else {
  choicesGrid.classList.add('hidden');
  setControls.classList.remove('hidden');
  loadMode2Question();
}
