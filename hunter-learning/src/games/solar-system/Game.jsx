import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Text, Button } from '@mantine/core';
import { Reorder, motion } from 'framer-motion';
import StarField from '../../components/StarField';
import ResultScreen from '../../components/ResultScreen';
import Planet from './Planet';
import { useGame } from './useGame';
import { PLANETS, planetByKey } from './data';
import { useSpeech } from '../../hooks/useSpeech';

function ChoiceButton({ planetKey, disabled, onClick }) {
  const p = planetByKey(planetKey);
  return (
    <Button size="lg" radius="lg" disabled={disabled} onClick={onClick}
      style={{ height: 'auto', padding: '10px 6px', background: 'rgba(30,42,64,0.9)',
        border: '1.5px solid rgba(255,169,77,0.4)', color: '#e9edf7' }}>
      <span style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.15 }}>
        <span style={{ fontWeight: 800, fontSize: 19 }}>{p.name}</span>
        <span style={{ fontSize: 11, color: 'rgba(180,195,215,0.7)' }}>{p.en}</span>
      </span>
    </Button>
  );
}

// ── 探索模式：點行星唸名字 + 顯示特徵卡 ──
function Explore({ onStart }) {
  const speak = useSpeech();
  const [picked, setPicked] = useState('earth');
  const p = planetByKey(picked);
  return (
    <>
      <Text style={{ fontSize: 17, fontWeight: 800, color: '#e9edf7', textAlign: 'center' }}>
        點行星認識太陽系！
      </Text>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10, margin: '14px 0' }}>
        {PLANETS.map(pl => (
          <button key={pl.key} onClick={() => { setPicked(pl.key); speak(pl.name, 'zh-TW'); }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <Planet planetKey={pl.key} size={pl.key === picked ? 58 : 46} />
          </button>
        ))}
      </div>
      <div style={{ textAlign: 'center', minHeight: 70 }}>
        <div style={{ fontSize: 22, fontWeight: 900, color: '#ffd8a8' }}>{p.name} <span style={{ fontSize: 14, color: 'rgba(180,195,215,0.7)' }}>{p.en}</span></div>
        <div style={{ fontSize: 15, color: 'rgba(210,220,235,0.85)', marginTop: 4 }}>{p.feature}</div>
      </div>
      <div style={{ marginTop: 'auto', width: '100%', maxWidth: 360 }}>
        <Button size="lg" radius="xl" fullWidth onClick={onStart}
          style={{ background: 'linear-gradient(135deg,#ffb066,#ff8c42)', fontWeight: 900 }}>
          準備好了，開始挑戰！
        </Button>
      </div>
    </>
  );
}

// ── 排序題（gap = 拖候選入缺口；full = Reorder 拖曳重排）──
function OrderChallenge({ challenge, disabled, onSubmit }) {
  const [arr, setArr] = useState(challenge.initial);
  const slotRefs = useRef([]);
  useEffect(() => { setArr(challenge.initial); }, [challenge]);

  if (challenge.mode === 'full') {
    return (
      <div style={{ width: '100%', maxWidth: 380 }}>
        <Reorder.Group axis="x" values={arr} onReorder={setArr}
          style={{ display: 'flex', justifyContent: 'center', gap: 6, listStyle: 'none', padding: 0, flexWrap: 'wrap' }}>
          {arr.map(key => (
            <Reorder.Item key={key} value={key} style={{ cursor: 'grab' }}>
              <Planet planetKey={key} size={40} />
            </Reorder.Item>
          ))}
        </Reorder.Group>
        <Button mt={14} size="lg" radius="xl" fullWidth disabled={disabled} onClick={() => onSubmit(arr)}
          style={{ background: 'linear-gradient(135deg,#ffb066,#ff8c42)', fontWeight: 900 }}>
          確認順序
        </Button>
      </div>
    );
  }

  // gap 模式：拖 tray 候選命中缺口即填入並自動判定
  function handleDrop(key, info) {
    const el = slotRefs.current[challenge.gapIndex];
    if (!el) return;
    const r = el.getBoundingClientRect();
    const { x, y } = info.point;
    if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
      const filled = arr.map((k, i) => (i === challenge.gapIndex ? key : k));
      setArr(filled);
      onSubmit(filled);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 380 }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 5, flexWrap: 'wrap' }}>
        {arr.map((key, i) => (
          <div key={i} ref={el => (slotRefs.current[i] = el)}
            style={{ width: 40, height: 40, borderRadius: '50%',
              border: key ? 'none' : '2px dashed rgba(255,169,77,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {key && <Planet planetKey={key} size={40} />}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 18 }}>
        {challenge.tray.map(key => (
          <MotionOrb key={key} planetKey={key} disabled={disabled} onDrop={info => handleDrop(key, info)} />
        ))}
      </div>
    </div>
  );
}

function MotionOrb({ planetKey, disabled, onDrop }) {
  // 用 framer-motion drag；放開回饋 onDragEnd 的座標給父層判定命中
  return (
    <motion.div drag={!disabled} dragSnapToOrigin
      onDragEnd={(e, info) => onDrop(info)}
      style={{ cursor: 'grab', touchAction: 'none' }}>
      <Planet planetKey={planetKey} size={44} />
    </motion.div>
  );
}

export default function SolarSystemGame() {
  const location = useLocation();
  const navigate = useNavigate();
  const { difficulty = 'easy', count = 9 } = location.state || {};
  const g = useGame({ difficulty, count });

  if (g.phase === 'result') {
    return (
      <ResultScreen
        title={g.title}
        stars={g.stars}
        stats={[
          { icon: '✅', label: '答對', value: `${g.stats.correct} 題` },
          { icon: '❌', label: '答錯', value: `${g.stats.wrong} 題` },
          { icon: '⏱️', label: '時間', value: `${g.elapsedSec} 秒` },
        ]}
        onRetry={() => navigate('/solar-system/play', { state: { difficulty, count } })}
        onMenu={() => navigate('/solar-system')}
        onLobby={() => navigate('/')}
      />
    );
  }

  const c = g.challenge;
  const banner = g.phase === 'explore' ? ''
    : c?.kind === 'identify' ? '這是哪一顆行星？'
    : c?.kind === 'feature'  ? '哪一顆行星是這樣的？'
    : difficulty === 'hard'  ? '把行星依離太陽的順序排好！'
    : '把正確的行星拖進空格！';

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <StarField />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '16px', paddingTop: 'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))', position: 'relative', zIndex: 1 }}>

        {g.phase === 'explore' && <Explore onStart={g.startChallenge} />}

        {g.phase === 'playing' && c && (
          <>
            <div style={{ textAlign: 'center', minHeight: 48, marginBottom: 8 }}>
              <Text size="sm" style={{ color: 'rgba(139,163,190,0.8)', fontWeight: 700 }}>
                第 {g.currentQ + 1} / {count} 題
              </Text>
              <Text style={{ fontSize: 17, fontWeight: 800, color: '#e9edf7' }}>{banner}</Text>
            </div>

            {/* 題幹 */}
            {c.kind === 'identify' && (
              <div style={{ margin: '6px 0 14px' }}><Planet planetKey={c.targetKey} size={110} /></div>
            )}
            {c.kind === 'feature' && (
              <div style={{ margin: '10px 0 18px', padding: '16px 22px', borderRadius: 18,
                background: 'rgba(30,42,64,0.8)', border: '1.5px solid rgba(255,169,77,0.35)',
                fontSize: 22, fontWeight: 900, color: '#ffd8a8', textAlign: 'center' }}>
                {c.prompt}
              </div>
            )}

            {/* 作答區 */}
            {(c.kind === 'identify' || c.kind === 'feature') && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, width: '100%', maxWidth: 340 }}>
                {c.choices.map(key => (
                  <ChoiceButton key={key} planetKey={key} disabled={!!g.feedback}
                    onClick={() => g.handleChoose(key)} />
                ))}
              </div>
            )}
            {c.kind === 'order' && (
              <OrderChallenge challenge={c} disabled={!!g.feedback} onSubmit={g.submitOrder} />
            )}

            {/* 回饋 */}
            {g.feedback && (
              <Text style={{ fontSize: 20, fontWeight: 900, marginTop: 12,
                color: g.feedback.correct ? '#51cf66' : '#ff6b6b' }}>
                {g.feedback.correct ? '答對了！🎉' : '再想想～'}
              </Text>
            )}
          </>
        )}
      </div>
    </div>
  );
}
