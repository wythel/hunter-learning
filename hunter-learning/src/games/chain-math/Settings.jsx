import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function ChainMathSettings() {
  const navigate = useNavigate();
  const [operation, setOperation] = useState('add');
  const [difficulty, setDifficulty] = useState('easy');
  const [count, setCount] = useState(10);

  const settings = [
    {
      label: '運算',
      options: [
        { value: 'add', icon: '➕', text: '加法' },
        { value: 'sub', icon: '➖', text: '減法' },
        { value: 'mix', icon: '🔀', text: '混合' },
      ],
      selected: operation,
      onChange: setOperation,
    },
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
        { value: 5,  icon: '⚡', text: '5 題' },
        { value: 10, icon: '⚔️', text: '10 題' },
        { value: 20, icon: '🏆', text: '20 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="連鎖算數大戰"
      icon="➕"
      settings={settings}
      onStart={() => navigate('/chain-math/play', { state: { operation, difficulty, count } })}
    />
  );
}
