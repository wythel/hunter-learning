import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DexStrip from '../components/DexStrip';

describe('DexStrip', () => {
  it('calls onBack when the back control is clicked', () => {
    const onBack = vi.fn();
    render(<DexStrip onBack={onBack} />);
    fireEvent.click(screen.getByRole('button', { name: '返回' }));
    expect(onBack).toHaveBeenCalledTimes(1);
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
