import { pokemonArtwork as artwork } from '../../utils/pokemon';

export const PLAYER = { name: '皮卡丘', img: artwork(25) };

// 打倒一隻換下一隻,由弱到強
export const MONSTERS = [
  { name: '綠毛蟲', img: artwork(10) },
  { name: '波波',   img: artwork(16) },
  { name: '可達鴨', img: artwork(54) },
  { name: '喵喵',   img: artwork(52) },
  { name: '胖丁',   img: artwork(39) },
  { name: '六尾',   img: artwork(37) },
  { name: '小拳石', img: artwork(74) },
  { name: '伊布',   img: artwork(133) },
  { name: '耿鬼',   img: artwork(94) },
  { name: '暴鯉龍', img: artwork(130) },
  { name: '卡比獸', img: artwork(143) },
  { name: '快龍',   img: artwork(149) },
  { name: '噴火龍', img: artwork(6) },
  { name: '超夢',   img: artwork(150) },
];
