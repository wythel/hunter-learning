import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Stack, Text, Title, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import StarField from '../../components/StarField';

// ── Dot pair display ──────────────────────────────────────────────────────────

function PairDots({ count, size = 24, gap = 8 }) {
  const pairs = Math.floor(count / 2);
  const isOdd = count % 2 === 1;
  return (
    <Stack align="center" gap={gap / 2}>
      {Array(pairs).fill(0).map((_, pi) => (
        <Group key={pi} gap={gap}>
          <div style={{ width: size, height: size, borderRadius: '50%', background: '#12b886', boxShadow: '0 0 6px rgba(18,184,134,0.5)' }} />
          <div style={{ width: size, height: size, borderRadius: '50%', background: '#12b886', boxShadow: '0 0 6px rgba(18,184,134,0.5)' }} />
        </Group>
      ))}
      {isOdd && (
        <div style={{ width: size, height: size, borderRadius: '50%', background: '#f85149', boxShadow: '0 0 8px rgba(248,81,73,0.6)' }} />
      )}
    </Stack>
  );
}

// ── Digit badge ───────────────────────────────────────────────────────────────

function DigitBadge({ n, isEven }) {
  return (
    <div style={{
      width: 38, height: 38, borderRadius: 10,
      background: isEven ? 'rgba(18,184,134,0.15)' : 'rgba(248,81,73,0.12)',
      border: `1.5px solid ${isEven ? 'rgba(18,184,134,0.6)' : 'rgba(248,81,73,0.5)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <Text fw={800} style={{ fontSize: 18, color: isEven ? '#12b886' : '#f85149' }}>{n}</Text>
    </div>
  );
}

// ── Slides ────────────────────────────────────────────────────────────────────

function buildSlides(mode) {
  return [
    {
      key: 'even',
      icon: '🟢',
      title: '什麼是偶數？',
      visual: (
        <Stack align="center" gap={12}>
          <Group gap={20} align="flex-start">
            <PairDots count={6} />
            <Stack gap={6} justify="center">
              <Text c="teal.4" fw={700} size="sm">全部配成對！</Text>
              <Text c="dimmed" size="xs">3 對，沒有剩下</Text>
              <Text c="teal.4" fw={800} style={{ fontSize: 22 }}>→ 偶數 ✓</Text>
            </Stack>
          </Group>
          <div style={{ background: 'rgba(18,184,134,0.08)', border: '1px solid rgba(18,184,134,0.3)', borderRadius: 10, padding: '10px 14px' }}>
            <Text c="gray.3" size="sm" ta="center">
              可以剛好兩兩配對，<Text component="span" c="teal.4" fw={700}>沒有剩下的</Text>就是偶數
            </Text>
          </div>
        </Stack>
      ),
      desc: '偶數的個位數字一定是 0、2、4、6、8 其中之一。',
    },
    {
      key: 'odd',
      icon: '🔴',
      title: '什麼是奇數？',
      visual: (
        <Stack align="center" gap={12}>
          <Group gap={20} align="flex-start">
            <PairDots count={7} />
            <Stack gap={6} justify="center">
              <Text c="dimmed" size="xs">3 對配完後…</Text>
              <Text style={{ color: '#f85149' }} fw={700} size="sm">還剩 1 個！</Text>
              <Text style={{ color: '#f85149' }} fw={800} style={{ fontSize: 22 }}>→ 奇數 ✓</Text>
            </Stack>
          </Group>
          <div style={{ background: 'rgba(248,81,73,0.08)', border: '1px solid rgba(248,81,73,0.3)', borderRadius: 10, padding: '10px 14px' }}>
            <Text c="gray.3" size="sm" ta="center">
              配對後還剩<Text component="span" style={{ color: '#f85149' }} fw={700}> 1 個</Text>就是奇數
            </Text>
          </div>
        </Stack>
      ),
      desc: '奇數的個位數字一定是 1、3、5、7、9 其中之一。',
    },
    {
      key: 'trick',
      icon: '💡',
      title: '快速判斷法',
      visual: (
        <Stack gap={14}>
          <Text c="dimmed" size="sm" ta="center">只看最後一位數字！</Text>
          <Group justify="center" gap={24}>
            <Stack align="center" gap={8}>
              <Text c="teal.4" fw={700} size="sm">偶數尾數</Text>
              <Group gap={6}>
                {[0, 2, 4, 6, 8].map(n => <DigitBadge key={n} n={n} isEven />)}
              </Group>
            </Stack>
            <Stack align="center" gap={8}>
              <Text style={{ color: '#f85149' }} fw={700} size="sm">奇數尾數</Text>
              <Group gap={6}>
                {[1, 3, 5, 7, 9].map(n => <DigitBadge key={n} n={n} isEven={false} />)}
              </Group>
            </Stack>
          </Group>
          <Group justify="center" gap={20}>
            {[
              { n: 24, label: '偶數', even: true },
              { n: 17, label: '奇數', even: false },
              { n: 8,  label: '偶數', even: true },
              { n: 13, label: '奇數', even: false },
            ].map(({ n, label, even }) => (
              <Stack key={n} align="center" gap={4}>
                <Text fw={800} style={{ fontSize: 22, color: '#e6edf3' }}>{n}</Text>
                <Text size="xs" fw={700} style={{ color: even ? '#12b886' : '#f85149' }}>{label}</Text>
              </Stack>
            ))}
          </Group>
        </Stack>
      ),
      desc: null,
    },
    {
      key: 'instructions',
      icon: mode === 'identify' ? '🔢' : '🗂️',
      title: '開始挑戰！',
      visual: mode === 'identify' ? (
        <Stack align="center" gap={10}>
          <Text style={{ fontSize: 56, lineHeight: 1 }}>7</Text>
          <Text c="dimmed" size="xs">看到數字，判斷它是奇數還是偶數</Text>
          <Group gap={12}>
            <div style={{
              padding: '10px 22px', borderRadius: 12, fontSize: 16, fontWeight: 700,
              background: 'rgba(248,81,73,0.15)', border: '2px solid rgba(248,81,73,0.5)', color: '#f85149',
            }}>奇數</div>
            <div style={{
              padding: '10px 22px', borderRadius: 12, fontSize: 16, fontWeight: 700,
              background: 'rgba(18,184,134,0.15)', border: '2px solid rgba(18,184,134,0.5)', color: '#12b886',
            }}>偶數</div>
          </Group>
          <Text c="dimmed" size="xs" ta="center">點圖中的小圓點可以幫助你數！</Text>
        </Stack>
      ) : (
        <Stack align="center" gap={10}>
          <div style={{ background: 'rgba(18,184,134,0.08)', border: '1px solid rgba(18,184,134,0.3)', borderRadius: 12, padding: '12px 16px' }}>
            <Text c="gray.3" size="sm" ta="center" style={{ lineHeight: 1.7 }}>
              題目會出現 6 個數字，<br />
              選出所有<Text component="span" c="teal.4" fw={700}>偶數</Text>（或<Text component="span" style={{ color: '#f85149' }} fw={700}>奇數</Text>），<br />
              再按「確認」！
            </Text>
          </div>
          <Text c="dimmed" size="xs" ta="center">多選或少選都算錯，要全部選對！</Text>
        </Stack>
      ),
      desc: null,
    },
  ];
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function OddEvenTeaching({ mode, onDone }) {
  const navigate = useNavigate();
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

          <Group justify="space-between" align="center" mb={20}>
            <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', fontSize: 22, padding: '4px 8px', fontFamily: 'inherit' }}>
              ← 大廳
            </button>
            <Text size="xs" c="dimmed">奇偶小偵探 — 教學</Text>
            <button onClick={onDone} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8b949e', fontSize: 14, padding: '4px 12px', fontFamily: 'inherit' }}>
              跳過
            </button>
          </Group>

          <Group justify="center" gap={8} mb={20}>
            {allSlides.map((_, i) => (
              <motion.div key={i} animate={{ width: i === step ? 20 : 8 }} transition={{ duration: 0.3 }}
                style={{ height: 8, borderRadius: 4, background: i === step ? '#12b886' : i < step ? 'rgba(18,184,134,0.4)' : 'rgba(48,54,61,0.8)' }} />
            ))}
          </Group>

          <AnimatePresence mode="wait" custom={dir}>
            <motion.div key={slide.key} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.22 }}>
              <div style={{ background: 'rgba(22,27,34,0.9)', border: '1px solid rgba(48,54,61,0.8)', borderRadius: 20, padding: '24px 20px', backdropFilter: 'blur(8px)' }}>
                <Stack gap={16} align="center">
                  <Text style={{ fontSize: 40 }}>{slide.icon}</Text>
                  <Title order={3} style={{ color: '#e6edf3', fontSize: 20, fontWeight: 800, textAlign: 'center' }}>
                    {slide.title}
                  </Title>
                  <div style={{ width: '100%' }}>{slide.visual}</div>
                  {slide.desc && (
                    <Text c="dimmed" size="sm" ta="center" style={{ lineHeight: 1.7 }}>{slide.desc}</Text>
                  )}
                </Stack>
              </div>
            </motion.div>
          </AnimatePresence>

          <Group justify="space-between" mt={20}>
            <button onClick={goPrev} disabled={step === 0} style={{
              background: 'none', border: '1px solid rgba(48,54,61,0.8)', borderRadius: 12, padding: '10px 20px',
              cursor: step === 0 ? 'default' : 'pointer',
              color: step === 0 ? 'rgba(139,148,158,0.3)' : '#8b949e',
              fontSize: 15, fontFamily: 'inherit',
            }}>← 上一步</button>
            <button onClick={goNext} style={{
              background: 'linear-gradient(135deg, #12b886, #0dcfaa)',
              border: 'none', borderRadius: 12, padding: '10px 28px',
              cursor: 'pointer', color: '#fff', fontSize: 15, fontWeight: 700,
              fontFamily: 'inherit', boxShadow: '0 4px 16px rgba(18,184,134,0.3)',
            }}>{isLast ? '🚀 開始遊戲！' : '下一步 →'}</button>
          </Group>
        </div>
      </div>
    </div>
  );
}
