import { Stack, Title, Text, Button, Card, Group } from '@mantine/core';
import { motion } from 'framer-motion';
import StarField from './StarField';

const starVariants = {
  hidden: { scale: 0, rotate: -30, opacity: 0 },
  visible: i => ({
    scale: 1, rotate: 0, opacity: 1,
    transition: { delay: 0.3 + i * 0.18, type: 'spring', stiffness: 400, damping: 15 },
  }),
};

export default function ResultScreen({ title, stars, stats, onRetry, onMenu, onLobby }) {
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
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}
      >
        <Card
          style={{
            background: 'rgba(22, 27, 34, 0.95)',
            border: '1px solid rgba(48, 54, 61, 0.8)',
            backdropFilter: 'blur(8px)',
          }}
          padding="xl"
        >
          <Stack gap={20} align="center">
            <Title
              order={2}
              style={{
                color: '#e6edf3',
                fontSize: 26,
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              {title}
            </Title>

            {/* Stars */}
            <Group gap={8}>
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={starVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ fontSize: 44 }}
                >
                  {i < stars ? '⭐' : '☆'}
                </motion.span>
              ))}
            </Group>

            {/* Stats */}
            <Stack gap={10} style={{ width: '100%' }}>
              {stats.map((s, i) => (
                <Group
                  key={i}
                  justify="space-between"
                  style={{
                    background: 'rgba(48, 54, 61, 0.4)',
                    borderRadius: 10,
                    padding: '10px 16px',
                  }}
                >
                  <Group gap={8}>
                    <Text style={{ fontSize: 18 }}>{s.icon}</Text>
                    <Text size="sm" c="dimmed">{s.label}</Text>
                  </Group>
                  <Text fw={700} c="teal.4">{s.value}</Text>
                </Group>
              ))}
            </Stack>

            {/* Buttons */}
            <Stack gap={10} style={{ width: '100%' }}>
              <Button
                size="md"
                fullWidth
                onClick={onRetry}
                style={{
                  background: 'linear-gradient(135deg, #12b886, #0ca678)',
                  border: 'none',
                  fontWeight: 700,
                }}
              >
                再玩一次
              </Button>
              <Group grow gap={10}>
                <Button
                  size="md"
                  variant="outline"
                  color="teal"
                  onClick={onMenu}
                >
                  設定
                </Button>
                <Button
                  size="md"
                  variant="outline"
                  color="gray"
                  onClick={onLobby}
                >
                  大廳
                </Button>
              </Group>
            </Stack>
          </Stack>
        </Card>
      </motion.div>
    </div>
  );
}
