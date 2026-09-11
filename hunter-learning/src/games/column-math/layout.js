// 直式板的尺寸常數。單獨一檔是因為 Game.jsx 是 component 檔,
// 再匯出函式會壞掉 fast refresh(react-refresh/only-export-components)。

export const CELL = 48;

// 這一局最寬可能幾欄:加法進位會讓答案多一位。回傳格線的內容寬度,
// 讓板子固定這個寬度——否則 3 位數加法會一題 3 欄一題 4 欄,旁邊的夥伴跟著左右跳。
export const boardMinWidth = (digits, operation) =>
  30 + (operation === 'sub' ? digits : digits + 1) * CELL;
