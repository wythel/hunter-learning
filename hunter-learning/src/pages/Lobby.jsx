import { useNavigate } from 'react-router-dom';
import { Text } from '@mantine/core';
import { motion } from 'framer-motion';
import StarField from '../components/StarField';
import DexFrame from '../components/DexFrame';
import { rosterByPath } from '../utils/pokemonRoster';
import { pokemonSprite, pokemonArtwork } from '../utils/pokemon';

// Each game has a unique signature colour (now sourced from the Pokemon roster)
const GAMES = [
  { path: '/math-battle',   title: '算數大戰',   desc: '打敗怪物！' },
  { path: '/chain-math',    title: '連鎖算數',   desc: '連續計算！' },
  { path: '/clock-reading', title: '學看時鐘',   desc: '認識時鐘！' },
  { path: '/english-match', title: '英文配對',   desc: '輕鬆記單字！' },
  { path: '/memory-flip',   title: '記憶翻牌',   desc: '考驗記憶力！' },
  { path: '/math-mole',     title: '打地鼠',     desc: '打對答案！' },
  { path: '/symmetry',      title: '對稱遊戲',   desc: '學對稱軸！' },
  { path: '/odd-even',      title: '奇偶偵探',   desc: '奇數偶數！' },
  { path: '/make-ten',      title: '湊十大師',   desc: '湊成10！' },
  { path: '/column-math',   title: '直式計算',   desc: '進位退位好簡單！' },
  { path: '/note-staff',    title: '音符星球',   desc: '認識五線譜！' },
  { path: '/word-hunt',     title: '看圖認字',   desc: '中英雙語認字！' },
  { path: '/moon-phases',   title: '月相星球',   desc: '認識月亮！' },
  { path: '/polar-day',     title: '永晝永夜',   desc: '太陽不下山？' },
  { path: '/solar-system',  title: '太陽系',     desc: '認識八大行星！' },
];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
}

function GameCard({ game, index, onPlay }) {
  const { id, color } = rosterByPath[game.path];
  const rgb = hexToRgb(color);
  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.75, y: 24 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      transition={{ delay: 0.1 + index * 0.055, type: 'spring', stiffness: 280, damping: 22 }}
      whileHover={{ scale: 1.06, y: -4 }}
      whileTap={{ scale: 0.94 }}
      onClick={onPlay}
      style={{
        width: '100%',
        padding: '20px 10px 16px',
        borderRadius: 22,
        border: `1.5px solid rgba(${rgb},0.28)`,
        background: `rgba(10,22,38,0.88)`,
        backdropFilter: 'blur(14px)',
        cursor: 'pointer',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 7,
        fontFamily: 'inherit',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: `0 4px 24px rgba(${rgb},0.32), 0 1px 0 rgba(255,255,255,0.04) inset`,
        transition: 'box-shadow 0.25s, border-color 0.25s',
      }}
    >
      {/* Top colour bloom */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
        background: `radial-gradient(ellipse 80% 100% at 50% 0%, rgba(${rgb},0.18) 0%, transparent 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Pokemon sprite */}
      <img
        data-pokemon
        src={pokemonSprite(id)}
        alt=""
        width={44}
        height={44}
        loading="lazy"
        onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
        style={{ imageRendering: 'pixelated', position: 'relative', zIndex: 1 }}
      />

      {/* Title */}
      <div style={{
        fontSize: 15, fontWeight: 900,
        color: color,
        letterSpacing: '-0.01em',
        lineHeight: 1.2, position: 'relative', zIndex: 1,
      }}>
        {game.title}
      </div>

      {/* Desc */}
      <div style={{
        fontSize: 11.5,
        color: 'rgba(180,195,215,0.65)',
        lineHeight: 1.3, position: 'relative', zIndex: 1,
      }}>
        {game.desc}
      </div>
    </motion.button>
  );
}

export default function Lobby() {
  const navigate = useNavigate();

  return (
    <DexFrame dexNo="No.015">
      <div style={{
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 16px',
        paddingTop: 'max(28px, env(safe-area-inset-top))',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom))',
        position: 'relative',
      }}>
        <StarField />

        <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>

          {/* ── Header ── */}
          <motion.div
            initial={{ opacity: 0, y: -22 }}
            animate={{ opacity: 1,  y:   0 }}
            transition={{ duration: 0.55, ease: [0.34, 1.56, 0.64, 1] }}
            style={{ textAlign: 'center', paddingBottom: 28, paddingTop: 8 }}
          >
            {/* Floating Pikachu */}
            <motion.div
              animate={{ y: [0, -9, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ marginBottom: 14 }}
            >
              {/* 沒有 loading="lazy":這張圖在 above the fold,是小朋友打開頁面第一眼看到的東西,
                  lazy 只會延後它出現——跟下面 15 張卡片 sprite(捲動後才進視窗)情況不同 */}
              <img
                src={pokemonArtwork(25)}
                alt=""
                width={72}
                height={72}
                onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }}
                style={{ display: 'inline-block' }}
              />
            </motion.div>

            {/* Pokedex-gold title */}
            <div style={{
              fontSize: 30,
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              background: 'linear-gradient(100deg, var(--dex-gold), #FF6B6B 55%, #4DABF7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Hunter 學習遊戲
            </div>

            <Text size="sm" mt={6} style={{ color: 'rgba(139,163,190,0.75)', fontWeight: 600 }}>
              選一個遊戲，展開冒險！
            </Text>
          </motion.div>

          {/* ── 2-column game grid ── */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}>
            {GAMES.map((g, i) => (
              <GameCard key={g.path} game={g} index={i} onPlay={() => navigate(g.path)} />
            ))}
          </div>

        </div>
      </div>
    </DexFrame>
  );
}
