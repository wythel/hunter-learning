import { useLocation, useNavigate } from 'react-router-dom';
import { Text, Group } from '@mantine/core';
import { motion } from 'framer-motion';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import Hole from './Hole';
import { useGame } from './useGame';

export default function MoleGame() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { difficulty = 'easy', timeLimit = 60 } = location.state || {};

  const {
    question, holes, flash, score, timeLeft,
    phase, stars, title, elapsedSec, correct, wrong,
    handleHit,
  } = useGame({ difficulty, timeLimit });

  if (phase === 'result') {
    return (
      <ResultScreen
        title={title}
        stars={stars}
        stats={[
          { icon: '🎯', label: '打中', value: `${correct} 題` },
          { icon: '💫', label: '分數', value: `${score} 分` },
          { icon: '⏱️', label: '時間', value: `${timeLimit} 秒` },
        ]}
        onRetry={() => navigate('/math-mole/play', { state: { difficulty, timeLimit } })}
        onMenu={() => navigate('/math-mole')}
        onLobby={() => navigate('/')}
      />
    );
  }

  const urgent = timeLeft <= 10;

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarField />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px 20px',
        paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        position: 'relative',
        zIndex: 1,
        maxWidth: 440,
        margin: '0 auto',
        width: '100%',
      }}>
        {/* Header */}
        <Group justify="space-between" style={{ width: '100%', marginBottom: 16 }}>
          <Text
            fw={800}
            style={{
              fontSize: 28,
              color: urgent ? '#f85149' : '#12b886',
              transition: 'color 0.3s',
            }}
          >
            {timeLeft}
          </Text>
          <Text fw={700} style={{ fontSize: 22, color: '#e6edf3' }}>
            {score} 分
          </Text>
        </Group>

        {/* Question */}
        <motion.div
          key={question.text}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            background: 'rgba(22, 27, 34, 0.9)',
            border: '1px solid rgba(48, 54, 61, 0.8)',
            borderRadius: 16,
            padding: '14px 28px',
            marginBottom: 20,
            backdropFilter: 'blur(8px)',
          }}
        >
          <Text
            fw={800}
            style={{ fontSize: 26, color: '#e6edf3', textAlign: 'center' }}
          >
            {question.text}
          </Text>
        </motion.div>

        {/* Mole grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
          width: '100%',
          background: 'linear-gradient(180deg, #4a8030 0%, #3a6825 100%)',
          borderRadius: 20,
          padding: '16px 12px',
          border: '2px solid #2d5218',
        }}>
          {holes.map((hole, i) => (
            <Hole
              key={i}
              num={hole.num}
              up={hole.up}
              flash={flash[i]}
              onHit={() => handleHit(i)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
