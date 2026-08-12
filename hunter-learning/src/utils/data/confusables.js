// 英文「困難」難度用的相近字（confusables）—— 純資料 + 純函式。
//
// 用途：兩個看圖選字遊戲（word-hunt 英文模式、english-match）的困難模式，
// 干擾選項改成「拼字/發音相近的真實英文字」，而不是隨機抽差很多的字，
// 這樣小朋友沒辦法只把每個選項唸出來、靠聲音差異排除答案，必須真的認得完整拼字。
//
// key   小寫英文答案字（涵蓋兩個遊戲英文字池的聯集；orange 等重複字共用一組）
// value 一組相近的真實英文字（不含答案本身、彼此不重複、都是真字不是錯字）
//       每個答案至少 3 個，讓 word-hunt 英文困難模式永遠不必退回隨機補齊。

import { shuffle } from '../math';

export const EN_CONFUSABLES = {
  // 動物
  dog:      ['dot', 'log', 'fog', 'dig', 'dug'],
  cat:      ['cap', 'car', 'can', 'bat', 'hat'],
  fish:     ['dish', 'wish', 'fist', 'fin'],
  bird:     ['bard', 'board', 'beard', 'third'],
  rabbit:   ['rabbi', 'rapid', 'habit', 'orbit'],
  bear:     ['beer', 'bean', 'bead', 'pear', 'wear'],
  pig:      ['pin', 'pit', 'big', 'wig', 'fig'],
  cow:      ['cop', 'cot', 'how', 'now', 'bow'],
  duck:     ['dusk', 'luck', 'dock', 'deck', 'duct'],
  frog:     ['frock', 'from', 'frost', 'fog'],
  lion:     ['loin', 'line', 'lint', 'liar'],
  elephant: ['element', 'elegant', 'eleven'],
  tiger:    ['timer', 'diner', 'eager', 'finer'],
  horse:    ['house', 'hoarse', 'horde', 'worse', 'morse'],
  sheep:    ['sheet', 'sleep', 'sheen', 'sweep', 'steep'],
  chicken:  ['kitchen', 'thicken', 'quicken', 'chicks'],
  snake:    ['shake', 'stake', 'snack', 'sneak', 'stale'],

  // 食物 / 水果
  apple:      ['ample', 'apply', 'ripple', 'maple'],
  banana:     ['bandana', 'banner', 'panama', 'cabana'],
  milk:       ['mild', 'mile', 'silk', 'mink'],
  bread:      ['break', 'dread', 'tread', 'bead'],
  egg:        ['leg', 'beg', 'peg', 'keg'],
  cake:       ['lake', 'bake', 'cane', 'cape', 'cave'],
  grape:      ['grade', 'grace', 'grave', 'drape'],
  watermelon: ['watermark', 'waterfall', 'waterproof'],
  strawberry: ['raspberry', 'blackberry', 'blueberry', 'mulberry'],
  orange:     ['arrange', 'strange', 'range', 'grange'],
  lemon:      ['melon', 'demon', 'lemur', 'felon'],
  pear:       ['pearl', 'peak', 'peace', 'peal', 'bear'],
  peach:      ['peace', 'reach', 'teach', 'beach', 'poach'],
  pineapple:  ['pinecone', 'pinewood', 'pinball'],
  mango:      ['tango', 'manga', 'mange', 'mambo'],
  coconut:    ['peanut', 'walnut', 'hazelnut', 'cocoa'],
  blueberry:  ['blackberry', 'raspberry', 'strawberry', 'mulberry'],
  kiwi:       ['wiki', 'mini', 'kilo'],
  cherry:     ['berry', 'ferry', 'merry', 'cheery', 'sherry'],

  // 自然
  sun:    ['sub', 'sum', 'son', 'sin', 'bun'],
  moon:   ['moor', 'mood', 'moan', 'noon', 'soon'],
  star:   ['scar', 'stir', 'stag', 'stab', 'start'],
  tree:   ['free', 'three', 'tray', 'true'],
  flower: ['flour', 'lower', 'power', 'tower', 'slower'],
  rain:   ['main', 'pain', 'rail', 'raid', 'gain'],
  snow:   ['slow', 'snob', 'show', 'snap', 'grow'],

  // 日常物品
  car:   ['can', 'cap', 'care', 'card', 'bar'],
  ball:  ['bell', 'call', 'tall', 'wall', 'bull'],
  book:  ['boot', 'boom', 'look', 'cook', 'hook'],
  house: ['mouse', 'horse', 'hose', 'blouse', 'hound'],
  hat:   ['had', 'ham', 'hut', 'hit', 'hot'],
  shoe:  ['show', 'shore', 'shoo', 'shop', 'shot'],
  key:   ['keg', 'hey', 'ken', 'bee'],

  // 顏色
  red:    ['bed', 'rid', 'rod', 'led', 'wed'],
  blue:   ['blur', 'blew', 'glue', 'clue', 'flue'],
  green:  ['greed', 'greet', 'queen', 'preen', 'groan'],
  yellow: ['bellow', 'fellow', 'mellow', 'willow', 'pillow'],
  purple: ['purpose', 'people', 'pupil', 'purse', 'ripple'],
  white:  ['while', 'whine', 'wheat', 'write', 'quite'],
  black:  ['block', 'blank', 'slack', 'clack', 'brick'],
  pink:   ['pine', 'pint', 'link', 'sink', 'wink'],
  brown:  ['crown', 'frown', 'drown', 'brawn', 'grown'],

  // 身體
  eye:    ['aye', 'dye', 'rye', 'bye'],
  ear:    ['eat', 'earn', 'era', 'year', 'hear'],
  mouth:  ['month', 'mouse', 'moth', 'south', 'mount'],
  nose:   ['note', 'nope', 'hose', 'rose', 'node'],
  hand:   ['band', 'land', 'sand', 'hard', 'hang'],
  foot:   ['food', 'fool', 'root', 'boot', 'hoot'],
  head:   ['heap', 'heal', 'heat', 'bead', 'dead'],
  arm:    ['aim', 'art', 'ark', 'arc', 'army'],
  leg:    ['led', 'let', 'lag', 'log', 'beg'],
  tooth:  ['booth', 'truth', 'teeth', 'tools'],
  tongue: ['tongs', 'tone', 'tango'],
  finger: ['singer', 'ginger', 'linger', 'finder', 'fringe'],
};

// 挑 n 個與 word 相近的干擾字：小寫查表、排除答案本身、去重、洗牌後取前 n 個。
// 查無資料（例如中文字）回 []，由呼叫端決定 fallback。
export function pickHardDistractors(word, n = 3) {
  const key = String(word).toLowerCase();
  const bank = EN_CONFUSABLES[key];
  if (!bank) return [];
  const clean = [...new Set(bank)].filter(w => w.toLowerCase() !== key);
  return shuffle(clean).slice(0, n);
}
