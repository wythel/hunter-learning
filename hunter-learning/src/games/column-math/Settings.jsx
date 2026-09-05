import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';
import { TIMED_SETTING } from '../../utils/timedSetting';
import { COLUMN_TIMED_SECONDS } from './useGame';

// 直式一格一格填,限時比共用的 10 秒寬裕
const COLUMN_TIMED = {
  ...TIMED_SETTING,
  options: TIMED_SETTING.options.map(o =>
    o.value ? { ...o, sub: `每題 ${COLUMN_TIMED_SECONDS} 秒` } : o
  ),
};

export default function ColumnMathSettings() {
  const navigate = useNavigate();
  const [operation, setOperation] = useState('add');
  const [digits, setDigits] = useState(2);
  const [difficulty, setDifficulty] = useState('easy');
  const [timed, setTimed] = useState(false);
  const [count, setCount] = useState(10);

  const settings = [
    {
      label: '運算',
      options: [
        { value: 'add', icon: '➕', text: '加法' },
        { value: 'sub', icon: '➖', text: '減法' },
        { value: 'mix', icon: '🔀', text: '混合' },
      ],
      selected: operation,
      onChange: setOperation,
    },
    {
      label: '位數',
      options: [
        { value: 2, icon: '2️⃣', text: '二位數' },
        { value: 3, icon: '3️⃣', text: '三位數' },
      ],
      selected: digits,
      onChange: v => setDigits(Number(v)),
    },
    {
      label: '難度',
      options: [
        { value: 'easy', icon: '🌱', text: '簡單', sub: '不進退位' },
        { value: 'hard', icon: '🔥', text: '困難', sub: '有進退位' },
      ],
      selected: difficulty,
      onChange: setDifficulty,
    },
    { ...COLUMN_TIMED, selected: timed, onChange: setTimed },
    {
      label: '題數',
      options: [
        { value: 5,  icon: '⚡', text: '5 題' },
        { value: 10, icon: '⚔️', text: '10 題' },
        { value: 20, icon: '🏆', text: '20 題' },
      ],
      selected: count,
      onChange: v => setCount(Number(v)),
    },
  ];

  return (
    <SettingsPage
      title="直式計算"
      icon="🧮"
      settings={settings}
      onStart={() => navigate('/column-math/play', { state: { operation, digits, difficulty, count, timed } })}
    />
  );
}
