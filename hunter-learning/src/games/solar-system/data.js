import { shuffle } from '../../utils/math';

// 八大行星，依離太陽由近到遠排列（index 0..7 即 order 1..8）。
// gradient 用純 CSS 上色；ring=土星光環、stripes=木星條紋，由 Planet.jsx 加裝飾。
export const PLANETS = [
  { key: 'mercury', name: '水星', en: 'Mercury', order: 1, feature: '最小、離太陽最近',
    gradient: 'radial-gradient(circle at 35% 30%, #c9c2b6, #6e675d)', ring: false, stripes: false },
  { key: 'venus',   name: '金星', en: 'Venus',   order: 2, feature: '最熱的行星',
    gradient: 'radial-gradient(circle at 35% 30%, #f6dca0, #c9873f)', ring: false, stripes: false },
  { key: 'earth',   name: '地球', en: 'Earth',   order: 3, feature: '有生命、我們的家',
    gradient: 'radial-gradient(circle at 35% 30%, #7ec8ff, #1f6f4c)', ring: false, stripes: false },
  { key: 'mars',    name: '火星', en: 'Mars',    order: 4, feature: '紅色的星球',
    gradient: 'radial-gradient(circle at 35% 30%, #e0724a, #7a2b1a)', ring: false, stripes: false },
  { key: 'jupiter', name: '木星', en: 'Jupiter', order: 5, feature: '最大的行星',
    gradient: 'radial-gradient(circle at 35% 30%, #e6cfa8, #a9793f)', ring: false, stripes: true },
  { key: 'saturn',  name: '土星', en: 'Saturn',  order: 6, feature: '有美麗的光環',
    gradient: 'radial-gradient(circle at 35% 30%, #f0dcae, #c2a15e)', ring: true, stripes: false },
  { key: 'uranus',  name: '天王星', en: 'Uranus', order: 7, feature: '側躺著轉',
    gradient: 'radial-gradient(circle at 35% 30%, #d4f5f3, #5fb8c9)', ring: false, stripes: false },
  { key: 'neptune', name: '海王星', en: 'Neptune', order: 8, feature: '最遠、最藍',
    gradient: 'radial-gradient(circle at 35% 30%, #8aa6f7, #26408a)', ring: false, stripes: false },
];

export function planetByKey(key) {
  return PLANETS.find(p => p.key === key);
}

// 四選一的選項 keys：一定含 target，共 4 個、不重複。
// hard：取 order 最相鄰的行星當干擾（較難排除）；easy：隨機其他行星。
export function buildDistractorKeys(targetKey, difficulty = 'easy') {
  const target = planetByKey(targetKey);
  const others = PLANETS.filter(p => p.key !== targetKey);
  let pool;
  if (difficulty === 'hard') {
    pool = [...others].sort(
      (a, b) => Math.abs(a.order - target.order) - Math.abs(b.order - target.order),
    );
  } else {
    pool = shuffle(others);
  }
  const distractors = pool.slice(0, 3).map(p => p.key);
  return shuffle([targetKey, ...distractors]);
}

// 排序題判定：8 格、無空缺、每格行星的 order 等於格子位置。
export function orderIsCorrect(arrangement) {
  if (!Array.isArray(arrangement) || arrangement.length !== PLANETS.length) return false;
  return arrangement.every((key, i) => key === PLANETS[i].key);
}
