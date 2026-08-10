// 看圖認字（word-hunt）內容資料 —— 純資料，無 JSX。
// 每筆：{ id, emoji, label, img }
//   id    穩定字串，供選項比對正解（不依賴 label 值）
//   emoji 題目圖示
//   label 選項/發音要顯示與唸出的字（英文字 或 單一中文字）
//   img   選填，未來想換成 gen AI 圖片時填圖片路徑；有 img 就顯示圖、否則顯示 emoji

// 加拿大 Grade 1 常見具體名詞（emoji 畫得出來的）
export const EN_WORDS = [
  // 動物
  { id: 'en-dog',    emoji: '🐶', label: 'dog',    img: null },
  { id: 'en-cat',    emoji: '🐱', label: 'cat',    img: null },
  { id: 'en-fish',   emoji: '🐟', label: 'fish',   img: null },
  { id: 'en-bird',   emoji: '🐦', label: 'bird',   img: null },
  { id: 'en-rabbit', emoji: '🐰', label: 'rabbit', img: null },
  { id: 'en-bear',   emoji: '🐻', label: 'bear',   img: null },
  { id: 'en-pig',    emoji: '🐷', label: 'pig',    img: null },
  { id: 'en-cow',    emoji: '🐮', label: 'cow',    img: null },
  { id: 'en-duck',   emoji: '🦆', label: 'duck',   img: null },
  { id: 'en-frog',   emoji: '🐸', label: 'frog',   img: null },
  // 食物
  { id: 'en-apple',  emoji: '🍎', label: 'apple',  img: null },
  { id: 'en-banana', emoji: '🍌', label: 'banana', img: null },
  { id: 'en-milk',   emoji: '🥛', label: 'milk',   img: null },
  { id: 'en-bread',  emoji: '🍞', label: 'bread',  img: null },
  { id: 'en-egg',    emoji: '🥚', label: 'egg',    img: null },
  { id: 'en-cake',   emoji: '🍰', label: 'cake',   img: null },
  // 自然
  { id: 'en-sun',    emoji: '☀️', label: 'sun',    img: null },
  { id: 'en-moon',   emoji: '🌙', label: 'moon',   img: null },
  { id: 'en-star',   emoji: '⭐', label: 'star',   img: null },
  { id: 'en-tree',   emoji: '🌳', label: 'tree',   img: null },
  { id: 'en-flower', emoji: '🌸', label: 'flower', img: null },
  { id: 'en-rain',   emoji: '🌧️', label: 'rain',   img: null },
  { id: 'en-snow',   emoji: '❄️', label: 'snow',   img: null },
  // 日常物品
  { id: 'en-car',    emoji: '🚗', label: 'car',    img: null },
  { id: 'en-ball',   emoji: '⚽', label: 'ball',   img: null },
  { id: 'en-book',   emoji: '📖', label: 'book',   img: null },
  { id: 'en-house',  emoji: '🏠', label: 'house',  img: null },
  { id: 'en-hat',    emoji: '🎩', label: 'hat',    img: null },
  { id: 'en-shoe',   emoji: '👟', label: 'shoe',   img: null },
  { id: 'en-key',    emoji: '🔑', label: 'key',    img: null },
];

// 台灣小學一年級常見「象形／具體」單字（emoji 畫得出來的）
export const ZH_CHARS = [
  // 自然
  { id: 'zh-shan', emoji: '⛰️', label: '山', img: null },
  { id: 'zh-shui', emoji: '💧', label: '水', img: null },
  { id: 'zh-huo',  emoji: '🔥', label: '火', img: null },
  { id: 'zh-ri',   emoji: '☀️', label: '日', img: null },
  { id: 'zh-yue',  emoji: '🌙', label: '月', img: null },
  { id: 'zh-mu',   emoji: '🌳', label: '木', img: null },
  { id: 'zh-hua',  emoji: '🌸', label: '花', img: null },
  { id: 'zh-cao',  emoji: '🌿', label: '草', img: null },
  { id: 'zh-yu',   emoji: '☔', label: '雨', img: null },
  { id: 'zh-xue',  emoji: '❄️', label: '雪', img: null },
  { id: 'zh-xing', emoji: '⭐', label: '星', img: null },
  { id: 'zh-tian', emoji: '🌾', label: '田', img: null },
  // 動物
  { id: 'zh-niu',  emoji: '🐮', label: '牛', img: null },
  { id: 'zh-yang', emoji: '🐑', label: '羊', img: null },
  { id: 'zh-ma',   emoji: '🐴', label: '馬', img: null },
  { id: 'zh-niao', emoji: '🐦', label: '鳥', img: null },
  { id: 'zh-yu2',  emoji: '🐟', label: '魚', img: null },
  { id: 'zh-mao',  emoji: '🐱', label: '貓', img: null },
  { id: 'zh-gou',  emoji: '🐶', label: '狗', img: null },
  { id: 'zh-tu',   emoji: '🐰', label: '兔', img: null },
  { id: 'zh-zhu',  emoji: '🐷', label: '豬', img: null },
  { id: 'zh-xiang',emoji: '🐘', label: '象', img: null },
  // 身體
  { id: 'zh-shou', emoji: '✋', label: '手', img: null },
  { id: 'zh-mu2',  emoji: '👁️', label: '目', img: null },
  { id: 'zh-kou',  emoji: '👄', label: '口', img: null },
  { id: 'zh-er',   emoji: '👂', label: '耳', img: null },
  // 物品
  { id: 'zh-che',  emoji: '🚗', label: '車', img: null },
  { id: 'zh-chuan',emoji: '⛵', label: '船', img: null },
  { id: 'zh-san',  emoji: '☂️', label: '傘', img: null },
  { id: 'zh-shu',  emoji: '📖', label: '書', img: null },
];

export const POOLS = { en: EN_WORDS, zh: ZH_CHARS };
