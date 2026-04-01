import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function MoleSettings() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('easy');
  const [timeLimit, setTimeLimit]   = useState(60);

  const settings = [
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '答案 ≤10' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '答案 ≤20' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
    {
      label: '時間限制',
      options: [
        { value: 30, icon: '⚡', text: '30 秒' },
        { value: 60, icon: '🕐', text: '60 秒' },
        { value: 90, icon: '🏆', text: '90 秒' },
      ],
      selected: timeLimit,
      onChange: v => setTimeLimit(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="打地鼠算數"
      icon="🦔"
      settings={settings}
      onStart={() => navigate('/math-mole/play', { state: { difficulty, timeLimit } })}
    />
  );
}
