import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Stack, Text, Title, Group } from '@mantine/core';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import { useGame } from './useGame';
import { calculateStars, getResultTitle } from '../../utils/scoring';
import OddEvenTeaching from './Teaching';

// ── Dot visualiser ────────────────────────────────────────────────────────────

function DotVisual({ num }) {
  const isOdd  = num % 2 === 1;
  const pairs  = Math.floor(num / 2);
  const size   = num <= 10 ? 26 : 18;
  const gap    = num <= 10 ? 8  : 5;

  return (
    <Stack align="center" gap={gap / 2}>
      {Array(pairs).fill(0).map((_, pi) => (
        <Group key={pi} gap={gap}>
          {[0, 1].map(ci => {
            const idx = pi * 2 + ci;
            return (
              <motion.div key={ci}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: idx * 0.04, type: 'spring', stiffness: 400, damping: 15 }}
                style={{ width: size, height: size, borderRadius: '50%', background: '#12b886', boxShadow: '0 0 6px rgba(18,184,134,0.4)' }}
              />
            );
          })}
        </Group>
      ))}
      {isOdd && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: (num - 1) * 0.04, type: 'spring', stiffness: 400, damping: 15 }}
          style={{ width: size, height: size, borderRadius: '50%', background: '#f85149', boxShadow: '0 0 8px rgba(248,81,73,0.5)' }}
        />
      )}
      <Text size="xs" c="dimmed" mt={4} ta="center">
        {isOdd
          ? `${pairs} 對 + 1 個剩下`
          : `${pairs} 對，剛好配完`}
      </Text>
    </Stack>
  );
}

// ── Mode 1: identify ──────────────────────────────────────────────────────────

function IdentifyQuestion({ number, feedback, onAnswer }) {
  const isOdd     = number % 2 === 1;
  const answered  = feedback !== null;
  const correct   = feedback === 'correct';

  return (
    <Stack gap={16} align="center">
      {/* Number card */}
      <AnimatePresence mode="wait">
        <motion.div key={number} initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }} transition={{ type: 'spring', stiffness: 350, damping: 20 }}
          style={{
            background: answered
              ? correct ? 'rgba(18,184,134,0.15)' : 'rgba(248,81,73,0.12)'
              : 'rgba(22,27,34,0.9)',
            border: `2px solid ${answered ? correct ? '#12b886' : '#f85149' : 'rgba(48,54,61,0.8)'}`,
            borderRadius: 20, padding: '20px 40px', textAlign: 'center',
            backdropFilter: 'blur(8px)', minWidth: 140,
          }}
        >
          <Text fw={900} style={{ fontSize: 72, lineHeight: 1, color: '#e6edf3' }}>{number}</Text>
          {answered && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <Text fw={700} mt={4} style={{ fontSize: 18, color: isOdd ? '#f85149' : '#12b886' }}>
                {isOdd ? '奇數' : '偶數'} {correct ? '✓' : '— 答錯了'}
              </Text>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Dot visual */}
      <div style={{ background: 'rgba(22,27,34,0.7)', border: '1px solid rgba(48,54,61,0.6)', borderRadius: 16, padding: '16px 24px' }}>
        <DotVisual num={number} />
      </div>

      {/* Answer buttons */}
      <Group gap={12} style={{ width: '100%' }}>
        {[
          { answer: 'odd',  label: '奇數', color: '#f85149', bg: 'rgba(248,81,73,0.12)', border: 'rgba(248,81,73,0.5)' },
          { answer: 'even', label: '偶數', color: '#12b886', bg: 'rgba(18,184,134,0.12)', border: 'rgba(18,184,134,0.5)' },
        ].map(({ answer, label, color, bg, border }) => (
          <motion.button
            key={answer}
            whileTap={answered ? {} : { scale: 0.95 }}
            onClick={() => !answered && onAnswer(answer)}
            style={{
              flex: 1, padding: '16px 0', borderRadius: 16,
              background: bg, border: `2px solid ${border}`,
              color, fontSize: 22, fontWeight: 800,
              cursor: answered ? 'default' : 'pointer',
              fontFamily: 'inherit',
              opacity: answered ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            {label}
          </motion.button>
        ))}
      </Group>
    </Stack>
  );
}

// ── Mode 2: sort ──────────────────────────────────────────────────────────────

function NumberCard({ num, selected, submitted, isTarget, onClick }) {
  let bg     = 'rgba(22,27,34,0.9)';
  let border = 'rgba(48,54,61,0.8)';
  let label  = null;

  if (submitted) {
    if (isTarget && selected)   { bg = 'rgba(18,184,134,0.2)';  border = '#12b886'; label = '✓'; }
    else if (isTarget)          { bg = 'rgba(255,165,0,0.12)';  border = '#ffa94d'; label = '!'; } // missed
    else if (selected)          { bg = 'rgba(248,81,73,0.18)';  border = '#f85149'; label = '✗'; } // wrong pick
  } else if (selected) {
    bg = 'rgba(18,184,134,0.15)'; border = '#12b886';
  }

  return (
    <motion.button
      whileTap={submitted ? {} : { scale: 0.93 }}
      onClick={onClick}
      style={{
        position: 'relative', width: '100%', aspectRatio: '1.1',
        background: bg, border: `2px solid ${border}`, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: submitted ? 'default' : 'pointer',
        fontFamily: 'inherit', transition: 'background 0.15s, border-color 0.15s',
      }}
    >
      <Text fw={900} style={{ fontSize: 30, color: '#e6edf3' }}>{num}</Text>
      {selected && !submitted && (
        <div style={{ position: 'absolute', top: 4, right: 6, width: 10, height: 10, borderRadius: '50%', background: '#12b886' }} />
      )}
      {submitted && label && (
        <div style={{
          position: 'absolute', top: -6, right: -6,
          width: 20, height: 20, borderRadius: '50%', fontSize: 11, fontWeight: 700,
          background: label === '✓' ? '#12b886' : label === '✗' ? '#f85149' : '#ffa94d',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{label}</div>
      )}
    </motion.button>
  );
}

function SortQuestion({ sortQ, selected, submitted, sortResult, onToggle, onSubmit }) {
  const { numbers, target } = sortQ;
  const targetLabel = target === 'odd' ? '奇數' : '偶數';
  const targetColor = target === 'odd' ? '#f85149' : '#12b886';
  const correctSet  = new Set(numbers.filter(n => target === 'odd' ? n % 2 === 1 : n % 2 === 0));

  return (
    <Stack gap={14}>
      {/* Instruction */}
      <div style={{ background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.8)', borderRadius: 16, padding: '16px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
        <Text style={{ fontSize: 22 }}>🔍</Text>
        <Title order={3} mt={6} style={{ color: '#e6edf3', fontSize: 18, fontWeight: 800 }}>
          選出所有的{' '}
          <span style={{ color: targetColor }}>{targetLabel}</span>！
        </Title>
        {!submitted && (
          <Text size="xs" c="dimmed" mt={4}>點擊數字選取，再按確認</Text>
        )}
      </div>

      {/* 3×2 grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {numbers.map(num => (
          <NumberCard
            key={num} num={num}
            selected={selected.has(num)}
            submitted={submitted}
            isTarget={correctSet.has(num)}
            onClick={() => !submitted && onToggle(num)}
          />
        ))}
      </div>

      {/* Feedback or submit button */}
      {submitted ? (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <Text fw={800} ta="center" style={{ fontSize: 20, color: sortResult === 'correct' ? '#12b886' : '#f85149' }}>
            {sortResult === 'correct' ? '🎉 全對！' : '❌ 有錯，看看橘色的是漏選的'}
          </Text>
        </motion.div>
      ) : (
        <button
          onClick={onSubmit}
          disabled={selected.size === 0}
          style={{
            width: '100%', padding: '14px 0', borderRadius: 14,
            background: selected.size === 0 ? 'rgba(48,54,61,0.5)' : 'linear-gradient(135deg, #12b886, #0dcfaa)',
            border: 'none', color: '#fff', fontSize: 17, fontWeight: 700,
            cursor: selected.size === 0 ? 'default' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: selected.size > 0 ? '0 4px 16px rgba(18,184,134,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          確認 ({selected.size} 個已選)
        </button>
      )}
    </Stack>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function OddEvenGame() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { mode = 'identify', difficulty = 'easy', count = 8, skipTeach = false } = location.state || {};
  const [teaching, setTeaching] = useState(!skipTeach);

  const game = useGame({ mode, difficulty, count });
  const { currentQ, phase, stats, elapsedSec, number, feedback, handleAnswer, sortQ, selected, submitted, sortResult, handleToggle, handleSubmit } = game;

  if (teaching) {
    return <OddEvenTeaching mode={mode} onDone={() => setTeaching(false)} />;
  }

  if (phase === 'result') {
    const stars = calculateStars(stats.correct, stats.wrong);
    return (
      <ResultScreen
        title={getResultTitle(stars)}
        stars={stars}
        stats={[
          { icon: '✅', label: '答對', value: `${stats.correct} 題` },
          { icon: '❌', label: '答錯', value: `${stats.wrong} 題` },
          { icon: '⏱️', label: '時間', value: `${elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/odd-even/play', { state: { mode, difficulty, count, skipTeach: true } })}
        onMenu={()  => navigate('/odd-even')}
        onLobby={() => navigate('/')}
      />
    );
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarField />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px',
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <Stack gap={16}>

            {/* Header */}
            <Group justify="space-between" align="center">
              <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', fontSize: 22, padding: '4px 8px', fontFamily: 'inherit' }}>
                ← 大廳
              </button>
              <Text size="xs" c="dimmed">第 {currentQ + 1} / {count} 題</Text>
            </Group>

            {/* Progress bar */}
            <div style={{ background: 'rgba(48,54,61,0.5)', borderRadius: 6, height: 6, overflow: 'hidden' }}>
              <motion.div
                animate={{ width: `${((currentQ + 1) / count) * 100}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ height: '100%', background: 'linear-gradient(90deg, #12b886, #0dcfaa)', borderRadius: 6 }}
              />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div key={currentQ} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.22 }}>
                {mode === 'identify' ? (
                  <IdentifyQuestion number={number} feedback={feedback} onAnswer={handleAnswer} />
                ) : (
                  <SortQuestion sortQ={sortQ} selected={selected} submitted={submitted} sortResult={sortResult} onToggle={handleToggle} onSubmit={handleSubmit} />
                )}
              </motion.div>
            </AnimatePresence>

          </Stack>
        </div>
      </div>
    </div>
  );
}
