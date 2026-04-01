import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function MemorySettings() {
  const navigate = useNavigate();
  const [pairType, setPairType]   = useState('en-zh');
  const [difficulty, setDifficulty] = useState('easy');

  const settings = [
    {
      label: '配對類型',
      options: [
        { value: 'en-zh', icon: '🔤', text: '英→中' },
        { value: 'zh-en', icon: '📖', text: '中→英' },
        { value: 'math',  icon: '🔢', text: '數學' },
      ],
      selected: pairType,
      onChange: setPairType,
    },
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '6 對' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '8 對' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
  ];

  return (
    <SettingsPage
      title="記憶翻牌"
      icon="🃏"
      settings={settings}
      onStart={() => navigate('/memory-flip/play', { state: { pairType, difficulty } })}
    />
  );
}
