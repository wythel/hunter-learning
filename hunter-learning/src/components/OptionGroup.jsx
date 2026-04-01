import { Stack, Text, Group } from '@mantine/core';

export default function OptionGroup({ label, options, selected, onChange }) {
  return (
    <Stack gap={8}>
      <Text size="sm" fw={600} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.05em' }}>
        {label}
      </Text>
      <Group gap={8}>
        {options.map(opt => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onChange(opt.value)}
              style={{
                flex: 1,
                minWidth: 0,
                padding: '10px 8px',
                borderRadius: 12,
                border: isSelected
                  ? '2px solid #12b886'
                  : '2px solid rgba(48, 54, 61, 0.8)',
                background: isSelected
                  ? 'rgba(18, 184, 134, 0.12)'
                  : 'rgba(22, 27, 34, 0.8)',
                color: isSelected ? '#12b886' : '#8b949e',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                transition: 'all 0.15s ease',
                fontFamily: 'inherit',
              }}
            >
              {opt.icon && (
                <span style={{ fontSize: 22 }}>{opt.icon}</span>
              )}
              <Text size="sm" fw={isSelected ? 700 : 500} style={{ color: 'inherit' }}>
                {opt.text}
              </Text>
              {opt.sub && (
                <Text size="xs" style={{ color: isSelected ? 'rgba(18,184,134,0.7)' : '#6e7681' }}>
                  {opt.sub}
                </Text>
              )}
            </button>
          );
        })}
      </Group>
    </Stack>
  );
}
