import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';
import { TIMED_SETTING } from '../../utils/timedSetting';

export default function MakeTenSettings() {
  const navigate = useNavigate();
  const [mode,  setMode]  = useState('choose');
  const [count, setCount] = useState(8);
  const [timed, setTimed] = useState(false);

  const countOptions = mode === 'choose'
    ? [
        { value: 8,  icon: '⚡', text: '8題',  sub: '輕鬆' },
        { value: 15, icon: '🔥', text: '15題', sub: '挑戰' },
      ]
    : [
        { value: 4,  icon: '⚡', text: '4對',  sub: '輕鬆' },
        { value: 8,  icon: '🔥', text: '8對',  sub: '挑戰' },
      ];

  function handleModeChange(m) {
    setMode(m);
    setCount(m === 'choose' ? 8 : 4);
  }

  const settings = [
    {
      label: '遊戲模式',
      options: [
        { value: 'choose', icon: '🎯', text: '選答案', sub: '4選1' },
        { value: 'match',  icon: '🔗', text: '配對',  sub: '找夥伴' },
      ],
      selected: mode,
      onChange: handleModeChange,
    },
    // 配對模式不支援限時,隱藏此列
    ...(mode === 'choose'
      ? [{ ...TIMED_SETTING, selected: timed, onChange: setTimed }]
      : []),
    {
      label: mode === 'choose' ? '題數' : '對數',
      options: countOptions,
      selected: count,
      onChange: setCount,
    },
  ];

  return (
    <SettingsPage
      title="湊十大師"
      icon="🔟"
      settings={settings}
      onStart={() => navigate('/make-ten/play', {
        state: { mode, count, timed: mode === 'choose' ? timed : false },
      })}
    />
  );
}
