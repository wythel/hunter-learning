import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountdown, TIMED_SECONDS } from '../hooks/useCountdown';

const baseProps = { seconds: 10, enabled: true, paused: false, resetKey: 0, onExpire: () => {} };

describe('useCountdown', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('TIMED_SECONDS is 10', () => {
    expect(TIMED_SECONDS).toBe(10);
  });

  it('starts full and counts down', () => {
    const { result } = renderHook(() => useCountdown({ ...baseProps }));
    expect(result.current.fraction).toBe(1);
    expect(result.current.timeLeft).toBe(10);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.fraction).toBeCloseTo(0.5, 1);
    expect(result.current.timeLeft).toBe(5);
  });

  it('calls onExpire exactly once at zero', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown({ ...baseProps, onExpire }));
    act(() => { vi.advanceTimersByTime(11000); });
    expect(result.current.fraction).toBe(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
    act(() => { vi.advanceTimersByTime(5000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it('does nothing when enabled=false', () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() => useCountdown({ ...baseProps, enabled: false, onExpire }));
    act(() => { vi.advanceTimersByTime(20000); });
    expect(result.current.fraction).toBe(1);
    expect(onExpire).not.toHaveBeenCalled();
  });

  it('paused freezes the countdown, unpause resumes from where it stopped', () => {
    const { result, rerender } = renderHook(props => useCountdown(props), {
      initialProps: { ...baseProps },
    });
    act(() => { vi.advanceTimersByTime(3000); });
    expect(result.current.fraction).toBeCloseTo(0.7, 1);
    rerender({ ...baseProps, paused: true });
    act(() => { vi.advanceTimersByTime(5000); });
    expect(result.current.fraction).toBeCloseTo(0.7, 1);
    rerender({ ...baseProps, paused: false });
    act(() => { vi.advanceTimersByTime(2000); });
    expect(result.current.fraction).toBeCloseTo(0.5, 1);
  });

  it('resetKey change refills and re-arms onExpire', () => {
    const onExpire = vi.fn();
    const { result, rerender } = renderHook(props => useCountdown(props), {
      initialProps: { ...baseProps, onExpire },
    });
    act(() => { vi.advanceTimersByTime(11000); });
    expect(onExpire).toHaveBeenCalledTimes(1);
    rerender({ ...baseProps, onExpire, resetKey: 1 });
    expect(result.current.fraction).toBe(1);
    act(() => { vi.advanceTimersByTime(11000); });
    expect(onExpire).toHaveBeenCalledTimes(2);
  });
});
