import { useLocation, useNavigate } from 'react-router-dom';
import { Text, Group } from '@mantine/core';
import { motion } from 'framer-motion';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import FlipCard from './Card';
import { useGame } from './useGame';

export default function MemoryGame() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { pairType = 'en-zh', difficulty = 'easy' } = location.state || {};

  const {
    cards, flipped, matched, mismatch, flips, pairs, cols,
    phase, stars, title, elapsedSec,
    handleFlip,
  } = useGame({ pairType, difficulty });

  if (phase === 'result') {
    return (
      <ResultScreen
        title={title}
        stars={stars}
        stats={[
          { icon: '🃏', label: '配對數',  value: `${pairs} 對` },
          { icon: '👆', label: '翻牌次數', value: `${flips} 次` },
          { icon: '⏱️', label: '時間',    value: `${elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/memory-flip/play', { state: { pairType, difficulty } })}
        onMenu={() => navigate('/memory-flip')}
        onLobby={() => navigate('/')}
      />
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarField />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        position: 'relative',
        zIndex: 1,
        maxWidth: 480,
        margin: '0 auto',
        width: '100%',
      }}>
        <Group justify="space-between" style={{ width: '100%', marginBottom: 16 }}>
          <Text size="sm" c="teal.4" fw={700}>{pairs} 對 / {matched.size / 2 | 0} 配對</Text>
          <Text size="sm" c="dimmed">翻牌：{flips} 次</Text>
        </Group>

        <motion.div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 10,
            width: '100%',
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {cards.map((card, i) => (
            <FlipCard
              key={card.id}
              text={card.text}
              flipped={flipped.includes(i)}
              matched={matched.has(i)}
              mismatch={mismatch.includes(i)}
              onClick={() => handleFlip(i)}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
