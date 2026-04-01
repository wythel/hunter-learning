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

  it('renders mixed stars for stars=2', () => {
    renderWithMantine(<ResultScreen {...defaultProps} stars={2} />);
    const filled = screen.getAllByText('⭐');
    const empty = screen.getAllByText('☆');
    expect(filled).toHaveLength(2);
    expect(empty).toHaveLength(1);
  });

  it('renders 0 filled stars for stars=0', () => {
    renderWithMantine(<ResultScreen {...defaultProps} stars={0} />);
    const empty = screen.getAllByText('☆');
    expect(empty).toHaveLength(3);
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

  it('clicking retry calls onRetry', () => {
    const onRetry = vi.fn();
    renderWithMantine(<ResultScreen {...defaultProps} onRetry={onRetry} />);
    fireEvent.click(screen.getByText('再玩一次'));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it('clicking 設定 calls onMenu', () => {
    const onMenu = vi.fn();
    renderWithMantine(<ResultScreen {...defaultProps} onMenu={onMenu} />);
    fireEvent.click(screen.getByText('設定'));
    expect(onMenu).toHaveBeenCalledOnce();
  });

  it('clicking 大廳 calls onLobby', () => {
    const onLobby = vi.fn();
    renderWithMantine(<ResultScreen {...defaultProps} onLobby={onLobby} />);
    fireEvent.click(screen.getByText('大廳'));
    expect(onLobby).toHaveBeenCalledOnce();
  });
});
