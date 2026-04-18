import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import Teaching from './Teaching';
import { useGame } from './useGame';

// ── Ten-frame (2 rows × 5 cols) ───────────────────────────────────────────────

function TenFrame({ given, size = 36 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 7 }}>
      {Array.from({ length: 10 }, (_, i) => {
        const filled = i < given;
        return (
          <motion.div
            key={i}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.035, type: 'spring', stiffness: 400, damping: 18 }}
            style={{
              width: size, height: size,
              borderRadius: '50%',
              background: filled
                ? 'radial-gradient(circle at 35% 35%, #44ffdd, #12b886)'
                : 'rgba(8,18,34,0.7)',
              border: filled
                ? '2px solid rgba(0,230,180,0.45)'
                : '2px dashed rgba(77,171,247,0.25)',
              boxShadow: filled
                ? '0 0 12px rgba(18,184,134,0.5), inset 0 1px 0 rgba(255,255,255,0.25)'
                : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

// ── Choose mode view ──────────────────────────────────────────────────────────

function ChooseView({ question, currentQ, count, feedback, onAnswer }) {
  const { given, correct, choices } = question;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, position: 'relative' }}>
      {/* Feedback overlay */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            key={feedback}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute', inset: -20, borderRadius: 24, zIndex: 10,
              background: feedback === 'correct'
                ? 'rgba(18,184,134,0.15)'
                : 'rgba(248,81,73,0.12)',
              border: `2px solid ${feedback === 'correct' ? 'rgba(18,184,134,0.5)' : 'rgba(248,81,73,0.4)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <motion.div
              initial={{ scale: 0.4 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
              style={{ fontSize: 56, lineHeight: 1 }}
            >
              {feedback === 'correct' ? '✅' : '❌'}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(139,163,190,0.5)', letterSpacing: '0.07em', marginBottom: 10 }}>
          第 {currentQ + 1} / {count} 題
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 48, fontWeight: 900, color: '#e6edf3', lineHeight: 1 }}>{given}</span>
          <span style={{ fontSize: 36, fontWeight: 700, color: 'rgba(139,163,190,0.5)' }}>+</span>
          <motion.span
            animate={{ scale: [1, 1.12, 1], textShadow: ['0 0 10px rgba(255,159,67,0.5)', '0 0 22px rgba(255,159,67,0.9)', '0 0 10px rgba(255,159,67,0.5)'] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{ fontSize: 48, fontWeight: 900, color: '#ff9f43', lineHeight: 1 }}
          >
            ?
          </motion.span>
          <span style={{ fontSize: 36, fontWeight: 700, color: 'rgba(139,163,190,0.5)' }}>=</span>
          <span style={{ fontSize: 48, fontWeight: 900, color: '#e6edf3', lineHeight: 1 }}>10</span>
        </div>
      </div>

      {/* Ten-frame */}
      <AnimatePresence mode="wait">
        <motion.div
          key={given}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          style={{
            background: 'rgba(8,18,34,0.6)',
            border: '1px solid rgba(26,44,61,0.7)',
            borderRadius: 18,
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <TenFrame given={given} size={36} />
          <div style={{ fontSize: 12, color: 'rgba(139,163,190,0.45)', fontWeight: 700 }}>
            還差幾個才能湊到10？
          </div>
        </motion.div>
      </AnimatePresence>

      {/* 4 choice buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {choices.map(choice => {
          const isCorrect = choice === correct;
          const showCorrect = feedback === 'wrong' && isCorrect;
          const showWrong   = feedback === 'wrong' && !isCorrect;
          return (
            <motion.button
              key={choice}
              whileTap={{ scale: 0.93 }}
              onClick={() => onAnswer(choice)}
              animate={showCorrect ? { scale: [1, 1.06, 1] } : showWrong ? { x: [0, -5, 5, -4, 4, 0] } : {}}
              transition={{ duration: 0.35 }}
              style={{
                padding: '18px 0',
                borderRadius: 18,
                border: showCorrect
                  ? '2px solid rgba(18,184,134,0.9)'
                  : showWrong
                  ? '2px solid rgba(248,81,73,0.5)'
                  : '1.5px solid rgba(50,75,110,0.6)',
                background: showCorrect
                  ? 'rgba(18,184,134,0.22)'
                  : showWrong
                  ? 'rgba(248,81,73,0.1)'
                  : 'rgba(14,22,40,0.88)',
                color: showCorrect ? '#12b886' : showWrong ? '#f85149' : '#e6edf3',
                fontSize: 32, fontWeight: 900,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: showCorrect ? '0 0 16px rgba(18,184,134,0.3)' : 'none',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}
            >
              {choice}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// ── Match mode view ───────────────────────────────────────────────────────────

function MatchView({ tiles, selId, wrongPair, matchCount, count, onTap }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: '#e6edf3', marginBottom: 6 }}>
          找出加起來是 <span style={{ color: '#12b886' }}>10</span> 的兩個數字！
        </div>
        {/* Progress dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
          {Array.from({ length: count }, (_, i) => (
            <motion.div
              key={i}
              animate={{ scale: i === matchCount - 1 ? [1, 1.4, 1] : 1 }}
              transition={{ duration: 0.3 }}
              style={{
                width: 10, height: 10, borderRadius: '50%',
                background: i < matchCount ? '#12b886' : 'rgba(139,163,190,0.18)',
                boxShadow: i < matchCount ? '0 0 5px rgba(18,184,134,0.6)' : 'none',
                transition: 'background 0.2s',
              }}
            />
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(139,163,190,0.5)', marginTop: 6, fontWeight: 700 }}>
          {matchCount} / {count} 對
        </div>
      </div>

      {/* Tile grid (4×2) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {tiles.map(tile => {
          const isSel   = selId === tile.id;
          const isWrong = wrongPair?.includes(tile.id);

          return (
            <motion.button
              key={tile.id}
              whileTap={tile.matched ? {} : { scale: 0.9 }}
              onClick={() => onTap(tile.id)}
              animate={
                tile.matched
                  ? { scale: [1, 1.15, 0.85, 1], opacity: [1, 1, 0.5, 0.35] }
                  : isWrong
                  ? { x: [0, -7, 7, -5, 5, 0] }
                  : isSel
                  ? { scale: 1.07 }
                  : { scale: 1, opacity: 1 }
              }
              transition={tile.matched ? { duration: 0.45 } : { duration: 0.35 }}
              style={{
                padding: '0 0',
                height: 72,
                borderRadius: 18,
                border: tile.matched
                  ? '1.5px solid rgba(18,184,134,0.3)'
                  : isSel
                  ? '2px solid rgba(18,184,134,0.9)'
                  : isWrong
                  ? '2px solid rgba(248,81,73,0.6)'
                  : '1.5px solid rgba(50,75,110,0.65)',
                background: tile.matched
                  ? 'rgba(18,184,134,0.08)'
                  : isSel
                  ? 'linear-gradient(145deg, rgba(18,184,134,0.28), rgba(13,207,170,0.14))'
                  : isWrong
                  ? 'rgba(248,81,73,0.12)'
                  : 'rgba(14,22,40,0.9)',
                color: tile.matched
                  ? 'rgba(18,184,134,0.5)'
                  : isSel
                  ? '#12b886'
                  : isWrong
                  ? '#f85149'
                  : '#e6edf3',
                fontSize: tile.matched ? 22 : 30,
                fontWeight: 900,
                cursor: tile.matched ? 'default' : 'pointer',
                fontFamily: 'inherit',
                boxShadow: isSel ? '0 0 18px rgba(18,184,134,0.35)' : 'none',
                transition: 'background 0.15s, border-color 0.15s, color 0.15s',
              }}
            >
              {tile.matched ? '✓' : tile.value}
            </motion.button>
          );
        })}
      </div>

      {/* Hint */}
      <div style={{
        textAlign: 'center', fontSize: 12,
        color: 'rgba(139,163,190,0.4)', fontWeight: 700,
      }}>
        {selId !== null
          ? `已選 ${tiles.find(t => t.id === selId)?.value}，再選一個夥伴`
          : '點一個數字開始配對'}
      </div>
    </div>
  );
}

// ── Main Game component ───────────────────────────────────────────────────────

export default function MakeTenGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { mode = 'choose', count = 8, skipTeach } = location.state || {};

  const [teaching, setTeaching] = useState(!skipTeach);

  const {
    question, currentQ, feedback, handleAnswer,
    tiles, selId, wrongPair, matchCount, handleTap,
    phase, stats, stars, title, elapsedSec,
  } = useGame({ mode, count });

  if (teaching) {
    return <Teaching mode={mode} onDone={() => setTeaching(false)} />;
  }

  if (phase === 'result') {
    const resultStats = mode === 'choose'
      ? [
          { icon: '✅', label: '答對', value: `${stats.correct} 題` },
          { icon: '❌', label: '答錯', value: `${stats.wrong} 題` },
          { icon: '⏱️', label: '時間', value: `${elapsedSec} 秒` },
        ]
      : [
          { icon: '🔗', label: '配對', value: `${stats.correct} 對` },
          { icon: '❌', label: '猜錯', value: `${stats.wrong} 次` },
          { icon: '⏱️', label: '時間', value: `${elapsedSec} 秒` },
        ];

    return (
      <ResultScreen
        title={title}
        stars={stars}
        stats={resultStats}
        onRetry={() => navigate('/make-ten/play', { state: { mode, count, skipTeach: true } })}
        onMenu={() => navigate('/make-ten')}
        onLobby={() => navigate('/')}
      />
    );
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '20px 20px',
      paddingTop: 'max(20px, env(safe-area-inset-top))',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      position: 'relative',
    }}>
      <StarField />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: 'spring', stiffness: 260, damping: 22 }}
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/make-ten')}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'rgba(139,163,190,0.6)', fontSize: 13, fontWeight: 700,
            padding: '0 0 14px', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 5,
          }}
        >
          ← 設定
        </button>

        {/* Game card */}
        <div style={{
          background: 'rgba(10,22,38,0.93)',
          border: '1px solid rgba(26,44,61,0.95)',
          borderRadius: 26,
          padding: '22px 20px 20px',
          backdropFilter: 'blur(18px)',
          boxShadow: '0 8px 48px rgba(0,0,0,0.45), 0 0 60px rgba(18,184,134,0.06), 0 1px 0 rgba(255,255,255,0.04) inset',
        }}>
          {mode === 'choose' ? (
            <ChooseView
              question={question}
              currentQ={currentQ}
              count={count}
              feedback={feedback}
              onAnswer={handleAnswer}
            />
          ) : (
            <MatchView
              tiles={tiles}
              selId={selId}
              wrongPair={wrongPair}
              matchCount={matchCount}
              count={count}
              onTap={handleTap}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
