import { useNavigate } from 'react-router-dom';
import { Title, Text, SimpleGrid, Card, Stack, Group } from '@mantine/core';
import { motion } from 'framer-motion';
import StarField from '../components/StarField';

const GAMES = [
  { path: '/math-battle',   icon: '⚔️',  title: '算數大戰',     desc: '答對題目，打敗怪物！' },
  { path: '/chain-math',    icon: '➕',  title: '連鎖算數大戰', desc: '三個數字連續計算！' },
  { path: '/clock-reading', icon: '🕐',  title: '學看時鐘',     desc: '認識指針時鐘與數字時鐘' },
  { path: '/english-match', icon: '🔤',  title: '英文單字配對', desc: '看中文選英文，輕鬆記單字' },
  { path: '/memory-flip',   icon: '🃏',  title: '記憶翻牌',     desc: '找出所有配對，考驗記憶力' },
  { path: '/math-mole',     icon: '🦔',  title: '打地鼠算數',   desc: '打中正確答案的地鼠！' },
  { path: '/symmetry',      icon: '🪞',  title: '對稱遊戲',     desc: '學習對稱與對稱軸！' },
  { path: '/odd-even',      icon: '🔢',  title: '奇偶小偵探',   desc: '學習奇數和偶數！' },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

export default function Lobby() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '32px 20px 40px',
      paddingTop: 'max(32px, env(safe-area-inset-top))',
      paddingBottom: 'max(40px, env(safe-area-inset-bottom))',
      position: 'relative',
    }}>
      <StarField />

      <div style={{ width: '100%', maxWidth: 480, position: 'relative', zIndex: 1 }}>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Stack gap={4} align="center" mb={32}>
            <Text style={{ fontSize: 56 }}>🎮</Text>
            <Title
              order={1}
              style={{
                background: 'linear-gradient(135deg, #12b886 0%, #0dcfaa 50%, #4af7d0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: 28,
                fontWeight: 900,
                letterSpacing: '0.05em',
                textShadow: 'none',
              }}
            >
              Hunter 學習遊戲
            </Title>
            <Text size="sm" c="dimmed">選一個遊戲開始吧！</Text>
          </Stack>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
        >
          <Stack gap={12}>
            {GAMES.map(g => (
              <motion.div key={g.path} variants={item}>
                <motion.div
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(g.path)}
                  style={{ cursor: 'pointer' }}
                >
                  <Card
                    style={{
                      background: 'rgba(22, 27, 34, 0.85)',
                      border: '1.5px solid rgba(48, 54, 61, 0.8)',
                      backdropFilter: 'blur(8px)',
                      transition: 'border-color 0.15s, box-shadow 0.15s',
                    }}
                    padding="lg"
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(18, 184, 134, 0.5)';
                      e.currentTarget.style.boxShadow  = '0 6px 24px rgba(18, 184, 134, 0.12)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'rgba(48, 54, 61, 0.8)';
                      e.currentTarget.style.boxShadow  = 'none';
                    }}
                  >
                    <Group gap={16} wrap="nowrap">
                      <Text style={{ fontSize: 40, flexShrink: 0 }}>{g.icon}</Text>
                      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                        <Text fw={800} size="lg" c="gray.1">{g.title}</Text>
                        <Text size="sm" c="dimmed">{g.desc}</Text>
                      </Stack>
                      <Text size="xl" c="teal.6" style={{ flexShrink: 0 }}>›</Text>
                    </Group>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </Stack>
        </motion.div>
      </div>
    </div>
  );
}
