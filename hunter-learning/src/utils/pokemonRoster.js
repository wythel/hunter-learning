// 每個遊戲配一隻寶可夢。挑選理由見 spec；顏色以官方屬性色為基底，
// 撞色者手動偏移色相，確保大廳 15 張卡在同一格線上可辨識。
export const POKEMON_ROSTER = [
  { path: '/math-battle',   id: 25,  name: '皮卡丘',     color: '#F8D030' },
  { path: '/chain-math',    id: 82,  name: '三合一磁怪', color: '#B8B8D0' },
  { path: '/clock-reading', id: 97,  name: '引夢貘人',   color: '#B06AB3' },
  { path: '/english-match', id: 1,   name: '妙蛙種子',   color: '#78C850' },
  { path: '/memory-flip',   id: 132, name: '百變怪',     color: '#C8A2E0' },
  { path: '/math-mole',     id: 50,  name: '地鼠',       color: '#E0C068' },
  { path: '/symmetry',      id: 12,  name: '巴大蝶',     color: '#7C6FE0' },
  { path: '/odd-even',      id: 137, name: '多邊獸',     color: '#4BC0D9' },
  { path: '/make-ten',      id: 102, name: '蛋蛋',       color: '#F09A37' },
  { path: '/column-math',   id: 95,  name: '大岩蛇',     color: '#96A8BE' },
  { path: '/note-staff',    id: 39,  name: '胖丁',       color: '#EE99AC' },
  { path: '/word-hunt',     id: 52,  name: '喵喵',       color: '#D9A441' },
  { path: '/moon-phases',   id: 35,  name: '皮皮',       color: '#9FB3E8' },
  { path: '/polar-day',     id: 338, name: '太陽岩',     color: '#FF7043' },
  { path: '/solar-system',  id: 120, name: '海星星',     color: '#5AB4E8' },
];

export const rosterByPath = Object.fromEntries(
  POKEMON_ROSTER.map(e => [e.path, e])
);
