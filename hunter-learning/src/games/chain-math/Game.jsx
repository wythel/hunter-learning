import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import GameLayout from '../../components/GameLayout';
import ResultScreen from '../../components/ResultScreen';
import KeypadReview from '../../components/KeypadReview';
import BattleField from '../math-battle/BattleField';
import BattleUI from '../math-battle/BattleUI';
import { useGame } from './useGame';
import { useCountdown, TIMED_SECONDS } from '../../hooks/useCountdown';
import TimeBar from '../../components/TimeBar';

export default function ChainMathGame() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { operation = 'add', difficulty = 'easy', count = 10, timed = false } = location.state || {};

  const [reviewing, setReviewing] = useState(false);

  const {
    question, answer, phase, currentQ, stats,
    playerHP, monster, monsterHP, monsterMaxHP, playerSvg,
    monsterFlash, playerFlash, playerAttacking, monsterAttacking,
    stars, title, elapsedSec, handleKey,
    timeoutAnswer, timerPaused, handleTimeout, wrong,
  } = useGame({ operation, difficulty, count });

  const { fraction } = useCountdown({
    seconds: TIMED_SECONDS,
    enabled: timed && phase === 'playing',
    paused: timerPaused,
    resetKey: currentQ,
    onExpire: handleTimeout,
  });

  useEffect(() => {
    function onKey(e) {
      if (e.key >= '0' && e.key <= '9') handleKey(e.key);
      else if (e.key === 'Backspace')    handleKey('back');
      else if (e.key === 'Enter')        handleKey('ok');
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleKey]);

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
        onRetry={() => navigate('/chain-math/play', { state: { operation, difficulty, count, timed } })}
        onMenu={() => navigate('/chain-math')}
        onLobby={() => navigate('/')}
        onReview={wrong.length ? () => setReviewing(true) : undefined}
      />
    );
  }

  return (
    <GameLayout>
      {timeoutAnswer != null && (
        <div style={{
          position: 'absolute', top: '34%', left: '50%',
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
      <BattleField
        monsterSvg={monster.svg}
        monsterName={monster.name}
        monsterHP={monsterHP}
        monsterMaxHP={monsterMaxHP}
        playerSvg={playerSvg}
        playerHP={playerHP}
        monsterFlash={monsterFlash}
        playerFlash={playerFlash}
        playerAttacking={playerAttacking}
        monsterAttacking={monsterAttacking}
      />
      {timed && (
        <div style={{ padding: '0 16px 6px' }}>
          <TimeBar fraction={fraction} />
        </div>
      )}
      <BattleUI
        question={question.text}
        answer={answer}
        currentQ={currentQ}
        count={count}
        onKey={handleKey}
        locked={false}
      />
    </GameLayout>
  );
}
