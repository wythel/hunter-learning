import { motion, AnimatePresence } from 'framer-motion';
import { Group, Text, Progress } from '@mantine/core';

export default function BattleField({
  monsterSvg, monsterName,
  playerSvg, playerHP,
  monsterFlash, playerFlash,
  playerAttacking, monsterAttacking,
}) {
  const hearts = [0, 1, 2].map(i => i < playerHP ? '❤️' : '🖤');

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Sky */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(180deg, #7EC8E3 0%, #a8dff0 100%)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '12px 20px 0',
        position: 'relative',
      }}>
        {/* Player side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <Group gap={4}>
            {hearts.map((h, i) => (
              <Text key={i} style={{ fontSize: 20 }}>{h}</Text>
            ))}
          </Group>
          <motion.div
            animate={
              playerAttacking
                ? { x: [0, 60, 0] }
                : playerFlash
                ? { x: [0, -8, 8, -6, 6, 0], opacity: [1, 0.3, 1, 0.3, 1] }
                : {}
            }
            transition={{ duration: 0.45 }}
            dangerouslySetInnerHTML={{ __html: playerSvg }}
          />
        </div>

        {/* Monster side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <Text size="xs" fw={700} c="dark.8">{monsterName}</Text>
          <motion.div
            animate={
              monsterFlash
                ? { opacity: [1, 0, 1, 0, 1], filter: ['none', 'brightness(3) saturate(0)', 'none'] }
                : monsterAttacking
                ? { x: [0, -50, 0] }
                : {}
            }
            transition={{ duration: 0.45 }}
            dangerouslySetInnerHTML={{ __html: monsterSvg }}
          />
        </div>
      </div>

      {/* Ground */}
      <div style={{
        height: 32,
        background: 'linear-gradient(180deg, #5E9E3D 0%, #4a8030 100%)',
        borderTop: '3px solid #3d6e25',
      }} />
    </div>
  );
}
