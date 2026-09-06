import { pokemonArtwork as artwork } from '../../utils/pokemon';
import { shuffle } from '../../utils/math';

export const PLAYER = { name: '皮卡丘', img: artwork(25) };

// 一擊必殺:每答對一題就換下一隻
export const MONSTER_MAX_HP = 1;

const mon = (id, name) => ({ id, name, img: artwork(id) });

// 關都地區的 16 個三階段進化家族,拆成三個階段池。
// 題目進度前 1/3 出第一階段、中間 1/3 出第二階段、最後 1/3 出最終進化型。
export const EVOLUTION_STAGES = [
  // 第一階段(未進化)
  [
    mon(1,   '妙蛙種子'),
    mon(4,   '小火龍'),
    mon(7,   '傑尼龜'),
    mon(10,  '綠毛蟲'),
    mon(13,  '獨角蟲'),
    mon(16,  '波波'),
    mon(29,  '尼多蘭'),
    mon(32,  '尼多朗'),
    mon(43,  '走路草'),
    mon(60,  '蚊香蝌蚪'),
    mon(63,  '凱西'),
    mon(66,  '腕力'),
    mon(69,  '喇叭芽'),
    mon(74,  '小拳石'),
    mon(92,  '鬼斯'),
    mon(147, '迷你龍'),
  ],
  // 第二階段(中間進化)
  [
    mon(2,   '妙蛙草'),
    mon(5,   '火恐龍'),
    mon(8,   '卡咪龜'),
    mon(11,  '鐵甲蛹'),
    mon(14,  '鐵殼蛹'),
    mon(17,  '比比鳥'),
    mon(30,  '尼多娜'),
    mon(33,  '尼多力諾'),
    mon(44,  '臭臭花'),
    mon(61,  '蚊香君'),
    mon(64,  '勇基拉'),
    mon(67,  '豪力'),
    mon(70,  '口呆花'),
    mon(75,  '隆隆石'),
    mon(93,  '鬼斯通'),
    mon(148, '哈克龍'),
  ],
  // 第三階段(最終進化)
  [
    mon(3,   '妙蛙花'),
    mon(6,   '噴火龍'),
    mon(9,   '水箭龜'),
    mon(12,  '巴大蝶'),
    mon(15,  '大針蜂'),
    mon(18,  '大比鳥'),
    mon(31,  '尼多后'),
    mon(34,  '尼多王'),
    mon(45,  '霸王花'),
    mon(62,  '蚊香泳士'),
    mon(65,  '胡地'),
    mon(68,  '怪力'),
    mon(71,  '大食花'),
    mon(76,  '隆隆岩'),
    mon(94,  '耿鬼'),
    mon(149, '快龍'),
  ],
];

// 第 questionIndex 題(0-based)該出哪個進化階段:前 1/3 → 0、中 1/3 → 1、後 1/3 → 2
export function stageIndexFor(questionIndex, count) {
  const total = Math.max(1, count);
  return Math.min(2, Math.floor((questionIndex * 3) / total));
}

// 開場先抽好整場的對手:每題一隻,同階段內不重複,每局都不一樣
export function buildMonsterRoster(count) {
  const slotsByStage = [[], [], []];
  for (let i = 0; i < count; i++) slotsByStage[stageIndexFor(i, count)].push(i);

  const roster = new Array(count);
  slotsByStage.forEach((slots, stage) => {
    const pool = shuffle(EVOLUTION_STAGES[stage]);
    slots.forEach((slot, n) => { roster[slot] = pool[n % pool.length]; });
  });
  return roster;
}
