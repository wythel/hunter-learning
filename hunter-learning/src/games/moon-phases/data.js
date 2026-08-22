// 月相純數學與常數。軌道角 φ：0=新月（月在日地之間），180=滿月，太陽在右。
// 幼兒版不分盈虧：兩側半月都叫「半月」，兩側眉月都叫「眉月」，兩側凸月都叫「凸月」。
export const PHASES = [
  { key: 'new',      name: '新月', angles: [0]       },
  { key: 'crescent', name: '眉月', angles: [45, 315] },
  { key: 'half',     name: '半月', angles: [90, 270] },
  { key: 'gibbous',  name: '凸月', angles: [135, 225] },
  { key: 'full',     name: '滿月', angles: [180]     },
];

export function phaseKeysForDifficulty(difficulty) {
  return difficulty === 'hard'
    ? ['new', 'crescent', 'half', 'gibbous', 'full']
    : ['new', 'half', 'full'];
}

const norm = a => ((a % 360) + 360) % 360;

export function illuminatedFraction(angle) {
  return (1 - Math.cos((angle * Math.PI) / 180)) / 2;
}

export function isWaxing(angle) {
  return norm(angle) < 180;
}

function angularDist(a, b) {
  const d = norm(a - b);
  return Math.min(d, 360 - d);
}

export function classifyPhase(angle, difficulty = 'easy') {
  const keys = phaseKeysForDifficulty(difficulty);
  const enabled = PHASES.filter(p => keys.includes(p.key));
  let best = enabled[0];
  let bestD = Infinity;
  for (const p of enabled) {
    for (const ca of p.angles) {
      const d = angularDist(angle, ca);
      if (d < bestD) { bestD = d; best = p; }
    }
  }
  return best;
}

export function angleMatchesPhase(angle, phaseKey, tol = 25) {
  const p = PHASES.find(x => x.key === phaseKey);
  if (!p) return false;
  return p.angles.some(ca => angularDist(angle, ca) <= tol);
}
