import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stack, Text, Title } from '@mantine/core';
import ResultScreen from '../../components/ResultScreen';
import ChoiceReview from '../../components/ChoiceReview';
import StarField from '../../components/StarField';
import TimeBar from '../../components/TimeBar';
import { useCountdown, TIMED_SECONDS } from '../../hooks/useCountdown';
import { useGame } from './useGame';

const ACCENT = '#f59f00';

// 外殼：導航回 /word-hunt/play 時（例如按「再玩一次」）強制整個內層重掛，
// 讓所有 useState / useRef 乾淨重置。
export default function WordHuntGame() {
  const location = useLocation();
  return <WordHuntGameInner key={location.key} />;
}

function WordHuntGameInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode = 'en', count = 10, timed = false, difficulty = 'easy' } = location.state || {};

  const [reviewing, setReviewing] = useState(false);

  const {
    question, choices, selected, feedback, correctIdx,
    currentQ, stats, phase, elapsedSec, stars, title,
    handleChoice, handleTimeout, wrong,
  } = useGame({ mode, count, difficulty });

  const { fraction } = useCountdown({
    seconds: TIMED_SECONDS,
    enabled: timed && phase === 'playing',
    paused: feedback !== null,
    resetKey: currentQ,
    onExpire: handleTimeout,
  });

  if (phase === 'result') {
    if (reviewing) {
      return (
        <ChoiceReview
          items={wrong}
          onExit={() => setReviewing(false)}
          renderPrompt={(item) => (
            <>
              {item.question.img ? (
                <img
                  src={item.question.img}
                  alt=""
                  style={{ width: 96, height: 96, objectFit: 'contain', margin: '0 auto', display: 'block' }}
                />
              ) : (
                <Text style={{ fontSize: 72, lineHeight: 1 }}>{item.question.emoji}</Text>
              )}
              <Title order={3} mt={8} style={{ color: 'rgba(139,163,190,0.65)', fontSize: 14, fontWeight: 700 }}>
                這是什麼？
              </Title>
            </>
          )}
          getChoices={(item) => item.choices.map((c, i) => ({
            key: c.id,
            label: c.label,
            correct: i === item.correctIdx,
          }))}
        />
      );
    }
    return (
      <ResultScreen
        title={title}
        stars={stars}
        stats={[
          { icon: '✅', label: '答對', value: `${stats.correct} 題` },
          { icon: '❌', label: '答錯', value: `${stats.wrong} 題` },
          { icon: '⏱️', label: '時間', value: `${elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/word-hunt/play', { state: { mode, count, timed, difficulty } })}
        onMenu={() => navigate('/word-hunt')}
        onLobby={() => navigate('/')}
        onReview={wrong.length ? () => setReviewing(true) : undefined}
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

          {timed && <TimeBar fraction={fraction} />}

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
            {question.img ? (
              <img
                src={question.img}
                alt=""
                style={{ width: 96, height: 96, objectFit: 'contain', margin: '0 auto', display: 'block' }}
              />
            ) : (
              <Text style={{ fontSize: 72, lineHeight: 1 }}>{question.emoji}</Text>
            )}
            <Title order={3} mt={8} style={{ color: 'rgba(139,163,190,0.65)', fontSize: 14, fontWeight: 700 }}>
              這是什麼？
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
                    fontSize: mode === 'zh' ? 30 : 18,
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                  }}
                >
                  {c.label}
                </motion.button>
              );
            })}
          </div>
        </Stack>
      </div>
    </div>
  );
}
