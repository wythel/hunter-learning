// 遊戲進行中離開就是整局重來,所以 ← 和手機的返回手勢都先問一聲。
// 蓋在整個畫面上(position:fixed):GameLayout 是 overflow:hidden,
// 但它沒有 transform,所以 fixed 不會被它裁掉。
const GOLD = 'linear-gradient(135deg, #FFD400 0%, #FFAA00 60%, #FF8C00 100%)';

export default function ExitConfirm({ onStay, onLeave }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="要離開遊戲嗎？"
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'grid', placeItems: 'center', padding: 20,
        background: 'rgba(4,9,16,0.72)',
        backdropFilter: 'blur(3px)',
        paddingTop: 'max(20px, env(safe-area-inset-top))',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
      }}
    >
      <div style={{
        width: '100%', maxWidth: 320,
        background: 'rgba(10,22,38,0.98)',
        border: '1px solid var(--dex-bezel)',
        borderRadius: 22, padding: '24px 20px 20px',
        boxShadow: '0 18px 60px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.05) inset',
        textAlign: 'center',
        animation: 'dex-pop 0.18s ease-out',
      }}>
        <div aria-hidden="true" style={{ fontSize: 40, lineHeight: 1 }}>🚪</div>

        <div style={{ fontSize: 20, fontWeight: 900, color: '#e6edf3', marginTop: 10 }}>
          要離開遊戲嗎？
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(139,163,190,0.85)', marginTop: 6 }}>
          這一局的進度不會保存
        </div>

        <div style={{ display: 'grid', gap: 10, marginTop: 20 }}>
          <button
            type="button"
            onClick={onStay}
            autoFocus
            style={{
              width: '100%', padding: '15px 0',
              borderRadius: 16, border: 'none',
              background: GOLD, color: '#3A2A00',
              fontSize: 17, fontWeight: 900,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 6px 24px rgba(255,212,0,0.35)',
            }}
          >
            <span aria-hidden="true">🎮 </span>繼續遊戲
          </button>

          <button
            type="button"
            onClick={onLeave}
            style={{
              width: '100%', padding: '13px 0',
              borderRadius: 16,
              border: '1px solid var(--border)',
              background: 'transparent',
              color: 'rgba(139,163,190,0.9)',
              fontSize: 15, fontWeight: 800,
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            <span aria-hidden="true">← </span>離開
          </button>
        </div>
      </div>
    </div>
  );
}
