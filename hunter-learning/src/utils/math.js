export function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generateArith(difficulty) {
  const easy   = difficulty === 'easy';
  const isAdd  = Math.random() > 0.38;
  let a, b;

  if (easy) {
    if (isAdd) { a = rand(1, 9);  b = rand(1, 9); }
    else        { a = rand(2, 9);  b = rand(1, a - 1); }
  } else {
    if (isAdd) { a = rand(10, 60); b = rand(10, Math.min(99 - a, 50)); }
    else        { a = rand(20, 99); b = rand(10, a - 1); }
  }

  const answer = isAdd ? a + b : a - b;
  const text   = `${a} ${isAdd ? '+' : '−'} ${b}`;
  return { text, answer };
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
