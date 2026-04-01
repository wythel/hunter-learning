import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stack, Text, Title } from '@mantine/core';
import GameLayout from '../../components/GameLayout';
import ResultScreen from '../../components/ResultScreen';
import StarField from '../../components/StarField';
import { useGame } from './useGame';

function starsFromStats(wrong, total) {
  if (total === 0) return 3;
  const pct = wrong / total;
  if (pct === 0)      return 3;
  if (pct <= 0.2)     return 3;
  if (pct <= 0.4)     return 2;
  if (pct <= 0.6)     return 1;
  return 0;
}

const TITLES = ['再試一次！', '多練習！', '繼續努力！', '全部答對！'];

export default function EnglishGame() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { topic = 'animals', count = 10 } = location.state || {};

  const {
    question, choices, selected, feedback, correctIdx,
    currentQ, stats, phase, elapsedSec,
    handleChoice,
  } = useGame({ topic, count });

  if (phase === 'result') {
    const total = stats.correct + stats.wrong;
    const stars = starsFromStats(stats.wrong, total);
    return (
      <ResultScreen
        title={TITLES[stars]}
        stars={stars}
        stats={[
          { icon: '✅', label: '答對', value: `${stats.correct} 題` },
          { icon: '❌', label: '答錯', value: `${stats.wrong} 題` },
          { icon: '⏱️', label: '時間', value: `${elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/english-match/play', { state: { topic, count } })}
        onMenu={() => navigate('/english-match')}
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
        justifyContent: 'center',
        padding: '24px 20px',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        position: 'relative',
        zIndex: 1,
        maxWidth: 440,
        margin: '0 auto',
        width: '100%',
      }}>
        <Stack gap={20} style={{ width: '100%' }}>
          <Text size="xs" c="dimmed" ta="center">
            第 {currentQ + 1} / {count} 題
          </Text>

          {/* Question card */}
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            style={{
              background: 'rgba(22, 27, 34, 0.9)',
              border: '1px solid rgba(48, 54, 61, 0.8)',
              borderRadius: 20,
              padding: '28px 20px',
              textAlign: 'center',
              backdropFilter: 'blur(8px)',
            }}
          >
            <Text style={{ fontSize: 64, lineHeight: 1 }}>{question.emoji}</Text>
            <Title
              order={3}
              mt={8}
              style={{ color: '#e6edf3', fontSize: 24, fontWeight: 800 }}
            >
              {question.zh}
            </Title>
          </motion.div>

          {/* Choices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {choices.map((c, i) => {
              const isSelected  = selected === i;
              const isCorrectEl = i === correctIdx;
              const showCorrect = feedback !== null && isCorrectEl;
              const showWrong   = feedback === 'wrong' && isSelected;

              let bg     = 'rgba(22, 27, 34, 0.9)';
              let border = '1.5px solid rgba(48, 54, 61, 0.8)';
              let color  = '#e6edf3';

              if (showCorrect) {
                bg = 'rgba(18, 184, 134, 0.15)';
                border = '1.5px solid #12b886';
                color = '#12b886';
              } else if (showWrong) {
                bg = 'rgba(248, 81, 73, 0.15)';
                border = '1.5px solid #f85149';
                color = '#f85149';
              }

              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice(i)}
                  style={{
                    padding: '18px 12px',
                    borderRadius: 14,
                    border,
                    background: bg,
                    color,
                    fontSize: 16,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.en}
                </motion.button>
              );
            })}
          </div>
        </Stack>
      </div>
    </div>
  );
}
