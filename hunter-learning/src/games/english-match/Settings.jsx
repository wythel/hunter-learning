import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function EnglishSettings() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('animals');
  const [count, setCount] = useState(10);

  const settings = [
    {
      label: '主題',
      options: [
        { value: 'animals', icon: '🐾', text: '動物' },
        { value: 'fruits',  icon: '🍎', text: '水果' },
        { value: 'colors',  icon: '🎨', text: '顏色' },
        { value: 'body',    icon: '🤚', text: '身體' },
        { value: 'mix',     icon: '🔀', text: '混合' },
      ],
      selected: topic,
      onChange: setTopic,
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
      title="英文單字配對"
      icon="🔤"
      settings={settings}
      onStart={() => navigate('/english-match/play', { state: { topic, count } })}
    />
  );
}
