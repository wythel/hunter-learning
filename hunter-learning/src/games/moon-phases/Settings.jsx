import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function MoonPhasesSettings() {
  const navigate = useNavigate();
  const [difficulty, setDiff] = useState('easy');
  const [count, setCount]     = useState(8);

  const settings = [
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '新月/半月/滿月' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '再加眉月/凸月' },
      ],
      selected: difficulty,
      onChange: setDiff,
    },
    {
      label: '題數',
      options: [
        { value: 5,  icon: '⚡', text: '5 題'  },
        { value: 8,  icon: '📚', text: '8 題'  },
        { value: 10, icon: '🏆', text: '10 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="月相星球"
      icon="🌙"
      settings={settings}
      onStart={() => navigate('/moon-phases/play', { state: { difficulty, count } })}
    />
  );
}
