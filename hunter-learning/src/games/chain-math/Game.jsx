import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import GameLayout from '../../components/GameLayout';
import ResultScreen from '../../components/ResultScreen';
import BattleField from '../math-battle/BattleField';
import BattleUI from '../math-battle/BattleUI';
import { useGame } from './useGame';

export default function ChainMathGame() {
  const location = useLocation();
  const navigate  = useNavigate();
  const { operation = 'add', difficulty = 'easy', count = 10 } = location.state || {};

  const {
    question, answer, phase, currentQ, stats,
    playerHP, monster, monsterHP, monsterMaxHP, playerSvg,
    monsterFlash, playerFlash, playerAttacking, monsterAttacking,
    stars, title, elapsedSec, handleKey,
  } = useGame({ operation, difficulty, count });

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
    return (
      <ResultScreen
        title={title}
        stars={stars}
        stats={[
          { icon: '✅', label: '答對', value: `${stats.correct} 題` },
          { icon: '❌', label: '答錯', value: `${stats.wrong} 題` },
          { icon: '⏱️', label: '時間', value: `${elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/chain-math/play', { state: { operation, difficulty, count } })}
        onMenu={() => navigate('/chain-math')}
        onLobby={() => navigate('/')}
      />
    );
  }

  return (
    <GameLayout>
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
