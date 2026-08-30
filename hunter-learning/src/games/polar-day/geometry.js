// 永晝／永夜的亮暗數學（純函式，好測試）。
// 給定「住在哪個緯度」與「太陽現在正對哪個緯度（季節）」，
// 算出這一整天有多少比例是白天，以及是不是永晝／永夜。

const rad = deg => (deg * Math.PI) / 180;

// 地軸傾斜角度（對小朋友隱藏，只在數學裡用）。
export const TILT = 23.44;

// 季節滑桿 -1..1 → 太陽直射緯度（赤緯）-TILT..TILT。
// +1 = 北半球夏至（太陽照最北），-1 = 冬至，0 = 春/秋分。
export function declinationForSeason(season) {
  return TILT * season;
}

// 公轉：地球繞太陽轉到哪 → 季節。地軸方向固定不變，
// 所以季節只看地球在軌道上的位置。orbitDeg 0=春分。
//   春分0→0、夏至90→+1（北極最朝太陽）、秋分180→0、冬至270→−1。
export function seasonForOrbit(orbitDeg) {
  return Math.sin(rad(orbitDeg));
}

// 四季定點（春0/夏90/秋180/冬270），回傳離公轉角最近的季節 key。
const SEASON_ANCHORS = [
  { key: 'spring', th: 0 },
  { key: 'summer', th: 90 },
  { key: 'autumn', th: 180 },
  { key: 'winter', th: 270 },
];
export function nearestSeasonKey(orbitDeg) {
  const t = ((orbitDeg % 360) + 360) % 360;
  let best = SEASON_ANCHORS[0], bestD = 999;
  for (const s of SEASON_ANCHORS) {
    const d = Math.min(Math.abs(t - s.th), 360 - Math.abs(t - s.th));
    if (d < bestD) { bestD = d; best = s; }
  }
  return best.key;
}

// latitudeDeg：住的地方（0=赤道，90=北極）。
// declinationDeg：太陽直射的緯度（季節）。
export function dayInfo(latitudeDeg, declinationDeg) {
  const cosH = -Math.tan(rad(latitudeDeg)) * Math.tan(rad(declinationDeg));

  if (cosH <= -1) return { fraction: 1, kind: 'polar-day' };   // 太陽整天不下山
  if (cosH >= 1)  return { fraction: 0, kind: 'polar-night' };  // 太陽整天不出來

  const H0 = Math.acos(cosH);        // 半個白天的時角（弧度）
  return { fraction: H0 / Math.PI, kind: 'normal' };
}
