import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DexStrip from '../components/DexStrip';

describe('DexStrip', () => {
  // 遊戲進行中離開就是整局重來,所以 ← 和手機的返回手勢都要先問一聲
  it('asks before leaving when the back control is clicked', () => {
    const onBack = vi.fn();
    render(<DexStrip onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(screen.getByText('要離開遊戲嗎？')).toBeInTheDocument();
    expect(onBack).not.toHaveBeenCalled();
  });

  it('leaves once the confirmation is accepted', () => {
    const onBack = vi.fn();
    render(<DexStrip onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    fireEvent.click(screen.getByRole('button', { name: '離開' }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it('stays in the game when the confirmation is dismissed', () => {
    const onBack = vi.fn();
    render(<DexStrip onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    fireEvent.click(screen.getByRole('button', { name: '繼續遊戲' }));
    expect(screen.queryByText('要離開遊戲嗎？')).not.toBeInTheDocument();
    expect(onBack).not.toHaveBeenCalled();
  });

  it('shows no confirmation until something asks to leave', () => {
    render(<DexStrip onBack={vi.fn()} />);
    expect(screen.queryByText('要離開遊戲嗎？')).not.toBeInTheDocument();
  });

  // 這是這次要修的 bug:手機誤觸返回手勢,整局進度直接沒了
  it('asks instead of leaving when the device back gesture fires', async () => {
    const onBack = vi.fn();
    render(<DexStrip onBack={onBack} />);

    window.history.back();

    await waitFor(() => expect(screen.getByText('要離開遊戲嗎？')).toBeInTheDocument());
    expect(onBack).not.toHaveBeenCalled();
  });

  it('renders progress when given', () => {
    render(<DexStrip onBack={vi.fn()} progress="3 / 10" />);
    expect(screen.getByText('3 / 10')).toBeInTheDocument();
  });

  it('renders the right slot when given', () => {
    render(<DexStrip onBack={vi.fn()} right={<span>計時</span>} />);
    expect(screen.getByText('計時')).toBeInTheDocument();
  });

  it('renders the lens and three LEDs', () => {
    const { container } = render(<DexStrip onBack={vi.fn()} />);
    expect(container.querySelector('[data-dex="lens"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-dex="led"]')).toHaveLength(3);
  });

  // 空的 progress/right 不得撐高頂條 —— 遊戲畫面是 100dvh,每一 px 都算
  it('keeps a fixed height with no progress and no right slot', () => {
    const { container } = render(<DexStrip onBack={vi.fn()} />);
    expect(container.firstChild.style.height).toBe('26px');
  });

  // 高度必須與內容無關 —— 遊戲畫面是 100dvh/overflow:hidden,頂條長高就會把遊戲擠出畫面
  it('keeps the same fixed height when progress and right are both populated', () => {
    const { container } = render(
      <DexStrip onBack={vi.fn()} progress="3 / 10" right={<span>計時</span>} />
    );
    expect(container.firstChild.style.height).toBe('26px');
  });
});
