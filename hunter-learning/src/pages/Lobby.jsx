import { useNavigate } from 'react-router-dom';
import { Text } from '@mantine/core';
import { motion } from 'framer-motion';
import StarField from '../components/StarField';

// Each game has a unique signature colour + glow
const GAMES = [
  { path: '/math-battle',   icon: '⚔️',  title: '算數大戰',   desc: '打敗怪物！',   color: '#ff6b6b', glow: 'rgba(255,107,107,0.32)' },
  { path: '/chain-math',    icon: '🔗',  title: '連鎖算數',   desc: '連續計算！',   color: '#845ef7', glow: 'rgba(132,94,247,0.32)'  },
  { path: '/clock-reading', icon: '🕐',  title: '學看時鐘',   desc: '認識時鐘！',   color: '#ffd43b', glow: 'rgba(255,212,59,0.32)'  },
  { path: '/english-match', icon: '🔤',  title: '英文配對',   desc: '輕鬆記單字！', color: '#51cf66', glow: 'rgba(81,207,102,0.32)'  },
  { path: '/memory-flip',   icon: '🃏',  title: '記憶翻牌',   desc: '考驗記憶力！', color: '#cc5de8', glow: 'rgba(204,93,232,0.32)'  },
  { path: '/math-mole',     icon: '🦔',  title: '打地鼠',     desc: '打對答案！',   color: '#ff922b', glow: 'rgba(255,146,43,0.32)'  },
  { path: '/symmetry',      icon: '🪞',  title: '對稱遊戲',   desc: '學對稱軸！',   color: '#4dabf7', glow: 'rgba(77,171,247,0.32)'  },
  { path: '/odd-even',      icon: '🔢',  title: '奇偶偵探',   desc: '奇數偶數！',   color: '#f783ac', glow: 'rgba(247,131,172,0.32)' },
];

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(',');
}

function GameCard({ game, index, onPlay }) {
  const rgb = hexToRgb(game.color);
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
        boxShadow: `0 4px 24px ${game.glow}, 0 1px 0 rgba(255,255,255,0.04) inset`,
        transition: 'box-shadow 0.25s, border-color 0.25s',
      }}
    >
      {/* Top colour bloom */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '55%',
        background: `radial-gradient(ellipse 80% 100% at 50% 0%, rgba(${rgb},0.18) 0%, transparent 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Icon */}
      <div style={{ fontSize: 44, lineHeight: 1, position: 'relative', zIndex: 1 }}>
        {game.icon}
      </div>

      {/* Title */}
      <div style={{
        fontSize: 15, fontWeight: 900,
        color: game.color,
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
    <div style={{
      minHeight: '100dvh',
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
          {/* Floating rocket */}
          <motion.div
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 62, lineHeight: 1, marginBottom: 14 }}
          >
            🚀
          </motion.div>

          {/* Rainbow title */}
          <div style={{
            fontSize: 30,
            fontWeight: 900,
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            background: 'linear-gradient(100deg, #12b886 0%, #4dabf7 28%, #cc5de8 55%, #f783ac 78%, #ffd43b 100%)',
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
  );
}
