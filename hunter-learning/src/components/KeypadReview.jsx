import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import StarField from './StarField';
import { delay } from '../utils/math';
import { useSound } from '../hooks/useSound';
import { useReviewQueue } from '../hooks/useReview';

const NUM_LAYOUT = [
  ['7', '8', '9'],
  ['4', '5', '6'],
  ['1', '2', '3'],
  ['back', '0', 'ok'],
];

// 單一題的鍵盤訂正卡。以 key={index} 重新掛載,免用 effect 重置狀態。
function KeypadQuestion({ item, index, total, onCorrect, onExit }) {
  const sound = useSound();
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState(null); // null | 'correct' | 'wrong'
  const [reveal, setReveal] = useState(false);
  const inputRef = useRef('');
  const locked = useRef(false);
  const wrongCount = useRef(0);

  const setInputBoth = useCallback((v) => {
    inputRef.current = v;
    setInput(v);
  }, []);

  const handleKey = useCallback(async (key) => {
    if (locked.current) return;

    if (key === 'back') {
      setInputBoth(inputRef.current.slice(0, -1));
      sound.click();
      return;
    }
    if (key !== 'ok') {
      if (inputRef.current.length >= 3) return;
      setInputBoth(inputRef.current + key);
      sound.click();
      return;
    }

    // submit
    const v = inputRef.current;
    if (!v || isNaN(parseInt(v, 10))) return;

    locked.current = true;
    if (parseInt(v, 10) === item.answer) {
      setFeedback('correct');
      sound.correct();
      await delay(650);
      onCorrect();
    } else {
      setFeedback('wrong');
      sound.wrong();
      wrongCount.current += 1;
      await delay(900);
      if (wrongCount.current >= 2) setReveal(true);
      setFeedback(null);
      setInputBoth('');
      locked.current = false;
    }
  }, [item, onCorrect, sound, setInputBoth]);

  useEffect(() => {
    function onKey(e) {
      if (e.key >= '0' && e.key <= '9') handleKey(e.key);
      else if (e.key === 'Backspace') handleKey('back');
      else if (e.key === 'Enter') handleKey('ok');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleKey]);

  const displayColor = feedback === 'correct' ? '#12b886' : feedback === 'wrong' ? '#f85149' : (input ? '#e6edf3' : '#12b886');

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#ffa94d' }}>✏️ 訂正錯題</div>
        <div style={{ fontSize: 12, color: 'rgba(139,163,190,0.7)', fontWeight: 700, marginTop: 4 }}>
          第 {index + 1} / {total} 題
        </div>
      </div>

      {/* Question + input */}
      <div style={{
        background: 'rgba(22, 27, 34, 0.9)',
        border: '1px solid rgba(48, 54, 61, 0.8)',
        borderRadius: 20,
        padding: '22px 20px',
        textAlign: 'center',
        backdropFilter: 'blur(8px)',
      }}>
        <motion.div
          animate={feedback === 'wrong' ? { x: [0, -6, 6, -4, 4, 0] } : {}}
          transition={{ duration: 0.35 }}
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
        >
          <span style={{ fontSize: 30, fontWeight: 900, color: '#e6edf3' }}>{item.text} =</span>
          <span style={{ fontSize: 30, fontWeight: 900, color: displayColor, minWidth: 40, textAlign: 'left' }}>
            {input || '?'}
          </span>
        </motion.div>
        {reveal && feedback !== 'correct' && (
          <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: '#ffa94d' }}>
            正確答案：{item.answer}
          </div>
        )}
      </div>

      {/* Numpad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {NUM_LAYOUT.flat().map(key => {
          const isOk = key === 'ok';
          const isBack = key === 'back';
          return (
            <motion.button
              key={key}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleKey(key)}
              style={{
                height: 52,
                borderRadius: 13,
                border: isOk
                  ? '1.5px solid rgba(18,184,134,0.7)'
                  : isBack
                  ? '1.5px solid rgba(255,100,100,0.4)'
                  : '1.5px solid rgba(50,75,110,0.7)',
                background: isOk
                  ? 'linear-gradient(145deg, rgba(18,184,134,0.28), rgba(13,207,170,0.15))'
                  : isBack
                  ? 'rgba(50,18,18,0.85)'
                  : 'rgba(14,22,40,0.92)',
                color: isOk ? '#12b886' : isBack ? '#f87171' : '#d6e4f7',
                fontSize: isOk ? 15 : isBack ? 20 : 22,
                fontWeight: isOk ? 900 : 700,
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {isBack ? '⌫' : isOk ? '確定' : key}
            </motion.button>
          );
        })}
      </div>

      <button
        onClick={onExit}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(139,163,190,0.6)', fontSize: 13, fontWeight: 700,
          padding: '4px 0', fontFamily: 'inherit',
        }}
      >
        略過訂正，返回結算
      </button>
    </div>
  );
}

// 共用的「數字鍵盤」訂正引擎。
// props:
//   items  — 錯題陣列,每項 { text, answer }
//   onExit — 全部訂正完(或按返回)時呼叫
export default function KeypadReview({ items, onExit }) {
  const sound = useSound();
  const { current, index, total, finished, advance } = useReviewQueue(items);

  useEffect(() => {
    if (finished) sound.victory();
  }, [finished, sound]);

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
        maxWidth: 380,
        margin: '0 auto',
        width: '100%',
      }}>
        {finished ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            style={{ textAlign: 'center', width: '100%' }}
          >
            <div style={{ fontSize: 64, lineHeight: 1 }}>🎉</div>
            <div style={{
              fontSize: 24, fontWeight: 900, marginTop: 14,
              background: 'linear-gradient(135deg,#ffd700,#ffaa00)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              全部訂正完成！
            </div>
            <button
              onClick={onExit}
              style={{
                marginTop: 24, width: '100%', padding: '15px 0',
                borderRadius: 16, border: 'none',
                background: 'linear-gradient(135deg, #12b886, #0ca678)',
                color: '#fff', fontSize: 17, fontWeight: 900,
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 20px rgba(18,184,134,0.4)',
              }}
            >
              ← 返回結算
            </button>
          </motion.div>
        ) : (
          <KeypadQuestion
            key={index}
            item={current}
            index={index}
            total={total}
            onCorrect={advance}
            onExit={onExit}
          />
        )}
      </div>
    </div>
  );
}
