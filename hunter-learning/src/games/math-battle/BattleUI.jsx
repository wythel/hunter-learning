import { Stack, Text, Grid } from '@mantine/core';

const NUM_LAYOUT = [
  ['7','8','9'],
  ['4','5','6'],
  ['1','2','3'],
  ['back','0','ok'],
];

export default function BattleUI({ question, answer, progress, onKey, locked }) {
  return (
    <div style={{
      background: 'rgba(13, 17, 23, 0.97)',
      borderTop: '1px solid #30363d',
      padding: '12px 16px',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
    }}>
      <Stack gap={8}>
        {/* Progress + Question */}
        <Text size="xs" c="dimmed" ta="center">{progress}</Text>
        <Text
          size="xl"
          fw={800}
          ta="center"
          style={{ color: '#e6edf3', letterSpacing: '0.03em', fontSize: 22 }}
        >
          {question} = {answer === '' ? '_' : answer}
        </Text>

        {/* Numpad */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {NUM_LAYOUT.flat().map(key => (
            <button
              key={key}
              disabled={locked}
              onClick={() => onKey(key)}
              style={{
                height: 50,
                borderRadius: 12,
                border: key === 'ok'
                  ? '2px solid #12b886'
                  : '1px solid #30363d',
                background: key === 'ok'
                  ? 'rgba(18, 184, 134, 0.15)'
                  : key === 'back'
                  ? 'rgba(255, 100, 100, 0.08)'
                  : 'rgba(22, 27, 34, 0.9)',
                color: key === 'ok' ? '#12b886' : key === 'back' ? '#f87171' : '#e6edf3',
                fontSize: key === 'ok' || key === 'back' ? 16 : 22,
                fontWeight: 700,
                cursor: locked ? 'not-allowed' : 'pointer',
                opacity: locked ? 0.6 : 1,
                fontFamily: 'inherit',
                transition: 'background 0.1s',
              }}
            >
              {key === 'back' ? '⌫' : key === 'ok' ? '確定' : key}
            </button>
          ))}
        </div>
      </Stack>
    </div>
  );
}
