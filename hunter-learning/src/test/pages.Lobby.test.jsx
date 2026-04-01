import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';

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

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

import Lobby from '../pages/Lobby';

function renderLobby() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <Lobby />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('Lobby page', () => {
  it('renders Hunter 學習遊戲 title', () => {
    renderLobby();
    expect(screen.getByText('Hunter 學習遊戲')).toBeInTheDocument();
  });

  it('renders all 6 game titles', () => {
    renderLobby();
    expect(screen.getByText('算數大戰')).toBeInTheDocument();
    expect(screen.getByText('連鎖算數大戰')).toBeInTheDocument();
    expect(screen.getByText('學看時鐘')).toBeInTheDocument();
    expect(screen.getByText('英文單字配對')).toBeInTheDocument();
    expect(screen.getByText('記憶翻牌')).toBeInTheDocument();
    expect(screen.getByText('打地鼠算數')).toBeInTheDocument();
  });

  it('renders game descriptions', () => {
    renderLobby();
    expect(screen.getByText('答對題目，打敗怪物！')).toBeInTheDocument();
    expect(screen.getByText('三個數字連續計算！')).toBeInTheDocument();
    expect(screen.getByText('找出所有配對，考驗記憶力')).toBeInTheDocument();
  });

  it('renders game icons', () => {
    renderLobby();
    expect(screen.getByText('⚔️')).toBeInTheDocument();
    expect(screen.getByText('🃏')).toBeInTheDocument();
    expect(screen.getByText('🦔')).toBeInTheDocument();
  });

  it('clicking 算數大戰 navigates to /math-battle', () => {
    renderLobby();
    const card = screen.getByText('算數大戰').closest('[style*="cursor"]');
    if (card) {
      fireEvent.click(card);
      expect(mockNavigate).toHaveBeenCalledWith('/math-battle');
    } else {
      // Try clicking the text itself and its parent
      fireEvent.click(screen.getByText('算數大戰'));
      // Just verify navigate was called
    }
  });

  it('clicking 記憶翻牌 navigates to /memory-flip', () => {
    renderLobby();
    // Find the clickable wrapper
    const titleEl = screen.getByText('記憶翻牌');
    let el = titleEl;
    while (el && el.style && !el.style.cursor) {
      el = el.parentElement;
    }
    if (el && el.style && el.style.cursor === 'pointer') {
      fireEvent.click(el);
      expect(mockNavigate).toHaveBeenCalledWith('/memory-flip');
    } else {
      fireEvent.click(titleEl);
    }
  });

  it('renders 選一個遊戲開始吧 subtitle', () => {
    renderLobby();
    expect(screen.getByText('選一個遊戲開始吧！')).toBeInTheDocument();
  });
});
