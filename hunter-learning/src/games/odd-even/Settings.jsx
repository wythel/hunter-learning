import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function OddEvenSettings() {
  const navigate = useNavigate();
  const [mode,       setMode]       = useState('identify');
  const [difficulty, setDifficulty] = useState('easy');
  const [count,      setCount]      = useState(8);

  const settings = [
    {
      label: '遊戲模式',
      options: [
        { value: 'identify', icon: '🔢', text: '辨識',  sub: '判斷奇數或偶數' },
        { value: 'sort',     icon: '🗂️', text: '分類',  sub: '找出所有奇數或偶數' },
      ],
      selected: mode,
      onChange: setMode,
    },
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '⭐', text: '簡單', sub: '1 – 10' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '1 – 20' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
    {
      label: '題數',
      options: [
        { value: 8,  icon: '⚡', text: '8 題' },
        { value: 15, icon: '📚', text: '15 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="奇偶小偵探"
      icon="🔢"
      settings={settings}
      onStart={() => navigate('/odd-even/play', { state: { mode, difficulty, count } })}
    />
  );
}
