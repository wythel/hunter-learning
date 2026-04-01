import { Stack, Title, Text, Button, Card } from '@mantine/core';
import { motion } from 'framer-motion';
import StarField from './StarField';
import OptionGroup from './OptionGroup';

export default function SettingsPage({ title, icon, settings, onStart }) {
  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 20px',
      paddingTop: 'max(24px, env(safe-area-inset-top))',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      position: 'relative',
    }}>
      <StarField />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 440, position: 'relative', zIndex: 1 }}
      >
        <Stack gap={20}>
          {/* Header */}
          <Stack gap={4} align="center">
            <Text style={{ fontSize: 52 }}>{icon}</Text>
            <Title order={2} style={{
              background: 'linear-gradient(135deg, #12b886, #0dcfaa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: 26,
              fontWeight: 900,
            }}>
              {title}
            </Title>
          </Stack>

          {/* Settings card */}
          <Card
            style={{
              background: 'rgba(22, 27, 34, 0.95)',
              border: '1px solid rgba(48, 54, 61, 0.8)',
              backdropFilter: 'blur(8px)',
            }}
            padding="xl"
          >
            <Stack gap={20}>
              {settings.map((s, i) => (
                <OptionGroup key={i} {...s} />
              ))}
            </Stack>
          </Card>

          <Button
            size="lg"
            fullWidth
            onClick={onStart}
            style={{
              background: 'linear-gradient(135deg, #12b886, #0ca678)',
              border: 'none',
              height: 56,
              fontSize: 18,
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(18, 184, 134, 0.35)',
            }}
          >
            開始遊戲！
          </Button>
        </Stack>
      </motion.div>
    </div>
  );
}
