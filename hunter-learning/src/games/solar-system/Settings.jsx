import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function SolarSystemSettings() {
  const navigate = useNavigate();
  const [difficulty, setDiff] = useState('easy');
  const [count, setCount]     = useState(9);

  const settings = [
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '插缺口·好排除' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '完整排序·干擾相近' },
      ],
      selected: difficulty,
      onChange: setDiff,
    },
    {
      label: '題數',
      options: [
        { value: 6,  icon: '⚡', text: '6 題'  },
        { value: 9,  icon: '📚', text: '9 題'  },
        { value: 12, icon: '🏆', text: '12 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="太陽系"
      icon="🪐"
      settings={settings}
      onStart={() => navigate('/solar-system/play', { state: { difficulty, count } })}
    />
  );
}
