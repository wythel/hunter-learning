// 圖鑑機外殼:上蓋(鏡頭 + 三顆燈號 + 編號)、內凹螢幕、下方按鈕列。
// 純視覺,無狀態。包住大廳/設定/結果三種外殼畫面。
const LEDS = ['var(--led-red)', 'var(--led-yellow)', 'var(--led-green)'];

export default function DexFrame({ children, dexNo }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--dex-red)',
      padding: '10px 9px',
      paddingTop: 'max(10px, env(safe-area-inset-top))',
      paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* 上蓋 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px 10px', flex: 'none' }}>
        <div
          data-dex="lens"
          style={{
            width: 30, height: 30, borderRadius: '50%', flex: 'none',
            background: 'radial-gradient(circle at 32% 30%, #bfe9ff, #1a76d2 60%, #0b3c78)',
            border: '3px solid #f2f2f2',
            boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}
        />
        {LEDS.map((c, i) => (
          <div
            key={i}
            data-dex="led"
            style={{
              width: 10, height: 10, borderRadius: '50%', flex: 'none',
              background: c, border: '1px solid rgba(0,0,0,0.25)',
            }}
          />
        ))}
        {dexNo && (
          <div style={{
            marginLeft: 'auto', fontSize: 12, fontWeight: 900,
            color: 'rgba(255,255,255,0.85)', letterSpacing: '0.5px',
          }}>
            {dexNo}
          </div>
        )}
      </div>

      {/* 內凹螢幕 */}
      <div style={{
        flex: 1,
        background: 'var(--dex-screen)',
        border: '1px solid var(--dex-bezel)',
        borderRadius: 16,
        boxShadow: 'inset 0 3px 12px rgba(0,0,0,0.5), 0 -2px 0 rgba(255,255,255,0.18)',
        overflow: 'hidden',
        position: 'relative',
      }}>
        {children}
      </div>

      {/* 下方按鈕列 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 4px 0', flex: 'none' }}>
        <div style={{ width: 18, height: 18, borderRadius: 4, background: '#1F6FD0', boxShadow: '0 2px 0 rgba(0,0,0,0.3)' }} />
        <div style={{ width: 18, height: 18, borderRadius: 4, background: '#C8102E', boxShadow: '0 2px 0 rgba(0,0,0,0.3)' }} />
        <div style={{ marginLeft: 'auto', width: 52, height: 10, borderRadius: 5, background: 'rgba(0,0,0,0.28)' }} />
      </div>
    </div>
  );
}
