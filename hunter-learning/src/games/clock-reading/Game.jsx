import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stack, Text, Button, Group } from '@mantine/core';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import ClockSVG from './ClockSVG';
import { useGame } from './useGame';

export default function ClockGame() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { mode = 'read', difficulty = 'hour', count = 10 } = location.state || {};

  const {
    question, choices, phase, currentQ, stats,
    feedback, revealDigital,
    setHour, setMinute, displayHour, displayMinute,
    confirmActive, instruction,
    stars, title, elapsedSec,
    handleChoice, handleClockClick, handleConfirm, fmt,
  } = useGame({ mode, difficulty, count });

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
        onRetry={() => navigate('/clock-reading/play', { state: { mode, difficulty, count } })}
        onMenu={() => navigate('/clock-reading')}
        onLobby={() => navigate('/')}
      />
    );
  }

  // Which hour/minute to display on clock
  const clockHour   = mode === 'set' ? (setHour   ?? question.hour)   : question.hour;
  const clockMinute = mode === 'set' ? (setMinute  ?? 0)              : question.minute;

  const digitalH = revealDigital ? question.hour   : (mode === 'set' ? (displayHour   ?? '?') : '?');
  const digitalM = revealDigital ? String(question.minute).padStart(2, '0')
                                 : (mode === 'set' ? (displayMinute !== null ? String(displayMinute).padStart(2, '0') : '??') : '??');

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarField />
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        paddingTop: 'max(20px, env(safe-area-inset-top))',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        position: 'relative',
        zIndex: 1,
        maxWidth: 420,
        margin: '0 auto',
        width: '100%',
      }}>
        <Stack gap={16} align="center" style={{ width: '100%' }}>
          <Text size="xs" c="dimmed">第 {currentQ + 1} / {count} 題</Text>

          {/* Clock */}
          <motion.div
            key={`${question.hour}-${question.minute}`}
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.35 }}
          >
            <ClockSVG
              hour={clockHour}
              minute={clockMinute}
              size={220}
              onClick={mode === 'set' ? handleClockClick : undefined}
              inputMode={difficulty}
            />
          </motion.div>

          {/* Digital display */}
          <div style={{
            background: 'rgba(22, 27, 34, 0.9)',
            border: `1px solid ${revealDigital ? '#12b886' : 'rgba(48, 54, 61, 0.8)'}`,
            borderRadius: 12,
            padding: '8px 24px',
            minWidth: 120,
            textAlign: 'center',
            transition: 'border-color 0.3s',
          }}>
            <Text fw={800} style={{ fontSize: 28, color: revealDigital ? '#12b886' : '#8b949e', fontVariantNumeric: 'tabular-nums' }}>
              {digitalH}:{digitalM}
            </Text>
          </div>

          {/* Mode 1: choices */}
          {mode === 'read' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%' }}>
              {choices.map((c, i) => {
                const isSelected  = feedback?.choiceIdx === i;
                const isCorrectEl = c.hour === question.hour && c.minute === question.minute;
                const showCorrect = feedback !== null && isCorrectEl;
                const showWrong   = feedback !== null && feedback.choiceIdx === i && !feedback.correct;

                let bg     = 'rgba(22, 27, 34, 0.9)';
                let border = '1.5px solid rgba(48, 54, 61, 0.8)';
                let color  = '#e6edf3';

                if (showCorrect) { bg = 'rgba(18, 184, 134, 0.15)'; border = '1.5px solid #12b886'; color = '#12b886'; }
                else if (showWrong) { bg = 'rgba(248, 81, 73, 0.15)'; border = '1.5px solid #f85149'; color = '#f85149'; }

                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleChoice(i)}
                    style={{
                      padding: '18px 12px',
                      borderRadius: 14,
                      border, background: bg, color,
                      fontSize: 20, fontWeight: 800,
                      cursor: 'pointer', fontFamily: 'inherit',
                      transition: 'all 0.15s',
                    }}
                  >
                    {fmt(c.hour, c.minute)}
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Mode 2: instruction + confirm */}
          {mode === 'set' && (
            <Stack gap={10} align="center" style={{ width: '100%' }}>
              <Text
                size="sm"
                ta="center"
                style={{ color: confirmActive ? '#12b886' : '#8b949e' }}
              >
                {instruction}
              </Text>
              <Button
                fullWidth
                disabled={!confirmActive}
                onClick={handleConfirm}
                style={{
                  background: confirmActive ? 'linear-gradient(135deg, #12b886, #0ca678)' : undefined,
                  border: 'none',
                  fontWeight: 700,
                }}
              >
                確認
              </Button>
            </Stack>
          )}
        </Stack>
      </div>
    </div>
  );
}
