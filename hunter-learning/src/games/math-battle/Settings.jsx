import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function MathBattleSettings() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('easy');
  const [count, setCount]           = useState(10);

  const settings = [
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '個位數' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '兩位數' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
    {
      label: '題數',
      options: [
        { value: 5,  icon: '⚡', text: '5 題',  sub: '快速' },
        { value: 10, icon: '⚔️', text: '10 題', sub: '標準' },
        { value: 20, icon: '🏆', text: '20 題', sub: '挑戰' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="算數大戰"
      icon="⚔️"
      settings={settings}
      onStart={() => navigate('/math-battle/play', { state: { difficulty, count } })}
    />
  );
}
