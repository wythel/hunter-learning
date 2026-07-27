import { useState, useEffect, useRef } from 'react';

export const TIMED_SECONDS = 10;

// Countdown for timed mode. Deadline-based with a 100ms tick so the bar is
// smooth and immune to interval drift. Fires onExpire exactly once per
// resetKey cycle.
export function useCountdown({ seconds, enabled, paused = false, resetKey, onExpire }) {
  const totalMs = seconds * 1000;
  const [remainingMs, setRemainingMs] = useState(totalMs);
  const remainingRef  = useRef(totalMs);
  const firedRef      = useRef(false);
  const onExpireRef   = useRef(onExpire);
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  // New answer unit → refill and re-arm
  useEffect(() => {
    firedRef.current = false;
    remainingRef.current = totalMs;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setRemainingMs(totalMs);
  }, [resetKey, totalMs]);

  // Tick while enabled and not paused
  useEffect(() => {
    if (!enabled || paused || firedRef.current) return;
    const startedAt = Date.now();
    const base = remainingRef.current;
    const id = setInterval(() => {
      const left = base - (Date.now() - startedAt);
      if (left <= 0) {
        remainingRef.current = 0;
        setRemainingMs(0);
        clearInterval(id);
        if (!firedRef.current) {
          firedRef.current = true;
          onExpireRef.current?.();
        }
      } else {
        remainingRef.current = left;
        setRemainingMs(left);
      }
    }, 100);
    return () => clearInterval(id);
  }, [enabled, paused, resetKey, totalMs]);

  return {
    fraction: totalMs > 0 ? remainingMs / totalMs : 0,
    timeLeft: Math.ceil(remainingMs / 1000),
  };
}
