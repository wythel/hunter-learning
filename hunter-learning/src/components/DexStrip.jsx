import { useState } from 'react';
import ExitConfirm from './ExitConfirm';
import { useBackGuard } from '../hooks/useBackGuard';

// 圖鑑機外殼的收合版:遊戲進行中只留這條 26px 頂條,
// 保留鏡頭與三顆燈號當作主題延續,同時提供返回與進度。
const LEDS = ['var(--led-red)', 'var(--led-yellow)', 'var(--led-green)'];

export default function DexStrip({ onBack, progress, right }) {
  // DexStrip 只在遊戲進行中出現(結算走 ResultScreen),正好就是該擋返回的區間。
  // 掛在這裡,15 個 Game.jsx 一行都不用改。
  const [asking, setAsking] = useState(false);
  useBackGuard(() => setAsking(true));

  return (
    <>
    <div style={{
      height: 26, flex: 'none',
      background: 'var(--dex-red)',
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '0 10px',
    }}>
      <button
        type="button"
        onClick={() => setAsking(true)}
        aria-label="返回"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          alignSelf: 'stretch',
          background: 'none', border: 'none', padding: '0 10px 0 0',
          cursor: 'pointer', fontFamily: 'inherit',
        }}
      >
        <span aria-hidden="true" style={{ fontSize: 15, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
          ←
        </span>
        <span
          data-dex="lens"
          style={{
            width: 14, height: 14, borderRadius: '50%', display: 'block',
            background: 'radial-gradient(circle at 32% 30%, #bfe9ff, #1a76d2 60%, #0b3c78)',
            border: '1.5px solid #f2f2f2',
          }}
        />
        {LEDS.map((c, i) => (
          <span
            key={i}
            data-dex="led"
            style={{
              width: 6, height: 6, borderRadius: '50%', display: 'block',
              background: c, border: '1px solid rgba(0,0,0,0.25)',
            }}
          />
        ))}
      </button>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        {progress && (
          <span style={{ flex: 'none', fontSize: 11, fontWeight: 900, color: 'rgba(255,255,255,0.9)' }}>
            {progress}
          </span>
        )}
        {right && (
          // 給 right 一個定寬 flex-basis:right 目前只放 TimeBar,它靠子元素的 width:百分比
          // 撐開自己,放進 flex row 若沒有 definite width 可依附,百分比會算成 0
          // (0px 寬的計時條)。flex:'none' + width 讓它有真正的寬度,又不會擠壓 progress 文字。
          <div style={{ flex: 'none', width: 72 }}>
            {right}
          </div>
        )}
      </div>
    </div>
    {asking && <ExitConfirm onStay={() => setAsking(false)} onLeave={onBack} />}
    </>
  );
}
