// PokeAPI sprites repo 靜態 CDN(與 API JSON 回傳的網址相同)
const BASE = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon';

// 經典 96x96 sprite,約 600 bytes。大廳卡片與頂條圖示用。
export const pokemonSprite = (id) => `${BASE}/${id}.png`;

// 官方 artwork,115-200KB。設定頁 hero、結果頁、對戰畫面等大尺寸用。
export const pokemonArtwork = (id) => `${BASE}/other/official-artwork/${id}.png`;
