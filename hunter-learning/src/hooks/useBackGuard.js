import { useEffect, useRef } from 'react';

// 手機的返回手勢很容易誤觸,遊戲進行中被 pop 掉,整局進度就沒了。
//
// 作法:進遊戲時往 history 疊一個「哨兵」entry —— 複製當下 router 寫的 state
// (usr / key / idx)再蓋上一個標記,**網址一個字都不改**。HashRouter 只看 hash,
// 所以 router 完全不會察覺;而返回手勢會先吃掉哨兵,我們攔到 popstate,
// 補回哨兵並通知呼叫端跳確認框。
export const GUARD_KEY = '__dexBackGuard';

function isArmed() {
  return Boolean(window.history.state?.[GUARD_KEY]);
}

// pushState 只給兩個參數:第三個 url 省略才代表「沿用目前網址」。
// 傳空字串反而會被當成相對網址解析,把 hash 洗掉。
function arm() {
  if (isArmed()) return;
  window.history.pushState({ ...window.history.state, [GUARD_KEY]: true }, '');
}

// 遊戲結束改渲染結算畫面時,哨兵還留在 history 上,不清掉的話小朋友在結算畫面
// 第一次滑返回會「沒反應」。先同步抹掉標記再退一步 —— 標記是同步消失的,
// 所以 StrictMode 讓 effect 跑兩次時,第二次就是 no-op。
export function releaseBackGuard() {
  if (!isArmed()) return;
  const restored = { ...window.history.state };
  delete restored[GUARD_KEY];
  window.history.replaceState(restored, '');
  window.history.back();
}

export function useBackGuard(onIntercept) {
  const handler = useRef(onIntercept);
  useEffect(() => { handler.current = onIntercept; });

  useEffect(() => {
    arm();
    function onPop() {
      arm();
      handler.current();
    }
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
}
