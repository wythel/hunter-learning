import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import Teaching from './Teaching';
import Staff from './Staff';
import Piano from './Piano';
import { useGame } from './useGame';
import { SOLFEGE, SOLFEGE_COLOR, keyboardForClef } from './notes';

const ACCENT = '#818cf8';
const COUNT  = 10;

// ── Name-button answer pad ───────────────────────────────────────────────────

function NamePad({ correctSolfege, feedback, wrongValue, onAnswer }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 8,
    }}>
      {SOLFEGE.map(s => {
        const isCorrect = s === correctSolfege;
        const isWrong   = feedback === 'wrong' && s === wrongValue;
        const showCorrect = (feedback === 'correct' && isCorrect) || (feedback === 'wrong' && isCorrect);
        const showWrong   = isWrong;
        const color = SOLFEGE_COLOR[s];

        return (
          <motion.button
            key={s}
            whileTap={{ scale: 0.92 }}
            onClick={() => onAnswer(s)}
            disabled={!!feedback}
            animate={
              showCorrect ? { scale: [1, 1.08, 1] }
              : showWrong ? { x: [0, -5, 5, -4, 4, 0] }
              : {}
            }
            transition={{ duration: 0.35 }}
            style={{
              padding: '14px 0',
              borderRadius: 16,
              border: showCorrect
                ? `2px solid ${color}`
                : showWrong
                ? '2px solid rgba(248,81,73,0.7)'
                : `1.5px solid ${color}40`,
              background: showCorrect
                ? `${color}33`
                : showWrong
                ? 'rgba(248,81,73,0.12)'
                : 'rgba(14,22,40,0.85)',
              color: showCorrect
                ? color
                : showWrong
                ? '#f85149'
                : color,
              fontSize: 18, fontWeight: 900,
              cursor: feedback ? 'default' : 'pointer',
              fontFamily: 'inherit',
              boxShadow: showCorrect ? `0 0 18px ${color}66` : 'none',
              transition: 'background 0.15s, border-color 0.15s, color 0.15s',
            }}
          >
            {s}
          </motion.button>
        );
      })}
    </div>
  );
}

// ── Piano answer pad ─────────────────────────────────────────────────────────

function PianoPad({ note, feedback, wrongValue, onAnswer }) {
  const kbd = keyboardForClef(note.clef);
  return (
    <Piano
      whites={kbd.whites}
      blacks={kbd.blacks}
      answerMidi={note.midi}
      wrongMidi={feedback === 'wrong' ? wrongValue : null}
      revealCorrect={feedback === 'correct' || feedback === 'wrong'}
      showLabels="all"
      onTap={feedback ? undefined : onAnswer}
    />
  );
}

// ── Main Game ────────────────────────────────────────────────────────────────

// Outer shell: forces the inner component to fully remount whenever the user
// navigates to /note-staff/play again (e.g. clicking "再玩一次"), so all useState
// and useRef values reset cleanly.
export default function NoteStaffGame() {
  const location = useLocation();
  return <NoteStaffGameInner key={location.key} />;
}

function NoteStaffGameInner() {
  const location = useLocation();
  const navigate = useNavigate();
  const { clefMode = 'treble', answerMode = 'name', skipTeach } = location.state || {};

  const [teaching, setTeaching] = useState(!skipTeach);

  const {
    phase, stats, currentQ, note, feedback, wrongValue,
    handleAnswer, stars, title, elapsedSec,
  } = useGame({ clefMode, answerMode, count: COUNT });

  if (teaching) {
    return <Teaching clefMode={clefMode} answerMode={answerMode} onDone={() => setTeaching(false)} />;
  }

  if (phase === 'result') {
    return (
      <ResultScreen
        title={title}
        stars={stars}
        stats={[
          { icon: '✅', label: '答對', value: `${stats.correct} 題` },
          { icon: '❌', label: '答錯', value: `${stats.wrong} 題` },
          { icon: '⏱️', label: '時間', value: `${elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/note-staff/play', { state: { clefMode, answerMode, skipTeach: true } })}
        onMenu={() => navigate('/note-staff')}
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
        style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate('/note-staff')}
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
          position: 'relative',
          background: 'rgba(10,22,38,0.93)',
          border: '1px solid rgba(129,140,248,0.22)',
          borderRadius: 26,
          padding: '20px 18px',
          backdropFilter: 'blur(18px)',
          boxShadow: `0 8px 48px rgba(0,0,0,0.45), 0 0 60px ${ACCENT}1a, 0 1px 0 rgba(255,255,255,0.04) inset`,
        }}>
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
                  position: 'absolute', inset: 0, borderRadius: 26, zIndex: 10,
                  background: feedback === 'correct'
                    ? 'rgba(18,184,134,0.10)'
                    : 'rgba(248,81,73,0.08)',
                  border: `2px solid ${feedback === 'correct' ? 'rgba(18,184,134,0.45)' : 'rgba(248,81,73,0.35)'}`,
                  pointerEvents: 'none',
                  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
                  paddingTop: 18,
                }}
              >
                <motion.div
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                  style={{ fontSize: 44, lineHeight: 1 }}
                >
                  {feedback === 'correct' ? '✅' : '❌'}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <div style={{
              fontSize: 11, fontWeight: 800, color: 'rgba(139,163,190,0.55)',
              letterSpacing: '0.07em', marginBottom: 6,
            }}>
              第 {currentQ + 1} / {COUNT} 題
            </div>
            {/* Progress bar */}
            <div style={{
              height: 6, borderRadius: 6,
              background: 'rgba(139,163,190,0.15)',
              overflow: 'hidden',
            }}>
              <motion.div
                animate={{ width: `${((currentQ) / COUNT) * 100}%` }}
                transition={{ duration: 0.4 }}
                style={{
                  height: '100%',
                  background: `linear-gradient(90deg, ${ACCENT}, #a78bfa)`,
                  borderRadius: 6,
                }}
              />
            </div>
          </div>

          {/* Staff */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${note.clef}-${note.id}-${currentQ}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'rgba(8,16,28,0.6)',
                border: '1px solid rgba(129,140,248,0.18)',
                borderRadius: 18,
                padding: '12px 10px',
                marginBottom: 14,
              }}
            >
              <Staff clef={note.clef} note={note} accent={ACCENT} />
              <div style={{
                textAlign: 'center', fontSize: 12, fontWeight: 700,
                color: 'rgba(139,163,190,0.55)', marginTop: 4,
              }}>
                {note.clef === 'treble' ? '高音譜 𝄞' : '低音譜 𝄢'}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Answer pad */}
          {answerMode === 'name' ? (
            <NamePad
              correctSolfege={note.solfege}
              feedback={feedback}
              wrongValue={wrongValue}
              onAnswer={handleAnswer}
            />
          ) : (
            <PianoPad
              note={note}
              feedback={feedback}
              wrongValue={wrongValue}
              onAnswer={handleAnswer}
            />
          )}
        </div>
      </motion.div>
    </div>
  );
}
