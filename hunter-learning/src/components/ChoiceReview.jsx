import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import StarField from './StarField';
import { delay } from '../utils/math';
import { useSound } from '../hooks/useSound';
import { useReviewQueue } from '../hooks/useReview';

// 單一題的訂正卡。以 key={index} 重新掛載,免用 effect 重置狀態。
function ChoiceQuestion({ item, index, total, renderPrompt, getChoices, onCorrect, onExit }) {
  const sound = useSound();
  const [wrongPicks, setWrongPicks] = useState(() => new Set());
  const [cleared, setCleared] = useState(false);
  const locked = useRef(false);

  const choices = getChoices(item);
  const revealed = wrongPicks.size > 0;

  const handlePick = useCallback(async (choice) => {
    if (locked.current || cleared) return;
    if (choice.correct) {
      locked.current = true;
      setCleared(true);
      sound.correct();
      await delay(650);
      onCorrect();
    } else {
      sound.wrong();
      setWrongPicks(prev => new Set(prev).add(choice.key));
    }
  }, [cleared, onCorrect, sound]);

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: '#ffa94d' }}>✏️ 訂正錯題</div>
        <div style={{ fontSize: 12, color: 'rgba(139,163,190,0.7)', fontWeight: 700, marginTop: 4 }}>
          第 {index + 1} / {total} 題
        </div>
      </div>

      {/* Prompt card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25 }}
        style={{
          background: 'rgba(22, 27, 34, 0.9)',
          border: '1px solid rgba(48, 54, 61, 0.8)',
          borderRadius: 20,
          padding: '24px 20px',
          textAlign: 'center',
          backdropFilter: 'blur(8px)',
        }}
      >
        {renderPrompt(item)}
      </motion.div>

      {/* Choices */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {choices.map(choice => {
          const showCorrect = choice.correct && (cleared || revealed);
          const showWrong   = wrongPicks.has(choice.key);

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
              key={choice.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePick(choice)}
              style={{
                padding: '18px 12px',
                borderRadius: 14,
                border,
                background: bg,
                color,
                fontSize: 20,
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'all 0.15s',
              }}
            >
              {choice.label}
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

// 共用的「選擇題」訂正引擎。
// props:
//   items        — 錯題陣列
//   renderPrompt(item) — 回傳題目卡的 JSX(保留各遊戲原視覺)
//   getChoices(item)   — 回傳 [{ key, label, correct }]
//   onExit       — 全部訂正完(或按返回)時呼叫
export default function ChoiceReview({ items, renderPrompt, getChoices, onExit }) {
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
        maxWidth: 440,
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
          <ChoiceQuestion
            key={index}
            item={current}
            index={index}
            total={total}
            renderPrompt={renderPrompt}
            getChoices={getChoices}
            onCorrect={advance}
            onExit={onExit}
          />
        )}
      </div>
    </div>
  );
}
