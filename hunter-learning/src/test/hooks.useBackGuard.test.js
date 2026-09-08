import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useBackGuard, releaseBackGuard, GUARD_KEY } from '../hooks/useBackGuard';

// react-router 會在自己的 history entry 上放 { usr, key, idx },哨兵必須原封不動帶著走,
// 否則 router 算不出 pop 的 delta。每個測試都從一個「像 router 剛寫過」的 entry 開始。
beforeEach(() => {
  window.history.replaceState({ usr: null, key: 'seed', idx: 4 }, '', '#/math-battle/play');
});

describe('useBackGuard', () => {
  it('arms a sentinel history entry on mount', () => {
    const before = window.history.length;
    renderHook(() => useBackGuard(vi.fn()));

    expect(window.history.state?.[GUARD_KEY]).toBe(true);
    expect(window.history.length).toBe(before + 1);
  });

  it('keeps the router state fields on the sentinel entry', () => {
    renderHook(() => useBackGuard(vi.fn()));

    expect(window.history.state.idx).toBe(4);
    expect(window.history.state.key).toBe('seed');
  });

  it('leaves the URL untouched so the router does not navigate', () => {
    renderHook(() => useBackGuard(vi.fn()));

    expect(window.location.hash).toBe('#/math-battle/play');
  });

  // StrictMode 在 dev 會 mount → unmount → mount,不擋的話會疊出兩個哨兵,
  // 小朋友就得滑兩次返回才叫得出確認框。
  it('does not stack a second sentinel when remounted on one', () => {
    const first = renderHook(() => useBackGuard(vi.fn()));
    const afterFirst = window.history.length;
    first.unmount();

    renderHook(() => useBackGuard(vi.fn()));

    expect(window.history.length).toBe(afterFirst);
  });

  it('notifies the caller when the user goes back', async () => {
    const onIntercept = vi.fn();
    renderHook(() => useBackGuard(onIntercept));

    window.history.back();

    await waitFor(() => expect(onIntercept).toHaveBeenCalledTimes(1));
  });

  it('re-arms the sentinel so a second back press is caught too', async () => {
    const onIntercept = vi.fn();
    renderHook(() => useBackGuard(onIntercept));

    window.history.back();
    await waitFor(() => expect(onIntercept).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(window.history.state?.[GUARD_KEY]).toBe(true));

    window.history.back();

    await waitFor(() => expect(onIntercept).toHaveBeenCalledTimes(2));
  });

  it('stops intercepting once unmounted', async () => {
    const onIntercept = vi.fn();
    const { unmount } = renderHook(() => useBackGuard(onIntercept));
    unmount();

    window.history.back();

    await new Promise(r => setTimeout(r, 50));
    expect(onIntercept).not.toHaveBeenCalled();
  });
});

describe('releaseBackGuard', () => {
  it('drops the sentinel so the next back press is not wasted', async () => {
    const { unmount } = renderHook(() => useBackGuard(vi.fn()));
    unmount();

    releaseBackGuard();

    await waitFor(() => expect(window.history.state?.[GUARD_KEY]).toBeFalsy());
    await waitFor(() => expect(window.history.state?.key).toBe('seed'));
  });

  // StrictMode 會讓 ResultScreen 的 effect 跑兩次;第二次必須不再退一步,
  // 不然會把小朋友從結算畫面直接彈回設定頁。
  // (jsdom 會把同一輪的兩次 history.back() 併成一次,看不出多退,所以直接數呼叫次數。)
  it('does not traverse a second time when called again', () => {
    const back = vi.spyOn(window.history, 'back');
    const { unmount } = renderHook(() => useBackGuard(vi.fn()));
    unmount();

    releaseBackGuard();
    releaseBackGuard();

    expect(back).toHaveBeenCalledTimes(1);
    back.mockRestore();
  });

  it('does not traverse when no sentinel is armed', () => {
    const back = vi.spyOn(window.history, 'back');

    releaseBackGuard();

    expect(back).not.toHaveBeenCalled();
    back.mockRestore();
  });
});
