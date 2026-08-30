import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Slider, Text } from '@mantine/core';
import { AnimatePresence, motion } from 'framer-motion';
import StarField from '../../components/StarField';
import OrbitView from './OrbitView';
import EarthSystem from './EarthSystem';
import SkyView from './SkyView';
import { declinationForSeason, seasonForOrbit, dayInfo } from './geometry';

const DAY_MS = 7000;    // 自轉一圈（一天）
const YEAR_MS = 14000;  // 公轉一圈（一年）

function whereLabel(lat) {
  if (lat >= 89) return '北極';
  if (lat >= 66.5) return '北極圈裡';
  if (lat >= 45) return '很北邊';
  if (lat >= 20) return '中間偏北';
  return '赤道（最中間）';
}

function explain(lat, info) {
  const place = whereLabel(lat);
  if (info.kind === 'polar-day')
    return `你住在「${place}」。太陽整天都不下山！這就是「永晝」☀️ 因為地球斜斜的繞太陽轉，夏天時這裡一直對著太陽，所以天一直亮亮的。`;
  if (info.kind === 'polar-night')
    return `你住在「${place}」。太陽整天都不出來，天一直黑黑的！這就是「永夜」🌙 因為地球斜斜的繞太陽轉，冬天時這裡一直背對太陽，太陽照不到。`;
  const h = Math.round(info.fraction * 24);
  const extra = info.fraction > 0.58 ? '這裡白天比較長。' : info.fraction < 0.42 ? '這裡晚上比較長。' : '白天和晚上差不多長。';
  return `你住在「${place}」。地球轉一圈就是一天，你會經過亮的地方（白天）和暗的地方（晚上）。${extra}（白天大約 ${h} 小時）`;
}

const caption = { color: 'rgba(139,163,190,0.75)', fontWeight: 700, textAlign: 'center', marginBottom: 2 };

export default function PolarDay() {
  const navigate = useNavigate();
  const [latitude, setLatitude] = useState(72);
  const [orbitAngle, setOrbitAngle] = useState(90);  // 90 = 夏至（開場就是永晝）
  const [revolving, setRevolving] = useState(false); // 公轉
  const [spin, setSpin] = useState(0);
  const [spinning, setSpinning] = useState(true);    // 自轉

  const season = seasonForOrbit(orbitAngle);
  const info = dayInfo(latitude, declinationForSeason(season));

  // 自轉（過一天）
  useEffect(() => {
    if (!spinning) return;
    let raf, last;
    const tick = t => {
      if (last != null) setSpin(s => (s + ((t - last) / DAY_MS) * 360) % 360);
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [spinning]);

  // 公轉（過一年）
  useEffect(() => {
    if (!revolving) return;
    let raf, last;
    const tick = t => {
      if (last != null) setOrbitAngle(a => (a + ((t - last) / YEAR_MS) * 360) % 360);
      last = t;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [revolving]);

  const pickSeason = th => { setRevolving(false); setOrbitAngle(th); };

  const special = info.kind !== 'normal';
  const dayH = Math.round(info.fraction * 24);

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '0 16px', paddingTop: 'max(16px, env(safe-area-inset-top))',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom))', position: 'relative',
    }}>
      <StarField />

      <div style={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Back */}
        <button onClick={() => navigate('/')} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'rgba(139,163,190,0.7)', fontSize: 14, fontWeight: 700,
          padding: '4px 0 8px', fontFamily: 'inherit',
        }}>← 大廳</button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            fontSize: 24, fontWeight: 900, letterSpacing: '-0.02em',
            background: 'linear-gradient(120deg,#63e6be,#4dabf7,#b197fc)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>🌍 永晝永夜</div>
          <Text size="sm" style={{ color: 'rgba(139,163,190,0.8)', fontWeight: 600 }}>
            為什麼北極的太陽不下山？
          </Text>
        </div>

        {/* ① 公轉：地球繞太陽 → 現在是哪個季節 */}
        <Text size="xs" style={caption}>🌞 地球繞太陽轉一圈就是一年（點四季看看）</Text>
        <OrbitView orbitAngle={orbitAngle} onPickSeason={pickSeason} />
        <button onClick={() => setRevolving(r => !r)} style={{
          width: '100%', padding: '10px 0', borderRadius: 12, marginTop: 4,
          border: '1.5px solid rgba(255,212,59,0.4)', background: 'rgba(42,38,20,0.9)',
          color: '#ffd43b', fontSize: 15, fontWeight: 900, cursor: 'pointer', fontFamily: 'inherit',
        }}>
          {revolving ? '⏸️ 停在這個季節' : '▶️ 讓地球繞太陽（過一年）'}
        </button>

        {/* ② 放大看這顆地球（側視：左亮右暗） */}
        <Text size="xs" style={{ ...caption, marginTop: 12 }}>🌍 放大看這顆地球：一半白天、一半晚上</Text>
        <EarthSystem latitude={latitude} season={season} spin={spin} />

        {/* ③ 小人抬頭看天空 */}
        <Text size="xs" style={{ ...caption, marginTop: 2 }}>🧍 你抬頭看到的天空</Text>
        <SkyView latitude={latitude} season={season} spin={spin} />

        {/* 白天／晚上長條 */}
        <div style={{ margin: '12px 0 4px' }}>
          <div style={{ display: 'flex', height: 26, borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)' }}>
            <div style={{ width: `${info.fraction * 100}%`, background: 'linear-gradient(90deg,#ffe08a,#ffd23f)', transition: 'width 0.25s' }} />
            <div style={{ width: `${(1 - info.fraction) * 100}%`, background: '#1a2540', transition: 'width 0.25s' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 700, marginTop: 3 }}>
            <span style={{ color: '#ffd43b' }}>☀️ 白天 {dayH} 小時</span>
            <span style={{ color: '#8ba3be' }}>🌙 晚上 {24 - dayH} 小時</span>
          </div>
        </div>

        {/* 慶祝橫幅 */}
        <AnimatePresence>
          {special && (
            <motion.div
              key={info.kind}
              initial={{ opacity: 0, scale: 0.8, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              style={{
                textAlign: 'center', fontSize: 18, fontWeight: 900, padding: '8px 0',
                color: info.kind === 'polar-day' ? '#ffd43b' : '#b8c6ff',
              }}
            >
              {info.kind === 'polar-day' ? '☀️ 永晝！太陽整天不下山' : '🌙 永夜！太陽整天不出來'}
            </motion.div>
          )}
        </AnimatePresence>

        {/* 白話解說 */}
        <div style={{
          background: 'rgba(10,22,38,0.9)', border: '1px solid rgba(26,44,61,0.95)',
          borderRadius: 16, padding: '12px 14px', marginTop: 4,
        }}>
          <Text style={{ fontSize: 14.5, lineHeight: 1.6, color: '#dbe4f2' }}>
            {explain(latitude, info)}
          </Text>
        </div>

        {/* 控制：緯度滑桿 + 自轉 */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <Text size="sm" style={{ color: '#e9edf7', fontWeight: 800, marginBottom: 4 }}>
              🏠 你住在哪裡？
            </Text>
            <Slider
              value={latitude} onChange={setLatitude} min={0} max={90} step={1}
              label={v => whereLabel(v)}
              marks={[{ value: 0, label: '赤道' }, { value: 66.5, label: '北極圈' }, { value: 90, label: '北極' }]}
              color="teal"
            />
          </div>

          <button onClick={() => setSpinning(p => !p)} style={{
            padding: '12px 0', borderRadius: 14, border: '1.5px solid rgba(99,230,190,0.4)',
            background: 'rgba(20,42,38,0.9)', color: '#63e6be', fontSize: 16, fontWeight: 900,
            cursor: 'pointer', fontFamily: 'inherit', marginTop: 4,
          }}>
            {spinning ? '⏸️ 停住這一天' : '▶️ 轉一天（白天→黑夜）'}
          </button>
        </div>
      </div>
    </div>
  );
}
