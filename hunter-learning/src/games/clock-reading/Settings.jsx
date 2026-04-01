import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function ClockSettings() {
  const navigate = useNavigate();
  const [mode, setMode]         = useState('read');
  const [difficulty, setDiff]   = useState('hour');
  const [count, setCount]       = useState(10);

  const settings = [
    {
      label: '模式',
      options: [
        { value: 'read', icon: '👁️', text: '閱讀模式', sub: '選出正確時間' },
        { value: 'set',  icon: '✋', text: '設定模式', sub: '撥出正確時間' },
      ],
      selected: mode,
      onChange: setMode,
    },
    {
      label: '難度',
      options: [
        { value: 'hour',    icon: '🕐', text: '整點',   sub: ':00' },
        { value: 'half',    icon: '🕧', text: '半點',   sub: ':30' },
        { value: 'precise', icon: '⏱️', text: '5分鐘', sub: ':05~:55' },
      ],
      selected: difficulty,
      onChange: setDiff,
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
      title="學看時鐘"
      icon="🕐"
      settings={settings}
      onStart={() => navigate('/clock-reading/play', { state: { mode, difficulty, count } })}
    />
  );
}
