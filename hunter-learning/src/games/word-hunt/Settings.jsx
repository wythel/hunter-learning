import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';
import { TIMED_SETTING } from '../../utils/timedSetting';

export default function WordHuntSettings() {
  const navigate = useNavigate();
  const [mode, setMode]   = useState('en');
  const [count, setCount] = useState(10);
  const [timed, setTimed] = useState(false);

  const settings = [
    {
      label: '語言',
      options: [
        { value: 'en', icon: '🔤', text: 'English', sub: '英文單字' },
        { value: 'zh', icon: '🀄', text: '中文',    sub: '國字認讀' },
      ],
      selected: mode,
      onChange: setMode,
    },
    {
      label: '題數',
      options: [
        { value: 5,  icon: '⚡', text: '5 題'  },
        { value: 10, icon: '📚', text: '10 題' },
        { value: 15, icon: '🏆', text: '15 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
    { ...TIMED_SETTING, selected: timed, onChange: setTimed },
  ];

  return (
    <SettingsPage
      title="看圖認字"
      icon="🔡"
      settings={settings}
      onStart={() => navigate('/word-hunt/play', { state: { mode, count, timed } })}
    />
  );
}
