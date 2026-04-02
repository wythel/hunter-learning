import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stack, Text, Title, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import StarField from '../../components/StarField';
import { SHAPES } from './ShapeDisplay';

// ── Specific shapes used in teaching ─────────────────────────────────────────

const HEART    = SHAPES.find(s => s.id === 'heart');
const CIRCLE   = SHAPES.find(s => s.id === 'circle');
const SQUARE   = SHAPES.find(s => s.id === 'square');
const TRIANGLE = SHAPES.find(s => s.id === 'equilateral-triangle');
const LSHAPE   = SHAPES.find(s => s.id === 'l-shape');
const SCALENE  = SHAPES.find(s => s.id === 'scalene-triangle');
const IRREG    = SHAPES.find(s => s.id === 'irregular-quad');

// ── Small shape card with optional axis overlay ───────────────────────────────

function MiniShape({ shape, showAxis = false, badge = null, size = 76 }) {
  const inner = size - 18;
  const borderColor = badge === '✓'
    ? 'rgba(18,184,134,0.5)'
    : badge === '✗'
    ? 'rgba(248,81,73,0.4)'
    : 'rgba(48,54,61,0.8)';

  return (
    <Stack align="center" gap={4} style={{ position: 'relative' }}>
      {badge && (
        <div style={{
          position: 'absolute', top: -6, right: -6, zIndex: 2,
          background: badge === '✓' ? '#12b886' : '#f85149',
          color: '#fff', borderRadius: '50%',
          width: 20, height: 20, fontSize: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700,
        }}>
          {badge}
        </div>
      )}
      <div style={{
        width: size, height: size, borderRadius: 12,
        background: 'rgba(22,27,34,0.9)',
        border: `1.5px solid ${borderColor}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 50 50" width={inner} height={inner}>
          <g fill={shape.color} stroke={shape.color} strokeWidth="0">
            {shape.render()}
          </g>
          {showAxis && (
            <motion.path
              d="M25,0 L25,50"
              fill="none" stroke="#12b886" strokeWidth="2" strokeDasharray="4 2.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            />
          )}
        </svg>
      </div>
      <Text size="xs" c="dimmed" ta="center" style={{ lineHeight: 1.2 }}>{shape.label}</Text>
    </Stack>
  );
}

// ── Slide 0: concept visual (heart with axis + labels) ────────────────────────

function ConceptVisual() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <svg viewBox="0 0 150 130" width="190" height="165">
        {/* half backgrounds */}
        <rect x="20" y="8" width="50" height="90" rx="4" fill="rgba(18,184,134,0.08)" />
        <rect x="70" y="8" width="50" height="90" rx="4" fill="rgba(248,81,73,0.08)" />

        {/* heart scaled 2× into 100×100 box starting at (20,8) */}
        <g transform="translate(20,8) scale(2)" fill={HEART.color}>
          {HEART.render()}
        </g>

        {/* animated axis */}
        <motion.path
          d="M70,2 L70,100"
          fill="none" stroke="#12b886" strokeWidth="2.5" strokeDasharray="5 3"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.7 }}
        />

        {/* axis label */}
        <text x="73" y="16" fill="#12b886" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
          對稱軸
        </text>

        {/* half labels */}
        <text x="45" y="107" fill="rgba(18,184,134,0.9)" fontSize="9" fontFamily="sans-serif" textAnchor="middle">
          左半
        </text>
        <text x="95" y="107" fill="rgba(248,81,73,0.9)" fontSize="9" fontFamily="sans-serif" textAnchor="middle">
          右半
        </text>

        {/* result */}
        <text x="75" y="124" fill="#8b949e" fontSize="10" fontFamily="sans-serif" textAnchor="middle">
          兩邊完全相同 ✓
        </text>
      </svg>
    </div>
  );
}

// ── Slide 3 (mode2): mini grid demo ──────────────────────────────────────────

function GridDemo() {
  const pattern = [[1,0],[1,1],[1,0],[1,1],[0,0]];
  const CELL = 22;
  const GAP  = 3;
  const totalH = 5 * CELL + 4 * GAP;

  return (
    <Stack align="center" gap={10}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        {/* Left 2 cols (pre-filled) */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(2, ${CELL}px)`, gap: GAP }}>
          {pattern.map((row, r) => row.map((filled, c) => (
            <div key={`L${r}${c}`} style={{
              width: CELL, height: CELL, borderRadius: 4,
              background: filled ? 'rgba(18,184,134,0.75)' : 'rgba(48,54,61,0.3)',
              border: `1px solid ${filled ? 'rgba(18,184,134,0.9)' : 'rgba(48,54,61,0.5)'}`,
            }} />
          )))}
        </div>

        {/* Axis */}
        <div style={{
          width: 3, height: totalH,
          background: 'repeating-linear-gradient(to bottom, #12b886 0px, #12b886 4px, transparent 4px, transparent 8px)',
        }} />

        {/* Right 2 cols (mirror: col3=col1, col4=col0) */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(2, ${CELL}px)`, gap: GAP }}>
          {pattern.map((row, r) => {
            const [c0, c1] = row;
            return [c1, c0].map((filled, c) => (
              <div key={`R${r}${c}`} style={{
                width: CELL, height: CELL, borderRadius: 4,
                background: filled ? 'rgba(18,184,134,0.45)' : 'rgba(48,54,61,0.3)',
                border: `1.5px dashed ${filled ? 'rgba(18,184,134,0.7)' : 'rgba(48,54,61,0.5)'}`,
              }} />
            ));
          })}
        </div>
      </div>

      <Group gap={16} justify="center">
        <Group gap={5}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(18,184,134,0.75)', border: '1px solid rgba(18,184,134,0.9)' }} />
          <Text size="xs" c="dimmed">已畫（左側）</Text>
        </Group>
        <Group gap={5}>
          <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(18,184,134,0.45)', border: '1.5px dashed rgba(18,184,134,0.7)' }} />
          <Text size="xs" c="dimmed">你來填（右側）</Text>
        </Group>
      </Group>
    </Stack>
  );
}

// ── Slide definitions ─────────────────────────────────────────────────────────

function buildSlides(mode) {
  return [
    {
      key: 'concept',
      icon: '🪞',
      title: '什麼是對稱？',
      visual: <ConceptVisual />,
      desc: '把圖形沿著一條線對折，兩邊完全重合，就叫做「對稱」！那條線就是「對稱軸」。',
    },
    {
      key: 'symmetric',
      icon: '✅',
      title: '有對稱軸的圖形',
      visual: (
        <Group justify="center" gap={12} wrap="wrap">
          {[HEART, CIRCLE, SQUARE, TRIANGLE].map(s => (
            <MiniShape key={s.id} shape={s} showAxis badge="✓" />
          ))}
        </Group>
      ),
      desc: '沿著對稱軸對折，兩半完全重合！虛線就是對稱軸。',
    },
    {
      key: 'non-symmetric',
      icon: '❌',
      title: '沒有對稱軸的圖形',
      visual: (
        <Group justify="center" gap={16}>
          {[SCALENE, LSHAPE, IRREG].map(s => (
            <MiniShape key={s.id} shape={s} badge="✗" />
          ))}
        </Group>
      ),
      desc: '不管沿哪條線折，兩邊都不會完全相同 — 這些圖形沒有對稱軸。',
    },
    {
      key: 'instructions',
      icon: mode === 'mode1' ? '👁️' : '✏️',
      title: mode === 'mode1' ? '遊戲玩法：辨識' : '遊戲玩法：繪製',
      visual: mode === 'mode1' ? (
        <Stack align="center" gap={8}>
          <Text style={{ fontSize: 48 }}>🔍</Text>
          <div style={{
            background: 'rgba(18,184,134,0.08)',
            border: '1px solid rgba(18,184,134,0.3)',
            borderRadius: 12, padding: '12px 16px', width: '100%',
          }}>
            <Text c="gray.3" size="sm" ta="center" style={{ lineHeight: 1.7 }}>
              每題有 <Text component="span" c="teal.4" fw={700}>4 個圖形</Text>，<br />
              選出<Text component="span" c="teal.4" fw={700}>有</Text>（或<Text component="span" c="red.4" fw={700}>沒有</Text>）對稱軸的那一個！
            </Text>
          </div>
          <Text c="dimmed" size="xs" ta="center">答對繼續，答錯會顯示正確答案。</Text>
        </Stack>
      ) : (
        <Stack align="center" gap={12}>
          <GridDemo />
          <div style={{
            background: 'rgba(18,184,134,0.08)',
            border: '1px solid rgba(18,184,134,0.3)',
            borderRadius: 12, padding: '10px 16px', width: '100%',
          }}>
            <Text c="gray.3" size="sm" ta="center" style={{ lineHeight: 1.7 }}>
              左邊已畫好，點擊<Text component="span" c="teal.4" fw={700}>右側格子</Text>讓圖形左右對稱！
            </Text>
          </div>
        </Stack>
      ),
      desc: null,
    },
  ];
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Teaching({ mode, onDone }) {
  const navigate  = useNavigate();
  const [step, setStep] = useState(0);
  const [dir,  setDir]  = useState(1);

  const allSlides = buildSlides(mode);
  const total  = allSlides.length;
  const slide  = allSlides[step];
  const isLast = step === total - 1;

  function goNext() {
    if (isLast) { onDone(); return; }
    setDir(1);
    setStep(s => s + 1);
  }
  function goPrev() {
    setDir(-1);
    setStep(s => s - 1);
  }

  const variants = {
    enter:  d => ({ opacity: 0, x: d *  40 }),
    center: _  => ({ opacity: 1, x: 0 }),
    exit:   d  => ({ opacity: 0, x: d * -40 }),
  };

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

          {/* Header */}
          <Group justify="space-between" align="center" mb={20}>
            <button
              onClick={() => navigate('/')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', fontSize: 22, padding: '4px 8px', fontFamily: 'inherit' }}
            >
              ← 大廳
            </button>
            <Text size="xs" c="dimmed">對稱遊戲 — 教學</Text>
            <button
              onClick={onDone}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', fontSize: 14, padding: '4px 12px', fontFamily: 'inherit' }}
            >
              跳過
            </button>
          </Group>

          {/* Progress dots */}
          <Group justify="center" gap={8} mb={20}>
            {allSlides.map((_, i) => (
              <motion.div
                key={i}
                animate={{ width: i === step ? 20 : 8 }}
                transition={{ duration: 0.3 }}
                style={{
                  height: 8, borderRadius: 4,
                  background: i === step ? '#12b886' : i < step ? 'rgba(18,184,134,0.4)' : 'rgba(48,54,61,0.8)',
                }}
              />
            ))}
          </Group>

          {/* Slide card */}
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={slide.key}
              custom={dir}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22 }}
            >
              <div style={{
                background: 'rgba(22,27,34,0.9)',
                border: '1px solid rgba(48,54,61,0.8)',
                borderRadius: 20, padding: '24px 20px',
                backdropFilter: 'blur(8px)',
              }}>
                <Stack gap={16} align="center">
                  <Text style={{ fontSize: 40 }}>{slide.icon}</Text>
                  <Title order={3} style={{ color: '#e6edf3', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>
                    {slide.title}
                  </Title>
                  <div style={{ width: '100%' }}>
                    {slide.visual}
                  </div>
                  {slide.desc && (
                    <Text c="dimmed" size="sm" ta="center" style={{ lineHeight: 1.7 }}>
                      {slide.desc}
                    </Text>
                  )}
                </Stack>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <Group justify="space-between" mt={20}>
            <button
              onClick={goPrev}
              disabled={step === 0}
              style={{
                background: 'none',
                border: '1px solid rgba(48,54,61,0.8)',
                borderRadius: 12, padding: '10px 20px',
                cursor: step === 0 ? 'default' : 'pointer',
                color: step === 0 ? 'rgba(139,148,158,0.3)' : '#8b949e',
                fontSize: 15, fontFamily: 'inherit',
              }}
            >
              ← 上一步
            </button>
            <button
              onClick={goNext}
              style={{
                background: 'linear-gradient(135deg, #12b886, #0dcfaa)',
                border: 'none', borderRadius: 12, padding: '10px 28px',
                cursor: 'pointer', color: '#fff', fontSize: 15, fontWeight: 700,
                fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(18,184,134,0.3)',
              }}
            >
              {isLast ? '🚀 開始遊戲！' : '下一步 →'}
            </button>
          </Group>
        </div>
      </div>
    </div>
  );
}
