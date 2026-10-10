import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stack, Text, Title } from '@mantine/core';
import ResultScreen from '../../components/ResultScreen';
import ChoiceReview from '../../components/ChoiceReview';
import StarField from '../../components/StarField';
import TimeBar from '../../components/TimeBar';
import GameLayout from '../../components/GameLayout';
import DexStrip from '../../components/DexStrip';
import { useCountdown, TIMED_SECONDS } from '../../hooks/useCountdown';
import { useGame } from './useGame';

function Picture({ item, size }) {
  return item.img ? (
    <img src={item.img} alt="" style={{ width: size, height: size, objectFit: 'contain', display: 'block' }} />
  ) : (
    <span style={{ fontSize: size, lineHeight: 1 }}>{item.emoji}</span>
  );
}

function WordPrompt({ word, mode }) {
  return (
    <>
      <Text style={{
        fontSize: mode === 'zh' ? 72 : 44,
        fontWeight: 900,
        lineHeight: 1.1,
        color: '#e6edf3',
        letterSpacing: mode === 'zh' ? 0 : 1,
      }}>
        {word}
      </Text>
      <Title order={3} mt={8} style={{ color: 'rgba(139,163,190,0.65)', fontSize: 14, fontWeight: 700 }}>
        哪一張圖是這個字？
      </Title>
    </>
  );
}

// 外殼：導航回 /word-picture/play 時（例如按「再玩一次」）強制整個內層重掛，
// 讓所有 useState / useRef 乾淨重置。
export default function WordPictureGame() {
  const location = useLocation();
  return <WordPictureGameInner key={location.key} />;
}

function WordPictureGameInner() {
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
          renderPrompt={(item) => <WordPrompt word={item.question.label} mode={mode} />}
          getChoices={(item) => item.choices.map((c, i) => ({
            key: c.id,
            label: <Picture item={c} size={40} />,
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
        onRetry={() => navigate('/word-picture/play', { state: { mode, count, timed, difficulty } })}
        onMenu={() => navigate('/word-picture')}
        onLobby={() => navigate('/')}
        onReview={wrong.length ? () => setReviewing(true) : undefined}
      />
    );
  }

  return (
    <GameLayout>
      <DexStrip
        onBack={() => navigate('/word-picture')}
        progress={`第 ${currentQ + 1} / ${count} 題`}
      />
      <StarField />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 20px',
        position: 'relative',
        zIndex: 1,
        maxWidth: 440,
        margin: '0 auto',
        width: '100%',
        overflowY: 'auto',
      }}>
        <Stack gap={20} style={{ width: '100%' }}>
          {timed && <TimeBar fraction={fraction} />}

          {/* Question card：只顯示字，不唸——要考的是「讀」 */}
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
            <WordPrompt word={question.label} mode={mode} />
          </motion.div>

          {/* Picture choices */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {choices.map((c, i) => {
              const isSelected  = selected === i;
              const isCorrectEl = i === correctIdx;
              const showCorrect = feedback !== null && isCorrectEl;
              const showWrong   = feedback === 'wrong' && isSelected;

              let bg     = 'rgba(22, 27, 34, 0.9)';
              let border = '1.5px solid rgba(48, 54, 61, 0.8)';

              if (showCorrect) {
                bg = 'rgba(18, 184, 134, 0.15)';
                border = '1.5px solid #12b886';
              } else if (showWrong) {
                bg = 'rgba(248, 81, 73, 0.15)';
                border = '1.5px solid #f85149';
              }

              return (
                <motion.button
                  key={i}
                  aria-label={`選項 ${i + 1}`}
                  data-choice-id={c.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleChoice(i)}
                  style={{
                    padding: '16px 12px',
                    borderRadius: 14,
                    border,
                    background: bg,
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    transition: 'all 0.15s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 96,
                  }}
                >
                  <Picture item={c} size={56} />
                </motion.button>
              );
            })}
          </div>
        </Stack>
      </div>
    </GameLayout>
  );
}
