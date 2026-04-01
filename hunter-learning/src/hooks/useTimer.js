import { useState, useEffect, useRef } from 'react';

export function useTimer(initialSeconds, onExpire) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [running, setRunning]   = useState(false);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  useEffect(() => {
    if (!running) return;
    if (timeLeft <= 0) {
      onExpireRef.current?.();
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [running, timeLeft]);

  return {
    timeLeft,
    running,
    start: () => setRunning(true),
    stop:  () => setRunning(false),
    reset: (s) => {
      setRunning(false);
      setTimeLeft(s ?? initialSeconds);
    },
  };
}
