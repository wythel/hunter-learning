import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Text } from '@mantine/core';
import GameLayout from '../../components/GameLayout';
import DexStrip from '../../components/DexStrip';
import ResultScreen from '../../components/ResultScreen';
import StarField from '../../components/StarField';
import { useGame } from './useGame';

// 星數看「有按錯的題目」佔比，和 english-match 同一把尺
function starsFromStats(missed, total) {
  if (total === 0) return 3;
  const pct = missed / total;
  if (pct <= 0.2) return 3;
  if (pct <= 0.4) return 2;
  if (pct <= 0.6) return 1;
  return 0;
}

const TITLES = ['再試一次！', '多練習！', '繼續努力！', '耳朵超靈！'];

const listenBtn = {
  display: 'flex', alignItems: 'center', gap: 6,
  padding: '10px 16px', borderRadius: 999,
  border: '1.5px solid var(--dex-gold)',
  background: 'rgba(255, 212, 0, 0.12)',
  color: 'var(--dex-gold)',
  fontSize: 16, fontWeight: 800,
  cursor: 'pointer', fontFamily: 'inherit',
};

export default function SentenceListenGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { count = 10, difficulty = 'easy' } = location.state || {};

  const {
    sentence, target, tiles, placed, wrongId, solved,
    currentQ, total, stats, wrongTaps, phase, elapsedSec,
    handleTile, play,
  } = useGame({ count, difficulty });

  if (phase === 'result') {
    const stars = starsFromStats(stats.missed, total);
    return (
      <ResultScreen
        title={TITLES[stars]}
        stars={stars}
        stats={[
          { icon: '✅', label: '一次就對', value: `${stats.perfect} 題` },
          { icon: '❌', label: '按錯次數', value: `${wrongTaps} 次` },
          { icon: '⏱️', label: '時間',     value: `${elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/sentence-listen/play', { state: { count, difficulty } })}
        onMenu={() => navigate('/sentence-listen')}
        onLobby={() => navigate('/')}
      />
    );
  }

  return (
    <GameLayout>
      <DexStrip
        onBack={() => navigate('/sentence-listen')}
        progress={`第 ${currentQ + 1} / ${total} 題`}
      />
      <StarField />
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: 20,
        padding: '20px 16px',
        position: 'relative', zIndex: 1,
        maxWidth: 480, margin: '0 auto', width: '100%',
      }}>
        {/* 聽 */}
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            width: '100%',
            background: 'rgba(22, 27, 34, 0.9)',
            border: '1px solid rgba(48, 54, 61, 0.8)',
            borderRadius: 20,
            padding: '20px 16px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
          }}
        >
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => play()} style={listenBtn}>
              🔊 再聽一次
            </motion.button>
            <motion.button type="button" whileTap={{ scale: 0.92 }} onClick={() => play(true)} style={listenBtn}>
              🐢 慢慢聽
            </motion.button>
          </div>

          {/* 答案格：依序填入 */}
          <div data-testid="slots" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 8 }}>
            {target.map((w, i) => {
              const filled = i < placed;
              const isNext = i === placed && !solved;
              return (
                <div
                  key={i}
                  style={{
                    minWidth: 56, padding: '8px 10px',
                    borderRadius: 10,
                    border: filled ? '1.5px solid #12b886'
                      : isNext ? '1.5px dashed var(--dex-gold)'
                      : '1.5px dashed rgba(139, 163, 190, 0.4)',
                    background: filled ? 'rgba(18, 184, 134, 0.15)' : 'transparent',
                    color: filled ? '#12b886' : 'transparent',
                    fontSize: 20, fontWeight: 800, textAlign: 'center',
                  }}
                >
                  {filled ? w : '·'}
                </div>
              );
            })}
          </div>

          <Text style={{ minHeight: 24, color: '#8ba3be', fontSize: 18, fontWeight: 700 }}>
            {solved ? `🎉 ${sentence.zh}` : '聽聽看，照順序按單字'}
          </Text>
        </motion.div>

        {/* 字卡 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
          {tiles.map(t => {
            const isWrong = wrongId === t.id;
            return (
              <motion.button
                key={`${currentQ}-${t.id}`}
                type="button"
                disabled={t.used}
                whileTap={t.used ? undefined : { scale: 0.92 }}
                animate={isWrong ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.35 }}
                onClick={() => handleTile(t.id)}
                style={{
                  padding: '14px 18px',
                  borderRadius: 14,
                  border: isWrong ? '1.5px solid #f85149' : '1.5px solid rgba(48, 54, 61, 0.8)',
                  background: isWrong ? 'rgba(248, 81, 73, 0.15)' : 'rgba(22, 27, 34, 0.9)',
                  color: isWrong ? '#f85149' : '#e6edf3',
                  fontSize: 22, fontWeight: 800,
                  cursor: t.used ? 'default' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: t.used ? 0.15 : 1,
                  transition: 'opacity 0.2s, background 0.15s',
                }}
              >
                {t.word}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameLayout>
  );
}
