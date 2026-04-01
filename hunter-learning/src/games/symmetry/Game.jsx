import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Stack, Text, Title, Group } from '@mantine/core';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import ShapeDisplay from './ShapeDisplay';
import GridPuzzle from './GridPuzzle';
import { useGame } from './useGame';
import { calculateStars, getResultTitle } from '../../utils/scoring';

// ─── Mode 1: which shape prompt text ─────────────────────────────────────────

function getPromptText(questionType) {
  if (questionType === 'find-symmetric') return '哪個圖形有對稱軸？';
  return '哪個圖形沒有對稱軸？';
}

// ─── Mode 1 shape feedback ────────────────────────────────────────────────────

function getShapeFeedback(idx, selected, feedback, correctIdx) {
  if (selected === null) return null;
  if (idx === correctIdx) return 'correct';
  if (idx === selected && feedback === 'wrong') return 'wrong';
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SymmetryGame() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { mode = 'mode1', difficulty = 'easy', count = 5 } = location.state || {};

  const game = useGame({ mode, difficulty, count });

  const {
    question,
    currentQ,
    phase,
    stats,
    elapsedSec,
    mistakes,
    // mode 1
    selected,
    feedback,
    handleMode1Choice,
    // mode 2
    userGrid,
    cellFeedback,
    puzzleDone,
    handleCellClick,
    checkPuzzle,
  } = game;

  // After each cell click in mode 2, check if puzzle is complete
  useEffect(() => {
    if (mode === 'mode2') {
      checkPuzzle();
    }
  }, [userGrid, mode, checkPuzzle]);

  // ── Result screen ────────────────────────────────────────────────────────
  if (phase === 'result') {
    let stars;
    if (mode === 'mode1') {
      stars = calculateStars(stats.correct, stats.wrong);
    } else {
      // mode 2: stars based on mistakes vs total right-side cells (5 rows × 2 = 10 per puzzle)
      const totalCells = count * 10;
      const correct    = totalCells - mistakes;
      stars = calculateStars(correct, mistakes);
    }

    return (
      <ResultScreen
        title={getResultTitle(stars)}
        stars={stars}
        stats={[
          { icon: '✅', label: mode === 'mode1' ? '答對' : '完成題數',  value: `${stats.correct} 題` },
          { icon: '❌', label: mode === 'mode1' ? '答錯' : '錯誤格子', value: `${mode === 'mode1' ? stats.wrong : mistakes}` },
          { icon: '⏱️', label: '時間', value: `${elapsedSec} 秒` },
        ]}
        onRetry={()  => navigate('/symmetry/play', { state: { mode, difficulty, count } })}
        onMenu={()   => navigate('/symmetry')}
        onLobby={()  => navigate('/')}
      />
    );
  }

  // ── Game screen ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarField />
      <div
        style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          justifyContent: 'center',
          padding:        '24px 20px',
          paddingTop:     'max(24px, env(safe-area-inset-top))',
          paddingBottom:  'max(24px, env(safe-area-inset-bottom))',
          position:       'relative',
          zIndex:         1,
        }}
      >
        <div style={{ width: '100%', maxWidth: 480 }}>
          <Stack gap={20}>
            {/* Header: back button + progress */}
            <Group justify="space-between" align="center">
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#8b949e', fontSize: 22, padding: '4px 8px',
                  fontFamily: 'inherit',
                }}
              >
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

            {/* Question card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.25 }}
              >
                {mode === 'mode1' ? (
                  <Mode1Question
                    question={question}
                    selected={selected}
                    feedback={feedback}
                    onChoice={handleMode1Choice}
                  />
                ) : (
                  <Mode2Question
                    question={question}
                    userGrid={userGrid}
                    cellFeedback={cellFeedback}
                    puzzleDone={puzzleDone}
                    onCellClick={handleCellClick}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </Stack>
        </div>
      </div>
    </div>
  );
}

// ─── Mode 1 sub-component ─────────────────────────────────────────────────────

function Mode1Question({ question, selected, feedback, onChoice }) {
  const prompt = getPromptText(question.questionType);

  return (
    <Stack gap={16}>
      {/* Prompt */}
      <div
        style={{
          background:     'rgba(22, 27, 34, 0.9)',
          border:         '1px solid rgba(48, 54, 61, 0.8)',
          borderRadius:   16,
          padding:        '20px 16px',
          textAlign:      'center',
          backdropFilter: 'blur(8px)',
        }}
      >
        <Text style={{ fontSize: 28 }}>🪞</Text>
        <Title
          order={3}
          mt={8}
          style={{ color: '#e6edf3', fontSize: 20, fontWeight: 800 }}
        >
          {prompt}
        </Title>
      </div>

      {/* 2×2 shape grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {question.shapes.map((shape, i) => {
          const fb = getShapeFeedback(i, selected, feedback, question.correctIdx);
          return (
            <motion.div
              key={shape.id}
              whileTap={{ scale: selected === null ? 0.93 : 1 }}
              style={{ display: 'flex', justifyContent: 'center' }}
            >
              <ShapeDisplay
                shape={shape}
                size={120}
                selected={selected === i}
                feedback={fb}
                onClick={selected === null ? () => onChoice(i) : undefined}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Labels row */}
      {selected !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Group justify="center" gap={8}>
            {question.shapes.map((shape, i) => (
              <Text
                key={shape.id}
                size="xs"
                c={i === question.correctIdx ? 'teal.4' : 'dimmed'}
                fw={i === question.correctIdx ? 700 : 400}
              >
                {shape.label}
              </Text>
            ))}
          </Group>
        </motion.div>
      )}
    </Stack>
  );
}

// ─── Mode 2 sub-component ─────────────────────────────────────────────────────

function Mode2Question({ question, userGrid, cellFeedback, puzzleDone, onCellClick }) {
  return (
    <Stack gap={16} align="center">
      {/* Instruction */}
      <div
        style={{
          background:     'rgba(22, 27, 34, 0.9)',
          border:         '1px solid rgba(48, 54, 61, 0.8)',
          borderRadius:   16,
          padding:        '16px',
          textAlign:      'center',
          backdropFilter: 'blur(8px)',
          width:          '100%',
        }}
      >
        <Text style={{ fontSize: 24 }}>✏️</Text>
        <Title
          order={3}
          mt={4}
          style={{ color: '#e6edf3', fontSize: 18, fontWeight: 800 }}
        >
          完成對稱圖形
        </Title>
        <Text size="xs" c="dimmed" mt={4}>
          點擊右側格子，讓圖形左右對稱！
        </Text>
      </div>

      {/* Legend */}
      <Group gap={16} justify="center">
        <Group gap={6}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(18,184,134,0.75)', border: '1.5px solid rgba(18,184,134,0.9)' }} />
          <Text size="xs" c="dimmed">已填（左側）</Text>
        </Group>
        <Group gap={6}>
          <div style={{ width: 16, height: 16, borderRadius: 4, background: 'rgba(18,184,134,0.55)', border: '1.5px solid rgba(18,184,134,0.8)' }} />
          <Text size="xs" c="dimmed">你填的（右側）</Text>
        </Group>
      </Group>

      {/* Grid */}
      <motion.div
        animate={puzzleDone ? { scale: [1, 1.04, 1] } : {}}
        transition={{ duration: 0.4 }}
      >
        <GridPuzzle
          pattern={question}
          userGrid={userGrid}
          onCellClick={onCellClick}
          cellFeedback={cellFeedback}
        />
      </motion.div>

      {puzzleDone && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        >
          <Text
            fw={800}
            ta="center"
            style={{
              fontSize: 22,
              color: '#12b886',
              textShadow: '0 0 12px rgba(18,184,134,0.5)',
            }}
          >
            🎉 完美對稱！
          </Text>
        </motion.div>
      )}
    </Stack>
  );
}
