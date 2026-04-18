import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import StarField from '../../components/StarField';

// ── Ten-frame (2×5 grid) ──────────────────────────────────────────────────────

function TenFrame({ given, size = 32 }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(5, 1fr)',
      gap: 6,
    }}>
      {Array.from({ length: 10 }, (_, i) => {
        const filled = i < given;
        return (
          <motion.div
            key={i}
            initial={filled ? { scale: 0 } : { scale: 1 }}
            animate={{ scale: 1 }}
            transition={{ delay: filled ? i * 0.04 : 0, type: 'spring', stiffness: 450, damping: 16 }}
            style={{
              width: size,
              height: size,
              borderRadius: '50%',
              background: filled
                ? 'radial-gradient(circle at 35% 35%, #33ffdd, #12b886)'
                : 'rgba(10,22,38,0.6)',
              border: filled
                ? '2px solid rgba(0,255,200,0.5)'
                : '2px dashed rgba(77,171,247,0.28)',
              boxShadow: filled ? '0 0 10px rgba(18,184,134,0.55)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

// ── Pair row (for the "all pairs" slide) ─────────────────────────────────────

function PairRow({ a, index }) {
  const b = 10 - a;
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      <span style={{ color: '#12b886', fontSize: 20, fontWeight: 900, width: 22, textAlign: 'right' }}>{a}</span>
      <span style={{ color: 'rgba(139,163,190,0.5)', fontSize: 16 }}>＋</span>
      <span style={{ color: '#ff9f43', fontSize: 20, fontWeight: 900, width: 22 }}>{b}</span>
      <span style={{ color: 'rgba(139,163,190,0.4)', fontSize: 14 }}>=</span>
      <span style={{ color: '#e6edf3', fontSize: 18, fontWeight: 800, width: 22 }}>10</span>
      <div style={{ display: 'flex', gap: 3, marginLeft: 4 }}>
        {Array.from({ length: 10 }, (_, i) => (
          <div key={i} style={{
            width: 11, height: 11, borderRadius: '50%',
            background: i < a ? '#12b886' : '#ff9f43',
            boxShadow: `0 0 4px ${i < a ? 'rgba(18,184,134,0.5)' : 'rgba(255,159,67,0.5)'}`,
          }} />
        ))}
      </div>
    </motion.div>
  );
}

// ── Slides config ─────────────────────────────────────────────────────────────

function makeSlides(mode) {
  return [
    {
      icon: '🔟',
      title: '認識「湊十」！',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
          <div style={{
            fontSize: 15, color: 'rgba(139,163,190,0.85)', textAlign: 'center', lineHeight: 1.6,
          }}>
            把兩個數字加在一起，<br />
            湊成 <span style={{ color: '#12b886', fontWeight: 900 }}>10</span> 就成功了！
          </div>
          <TenFrame given={10} size={34} />
          <div style={{
            background: 'rgba(18,184,134,0.1)',
            border: '1px solid rgba(18,184,134,0.3)',
            borderRadius: 14,
            padding: '10px 20px',
            fontSize: 22, fontWeight: 900,
            color: '#12b886',
          }}>
            ? + ? = 10
          </div>
        </div>
      ),
    },
    {
      icon: '🤝',
      title: '10的所有夥伴',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[1, 2, 3, 4, 5].map((a, i) => (
            <PairRow key={a} a={a} index={i} />
          ))}
        </div>
      ),
    },
    {
      icon: '💡',
      title: '快速算法',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{
            background: 'rgba(10,22,38,0.6)',
            border: '1px solid rgba(77,171,247,0.2)',
            borderRadius: 16,
            padding: '14px 24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 13, color: 'rgba(139,163,190,0.7)', marginBottom: 6 }}>計算公式</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#e6edf3' }}>
              10 − N = <span style={{ color: '#12b886' }}>夥伴</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'rgba(139,163,190,0.6)', textAlign: 'center' }}>例如：</div>
          {[
            { n: 3, partner: 7 },
            { n: 6, partner: 4 },
          ].map(({ n, partner }) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: n === 3 ? 0.1 : 0.3 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'rgba(18,184,134,0.08)',
                borderRadius: 12, padding: '10px 18px',
                border: '1px solid rgba(18,184,134,0.2)',
              }}
            >
              <TenFrame given={n} size={22} />
              <div style={{ fontSize: 16, fontWeight: 800, color: 'rgba(139,163,190,0.8)' }}>
                10 − {n} =
              </div>
              <div style={{ fontSize: 24, fontWeight: 900, color: '#12b886' }}>{partner}</div>
            </motion.div>
          ))}
        </div>
      ),
    },
    {
      icon: mode === 'choose' ? '🎯' : '🔗',
      title: '開始玩！',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          {mode === 'choose' ? (
            <>
              <div style={{
                background: 'rgba(10,22,38,0.6)',
                border: '1px solid rgba(77,171,247,0.2)',
                borderRadius: 16, padding: '14px 20px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>❓</div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#e6edf3', marginBottom: 6 }}>
                  N + <span style={{ color: '#ff9f43' }}>?</span> = 10
                </div>
                <div style={{ fontSize: 13, color: 'rgba(139,163,190,0.75)' }}>
                  看見數字，選出它的夥伴！
                </div>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, width: '100%',
              }}>
                {[7, 3, 5, 9].map((n, i) => (
                  <div key={n} style={{
                    padding: '12px 0',
                    borderRadius: 14,
                    background: i === 0 ? 'rgba(18,184,134,0.2)' : 'rgba(14,22,40,0.8)',
                    border: `1.5px solid ${i === 0 ? 'rgba(18,184,134,0.7)' : 'rgba(50,75,110,0.6)'}`,
                    textAlign: 'center',
                    fontSize: 22, fontWeight: 900,
                    color: i === 0 ? '#12b886' : 'rgba(139,163,190,0.8)',
                  }}>
                    {n}
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(139,163,190,0.55)' }}>選正確答案就能得分！</div>
            </>
          ) : (
            <>
              <div style={{
                background: 'rgba(10,22,38,0.6)',
                border: '1px solid rgba(77,171,247,0.2)',
                borderRadius: 16, padding: '14px 20px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🔗</div>
                <div style={{ fontSize: 15, color: 'rgba(139,163,190,0.8)', lineHeight: 1.6 }}>
                  點兩個數字，<br />
                  讓它們加起來等於 <span style={{ color: '#12b886', fontWeight: 900 }}>10</span>！
                </div>
              </div>
              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, width: '100%',
              }}>
                {[[3, 7], [2, 8]].map(([a, b], ri) => (
                  [a, b].map((n, ci) => (
                    <div key={`${ri}-${ci}`} style={{
                      padding: '14px 0',
                      borderRadius: 14,
                      background: ci === 1 ? 'rgba(18,184,134,0.2)' : 'rgba(14,22,40,0.8)',
                      border: `1.5px solid ${ci === 1 ? 'rgba(18,184,134,0.7)' : 'rgba(50,75,110,0.6)'}`,
                      textAlign: 'center',
                      fontSize: 22, fontWeight: 900,
                      color: ci === 1 ? '#12b886' : 'rgba(139,163,190,0.8)',
                    }}>
                      {n}
                    </div>
                  ))
                ))}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(139,163,190,0.55)' }}>
                先點第一個，再點第二個！
              </div>
            </>
          )}
        </div>
      ),
    },
  ];
}

// ── Main Teaching component ───────────────────────────────────────────────────

export default function Teaching({ mode, onDone }) {
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [dir, setDir] = useState(1);
  const slides = makeSlides(mode);
  const isLast = slide === slides.length - 1;

  function next() {
    if (isLast) { onDone(); return; }
    setDir(1);
    setSlide(s => s + 1);
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

      <div style={{ width: '100%', maxWidth: 420, position: 'relative', zIndex: 1 }}>
        {/* Top row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(139,163,190,0.6)', fontSize: 13, fontWeight: 700,
              padding: 0, fontFamily: 'inherit',
            }}
          >
            ← 大廳
          </button>
          <div style={{ display: 'flex', gap: 6 }}>
            {slides.map((_, i) => (
              <div key={i} style={{
                width: i === slide ? 18 : 7, height: 7,
                borderRadius: 4,
                background: i === slide ? '#12b886' : 'rgba(139,163,190,0.2)',
                transition: 'width 0.3s, background 0.3s',
              }} />
            ))}
          </div>
          <button
            onClick={onDone}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'rgba(139,163,190,0.5)', fontSize: 13, fontWeight: 700,
              padding: 0, fontFamily: 'inherit',
            }}
          >
            跳過
          </button>
        </div>

        {/* Slide card */}
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={slide}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <div style={{
              background: 'rgba(10,22,38,0.92)',
              border: '1px solid rgba(26,44,61,0.95)',
              borderRadius: 24,
              padding: '24px 20px 20px',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 8px 40px rgba(0,0,0,0.4), 0 1px 0 rgba(255,255,255,0.04) inset',
            }}>
              {/* Icon + Title */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ fontSize: 48, lineHeight: 1, marginBottom: 10 }}
                >
                  {slides[slide].icon}
                </motion.div>
                <div style={{
                  fontSize: 22, fontWeight: 900,
                  background: 'linear-gradient(135deg, #12b886, #4dabf7)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  letterSpacing: '-0.02em',
                }}>
                  {slides[slide].title}
                </div>
              </div>

              {/* Content */}
              {slides[slide].content}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Next button */}
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={next}
          style={{
            width: '100%', padding: '16px 0', marginTop: 16,
            borderRadius: 18, border: 'none',
            background: 'linear-gradient(135deg, #12b886 0%, #0ca678 60%, #099268 100%)',
            color: '#fff', fontSize: 17, fontWeight: 900,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 24px rgba(18,184,134,0.45)',
            position: 'relative', overflow: 'hidden',
          }}
        >
          {isLast ? '🚀 開始遊戲！' : '下一頁 →'}
        </motion.button>
      </div>
    </div>
  );
}
