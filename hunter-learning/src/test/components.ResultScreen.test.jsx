import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

vi.mock('../components/StarField', () => ({ default: () => null }));

vi.mock('framer-motion', async () => {
  const actual = await vi.importActual('framer-motion');
  return {
    ...actual,
    motion: new Proxy({}, {
      get: (_, tag) =>
        actual.motion[tag] ??
        (({ children, ...props }) => React.createElement(tag, props, children)),
    }),
  };
});

import ResultScreen from '../components/ResultScreen';

function renderWithMantine(ui) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const defaultProps = {
  title: '完美通關！',
  stars: 3,
  stats: [
    { icon: '✅', label: '答對', value: '8 題' },
    { icon: '❌', label: '答錯', value: '2 題' },
    { icon: '⏱️', label: '時間', value: '45 秒' },
  ],
  onRetry: vi.fn(),
  onMenu: vi.fn(),
  onLobby: vi.fn(),
};

describe('ResultScreen', () => {
  it('renders title', () => {
    renderWithMantine(<ResultScreen {...defaultProps} />);
    expect(screen.getByText('完美通關！')).toBeInTheDocument();
  });

  it('renders 3 star slots', () => {
    renderWithMantine(<ResultScreen {...defaultProps} stars={3} />);
    const stars = screen.getAllByText(/[⭐☆]/);
    expect(stars.length).toBeGreaterThanOrEqual(3);
  });

  it('renders filled stars for stars=3', () => {
    renderWithMantine(<ResultScreen {...defaultProps} stars={3} />);
    const filled = screen.getAllByText('⭐');
    expect(filled).toHaveLength(3);
  });

  // 未達成的星星以 grayscale 濾鏡顯示（仍是 ⭐ 字元）
  it('renders mixed stars for stars=2', () => {
    renderWithMantine(<ResultScreen {...defaultProps} stars={2} />);
    const stars = screen.getAllByText('⭐');
    expect(stars).toHaveLength(3);
    const dimmed = stars.filter(s => s.style.filter.includes('grayscale'));
    expect(dimmed).toHaveLength(1);
  });

  it('renders 0 filled stars for stars=0', () => {
    renderWithMantine(<ResultScreen {...defaultProps} stars={0} />);
    const stars = screen.getAllByText('⭐');
    expect(stars).toHaveLength(3);
    const dimmed = stars.filter(s => s.style.filter.includes('grayscale'));
    expect(dimmed).toHaveLength(3);
  });

  it('renders all stat labels', () => {
    renderWithMantine(<ResultScreen {...defaultProps} />);
    expect(screen.getByText('答對')).toBeInTheDocument();
    expect(screen.getByText('答錯')).toBeInTheDocument();
    expect(screen.getByText('時間')).toBeInTheDocument();
  });

  it('renders all stat values', () => {
    renderWithMantine(<ResultScreen {...defaultProps} />);
    expect(screen.getByText('8 題')).toBeInTheDocument();
    expect(screen.getByText('2 題')).toBeInTheDocument();
    expect(screen.getByText('45 秒')).toBeInTheDocument();
  });

  // 按鈕文字含 emoji 前綴（🔄 再玩一次 / ⚙️ 設定 / 🏠 大廳），用 regex 比對
  it('clicking retry calls onRetry', () => {
    const onRetry = vi.fn();
    renderWithMantine(<ResultScreen {...defaultProps} onRetry={onRetry} />);
    fireEvent.click(screen.getByText(/再玩一次/));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('clicking 設定 calls onMenu', () => {
    const onMenu = vi.fn();
    renderWithMantine(<ResultScreen {...defaultProps} onMenu={onMenu} />);
    fireEvent.click(screen.getByText(/設定/));
    expect(onMenu).toHaveBeenCalledOnce();
  });

  it('clicking 大廳 calls onLobby', () => {
    const onLobby = vi.fn();
    renderWithMantine(<ResultScreen {...defaultProps} onLobby={onLobby} />);
    fireEvent.click(screen.getByText(/大廳/));
    expect(onLobby).toHaveBeenCalledOnce();
  });

  // 訂正錯題按鈕:只有傳入 onReview 時才出現
  it('does not render 訂正錯題 button when onReview is not provided', () => {
    renderWithMantine(<ResultScreen {...defaultProps} />);
    expect(screen.queryByText(/訂正錯題/)).not.toBeInTheDocument();
  });

  it('renders 訂正錯題 button when onReview is provided', () => {
    renderWithMantine(<ResultScreen {...defaultProps} onReview={vi.fn()} />);
    expect(screen.getByText(/訂正錯題/)).toBeInTheDocument();
  });

  it('clicking 訂正錯題 calls onReview', () => {
    const onReview = vi.fn();
    renderWithMantine(<ResultScreen {...defaultProps} onReview={onReview} />);
    fireEvent.click(screen.getByText(/訂正錯題/));
    expect(onReview).toHaveBeenCalledOnce();
  });
});
