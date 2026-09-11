import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import GameLayout from '../../components/GameLayout';
import DexStrip from '../../components/DexStrip';
import ResultScreen from '../../components/ResultScreen';
import KeypadReview from '../../components/KeypadReview';
import StarField from '../../components/StarField';
import Buddy, { CaughtRow } from './Buddy';
import TimeBar from '../../components/TimeBar';
import { useGame, COLUMN_TIMED_SECONDS } from './useGame';
import { useCountdown } from '../../hooks/useCountdown';
import { CELL, boardMinWidth } from './layout';

const digitAt = (n, p) => Math.floor(n / 10 ** p) % 10;
const numLen = n => String(n).length;

// 直式版面:標記列(進/退位)、上數、運算符+下數、橫線、答案格。
// 進位「1」在該位算完後浮現在下一位上方;退位在作答該位時把被借的位劃掉、
// 上方寫減 1 後的數字,並在被借入的位左上角標小「1」——跟課本寫法一致。
function Board({ question, filled, wrongShake, celebrating, minWidth }) {
  const { a, b, op, answer, flags } = question;
  const isAdd = op === '+';
  const cols = Math.max(numLen(a), numLen(answer));
  const ansStr = String(answer);
  const ansLen = ansStr.length;
  const places = [];
  for (let p = cols - 1; p >= 0; p--) places.push(p);

  const digitStyle = { fontSize: 34, fontWeight: 900, textAlign: 'center', lineHeight: '44px' };

  return (
    <div style={{
      background: 'rgba(10,22,38,0.92)',
      border: `1.5px solid ${celebrating ? 'rgba(18,184,134,0.7)' : 'rgba(26,44,61,0.95)'}`,
      borderRadius: 24,
      flexShrink: 0,
      minWidth,
      padding: '18px 26px 22px',
      boxShadow: celebrating
        ? '0 0 34px rgba(18,184,134,0.35)'
        : '0 8px 40px rgba(0,0,0,0.35)',
      transition: 'border-color 0.3s, box-shadow 0.3s',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `30px repeat(${cols}, ${CELL}px)`,
        justifyContent: 'center',
        rowGap: 2,
      }}>
        {/* 標記列:加法進位 1 / 減法被借位後的數字 */}
        <div />
        {places.map(p => {
          let mark = null;
          if (isAdd) {
            if (p >= 1 && flags[p - 1] && filled >= p) mark = '1';
          } else if (p >= 1 && flags[p - 1] && filled >= p - 1) {
            mark = String(digitAt(a, p) - 1);
          }
          return (
            <div key={p} style={{ height: 22, textAlign: 'center' }}>
              {mark != null && (
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ fontSize: 15, fontWeight: 900, color: '#ffa94d' }}
                >
                  {mark}
                </motion.span>
              )}
            </div>
          );
        })}

        {/* 上數 */}
        <div />
        {places.map(p => {
          const has = p < numLen(a);
          const lent = !isAdd && p >= 1 && flags[p - 1] === 1 && filled >= p - 1;
          const borrowing = !isAdd && flags[p] === 1 && filled >= p;
          return (
            <div key={p} style={{
              ...digitStyle,
              position: 'relative',
              color: lent ? 'rgba(230,237,243,0.32)' : '#e6edf3',
              textDecoration: lent ? 'line-through' : 'none',
            }}>
              {borrowing && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{
                    position: 'absolute', top: -3, left: 3,
                    fontSize: 13, fontWeight: 900, color: '#ffa94d',
                    textDecoration: 'none',
                  }}
                >
                  1
                </motion.span>
              )}
              {has ? digitAt(a, p) : ''}
            </div>
          );
        })}

        {/* 運算符 + 下數 */}
        <div style={{ ...digitStyle, fontSize: 30, color: '#4dabf7' }}>{op}</div>
        {places.map(p => (
          <div key={p} style={{ ...digitStyle, color: '#e6edf3' }}>
            {p < numLen(b) ? digitAt(b, p) : ''}
          </div>
        ))}

        {/* 橫線 */}
        <div style={{
          gridColumn: '1 / -1', height: 3.5, margin: '8px 0 10px',
          borderRadius: 2,
          background: 'linear-gradient(90deg, #4dabf7, #12b886)',
        }} />

        {/* 答案格:由個位往高位一格一格填 */}
        <div />
        {places.map(p => {
          if (p >= ansLen) return <div key={p} />;
          const isFilled = filled > p;
          const isActive = filled === p;
          const cell = (
            <div style={{
              width: CELL - 6, height: 52, margin: '0 auto',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 30, fontWeight: 900,
              border: isFilled
                ? '2px solid rgba(18,184,134,0.55)'
                : isActive
                ? '2px solid #12b886'
                : '2px dashed rgba(50,75,110,0.7)',
              background: isFilled ? 'rgba(18,184,134,0.1)' : 'rgba(14,22,40,0.7)',
              color: celebrating ? '#12b886' : '#e6edf3',
              boxShadow: isActive ? '0 0 16px rgba(18,184,134,0.45)' : 'none',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}>
              {isFilled ? ansStr[ansLen - 1 - p] : isActive ? (
                <motion.span
                  animate={{ opacity: [1, 0.15, 1] }}
                  transition={{ duration: 1.1, repeat: Infinity }}
                  style={{ color: '#12b886', fontSize: 24 }}
                >
                  ?
                </motion.span>
              ) : ''}
            </div>
          );
          return (
            <div key={p}>
              {isActive ? (
                <motion.div
                  key={wrongShake}
                  animate={wrongShake ? { x: [0, -7, 7, -5, 5, 0] } : {}}
                  transition={{ duration: 0.35 }}
                >
                  {cell}
                </motion.div>
              ) : cell}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const KEY_ROWS = [['7', '8', '9'], ['4', '5', '6'], ['1', '2', '3'], [null, '0', null]];

function Keypad({ onDigit }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, rgba(6,12,24,0.98) 0%, rgba(4,8,18,1) 100%)',
      borderTop: '1px solid rgba(77,171,247,0.18)',
      padding: '12px 16px',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7,
        maxWidth: 340, margin: '0 auto',
      }}>
        {KEY_ROWS.flat().map((key, i) => key == null ? <div key={`sp-${i}`} /> : (
          <motion.button
            key={key}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDigit(key)}
            style={{
              height: 50,
              borderRadius: 13,
              border: '1.5px solid rgba(50,75,110,0.7)',
              background: 'rgba(14,22,40,0.92)',
              color: '#d6e4f7',
              fontSize: 22, fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            {key}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

export default function ColumnMathGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { operation = 'add', difficulty = 'easy', digits = 2, count = 10, timed = false } = location.state || {};

  const [reviewing, setReviewing] = useState(false);

  const {
    question, filled, phase, currentQ, stats,
    wrongShake, celebrating, timeoutAnswer, timerPaused,
    monster, caught,
    stars, title, elapsedSec, handleDigit, handleTimeout, wrong,
  } = useGame({ operation, difficulty, digits, count });

  const { fraction } = useCountdown({
    seconds: COLUMN_TIMED_SECONDS,
    enabled: timed && phase === 'playing',
    paused: timerPaused,
    resetKey: currentQ,
    onExpire: handleTimeout,
  });

  useEffect(() => {
    function onKey(e) {
      if (e.key >= '0' && e.key <= '9') handleDigit(e.key);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleDigit]);

  if (phase === 'result') {
    if (reviewing) {
      return <KeypadReview items={wrong} onExit={() => setReviewing(false)} />;
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
        onRetry={() => navigate('/column-math/play', { state: { operation, difficulty, digits, count, timed } })}
        onMenu={() => navigate('/column-math')}
        onLobby={() => navigate('/')}
        onReview={wrong.length ? () => setReviewing(true) : undefined}
      />
    );
  }

  return (
    <GameLayout>
      <DexStrip
        onBack={() => navigate('/column-math')}
        progress={`第 ${currentQ + 1} / ${count} 題`}
      />
      <StarField />

      {timeoutAnswer != null && (
        <div style={{
          position: 'absolute', top: '38%', left: '50%',
          transform: 'translate(-50%, -50%)', zIndex: 20,
          background: 'rgba(10,22,38,0.95)',
          border: '2px solid rgba(248,81,73,0.6)',
          borderRadius: 18, padding: '14px 24px', textAlign: 'center',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          <div style={{ fontSize: 30, lineHeight: 1 }}>⏰</div>
          <div style={{ color: '#f85149', fontWeight: 900, fontSize: 15, marginTop: 6 }}>時間到！</div>
          <div style={{ color: '#e6edf3', fontWeight: 900, fontSize: 22, marginTop: 4 }}>
            正確答案：{timeoutAnswer}
          </div>
        </div>
      )}

      {/* 收服進度:一題一格,收服的亮起來 */}
      <div style={{ padding: '8px 16px 0', position: 'relative', zIndex: 1 }}>
        <CaughtRow caught={caught} total={count} />
        <div style={{
          textAlign: 'center', marginTop: 4,
          fontSize: 12, color: 'rgba(139,163,190,0.65)',
          fontWeight: 700, letterSpacing: '0.06em',
        }}>
          從個位開始填 👇
        </div>
      </div>

      {/* 直式題目 */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 8, position: 'relative', zIndex: 1, padding: '8px 6px',
        overflowY: 'auto',
      }}>
        <Buddy
          monster={monster}
          filled={filled}
          wrongShake={wrongShake}
          celebrating={celebrating}
          fainted={timeoutAnswer != null}
        />
        <Board
          minWidth={boardMinWidth(digits, operation)}
          question={question}
          filled={filled}
          wrongShake={wrongShake}
          celebrating={celebrating}
        />
      </div>

      {timed && (
        <div style={{ padding: '0 16px 6px', position: 'relative', zIndex: 1 }}>
          <TimeBar fraction={fraction} />
        </div>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>
        <Keypad onDigit={handleDigit} />
      </div>
    </GameLayout>
  );
}
