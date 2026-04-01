export const EN_ZH_PAIRS = [
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

export const MATH_PAIRS = [
  { a: '2 + 3',  b: '5'  },
  { a: '4 + 2',  b: '6'  },
  { a: '7 − 3',  b: '4'  },
  { a: '5 + 4',  b: '9'  },
  { a: '8 − 5',  b: '3'  },
  { a: '6 + 3',  b: '9'  },
  { a: '9 − 4',  b: '5'  },
  { a: '3 + 7',  b: '10' },
  { a: '2 × 4',  b: '8'  },
  { a: '3 × 3',  b: '9'  },
  { a: '10 − 6', b: '4'  },
  { a: '5 + 6',  b: '11' },
  { a: '4 × 2',  b: '8'  },
  { a: '7 + 5',  b: '12' },
  { a: '9 − 6',  b: '3'  },
  { a: '6 × 2',  b: '12' },
];

export const ZH_EN_PAIRS = EN_ZH_PAIRS.map(p => ({ a: p.b, b: p.a }));
