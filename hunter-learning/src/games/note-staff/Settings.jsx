import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SettingsPage from '../../components/SettingsPage';

export default function NoteStaffSettings() {
  const navigate = useNavigate();
  const [clefMode,   setClefMode]   = useState('treble');
  const [answerMode, setAnswerMode] = useState('name');
  const [noteCount,  setNoteCount]  = useState(1);

  const settings = [
    {
      label: '譜號',
      options: [
        { value: 'treble', icon: '𝄞', text: '高音譜',  sub: 'G clef' },
        { value: 'bass',   icon: '𝄢', text: '低音譜',  sub: 'F clef' },
        { value: 'mixed',  icon: '🎼', text: '混合',    sub: '兩種' },
      ],
      selected: clefMode,
      onChange: setClefMode,
    },
    {
      label: '作答方式',
      options: [
        { value: 'name',  icon: '🔤', text: '選音名',    sub: 'Do-Ti' },
        { value: 'piano', icon: '🎹', text: '點鋼琴鍵', sub: '找位置' },
      ],
      selected: answerMode,
      onChange: setAnswerMode,
    },
    {
      label: '一題幾個音符',
      options: [
        { value: 1, icon: '🎵', text: '1 個',  sub: '單音' },
        { value: 3, icon: '🎶', text: '3 個',  sub: '挑戰' },
      ],
      selected: noteCount,
      onChange: setNoteCount,
    },
  ];

  return (
    <SettingsPage
      title="音符星球"
      icon="🎼"
      settings={settings}
      onStart={() => navigate('/note-staff/play', { state: { clefMode, answerMode, noteCount } })}
    />
  );
}
