import { useLocation, useNavigate } from 'react-router-dom';
import { Text, Button } from '@mantine/core';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import MoonSystem from './MoonSystem';
import { useGame } from './useGame';
import { PHASES, phaseKeysForDifficulty } from './data';

export default function MoonPhasesGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { difficulty = 'easy', count = 8 } = location.state || {};

  const g = useGame({ difficulty, count });

  if (g.phase === 'result') {
    return (
      <ResultScreen
        title={g.title}
        stars={g.stars}
        stats={[
          { icon: '✅', label: '答對', value: `${g.stats.correct} 題` },
          { icon: '❌', label: '答錯', value: `${g.stats.wrong} 題` },
          { icon: '⏱️', label: '時間', value: `${g.elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/moon-phases/play', { state: { difficulty, count } })}
        onMenu={() => navigate('/moon-phases')}
        onLobby={() => navigate('/')}
      />
    );
  }

  const isSandbox = g.phase === 'sandbox';
  const identifyKeys = g.challenge?.kind === 'identify'
    ? g.challenge.choices
    : phaseKeysForDifficulty(difficulty);

  const banner = isSandbox
    ? '拖動月亮繞地球轉，看看月相怎麼變！'
    : g.challenge?.kind === 'place'
      ? `把月亮拖到能看到「${g.targetName}」的位置`
      : '從地球看，這是什麼月相？';

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarField />
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px', paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))', position: 'relative', zIndex: 1,
      }}>
        {/* 進度 / 提示 */}
        <div style={{ textAlign: 'center', minHeight: 48, marginBottom: 4 }}>
          {!isSandbox && (
            <Text size="sm" style={{ color: 'rgba(139,163,190,0.8)', fontWeight: 700 }}>
              第 {g.currentQ + 1} / {count} 題
            </Text>
          )}
          <Text style={{ fontSize: 17, fontWeight: 800, color: '#e9edf7' }}>{banner}</Text>
        </div>

        {/* 雙視角：辨認題唯讀、其餘可拖 */}
        <MoonSystem
          angle={g.angle}
          onAngleChange={g.challenge?.kind === 'identify' ? null : g.setAngle}
          difficulty={difficulty}
          showLabel={isSandbox}
        />

        {/* 回饋 */}
        {g.feedback && (
          <Text style={{ fontSize: 20, fontWeight: 900, marginTop: 6,
            color: g.feedback.correct ? '#51cf66' : '#ff6b6b' }}>
            {g.feedback.correct ? '答對了！🎉' : '再想想～'}
          </Text>
        )}

        {/* 操作區 */}
        <div style={{ marginTop: 'auto', width: '100%', maxWidth: 360, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {isSandbox && (
            <Button size="lg" radius="xl" fullWidth onClick={g.startChallenge}
              style={{ background: 'linear-gradient(135deg,#8b9dff,#6f6cff)', fontWeight: 900 }}>
              準備好了，開始挑戰！
            </Button>
          )}

          {!isSandbox && g.challenge?.kind === 'place' && (
            <Button size="lg" radius="xl" fullWidth disabled={!!g.feedback} onClick={g.submitPlacement}
              style={{ background: 'linear-gradient(135deg,#8b9dff,#6f6cff)', fontWeight: 900 }}>
              確認位置
            </Button>
          )}

          {!isSandbox && g.challenge?.kind === 'identify' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {identifyKeys.map(key => {
                const name = PHASES.find(p => p.key === key).name;
                return (
                  <Button key={key} size="lg" radius="lg" disabled={!!g.feedback}
                    onClick={() => g.handleIdentify(key)}
                    style={{ background: 'rgba(30,42,64,0.9)', border: '1.5px solid rgba(139,157,255,0.4)',
                      color: '#e9edf7', fontWeight: 800, fontSize: 20 }}>
                    {name}
                  </Button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
