import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function SymmetrySettings() {
  const navigate = useNavigate();
  const [mode,       setMode]       = useState('mode1');
  const [difficulty, setDifficulty] = useState('easy');
  const [count,      setCount]      = useState(5);

  const settings = [
    {
      label: '遊戲模式',
      options: [
        { value: 'mode1', icon: '👁️', text: '辨識', sub: '哪個有對稱軸？' },
        { value: 'mode2', icon: '✏️', text: '繪製', sub: '完成對稱圖形' },
      ],
      selected: mode,
      onChange: setMode,
    },
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '⭐', text: '簡單' },
        { value: 'hard', icon: '🔥', text: '困難' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
    {
      label: '題數',
      options: [
        { value: 5,  icon: '⚡', text: '5 題' },
        { value: 10, icon: '📚', text: '10 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="對稱遊戲"
      icon="🪞"
      settings={settings}
      onStart={() => navigate('/symmetry/play', { state: { mode, difficulty, count } })}
    />
  );
}
