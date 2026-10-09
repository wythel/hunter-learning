import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function SentenceListenSettings() {
  const navigate = useNavigate();
  const [count, setCount]           = useState(10);
  const [difficulty, setDifficulty] = useState('easy');

  const settings = [
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '3–4 個字' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '5–6 字＋干擾字' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
    {
      label: '題數',
      options: [
        { value: 5,  icon: '⚡', text: '5 題' },
        { value: 10, icon: '📚', text: '10 題' },
        { value: 15, icon: '🏆', text: '15 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="英文聽句"
      icon="👂"
      settings={settings}
      onStart={() => navigate('/sentence-listen/play', { state: { count, difficulty } })}
    />
  );
}
