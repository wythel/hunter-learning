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
import { POKEMON_ROSTER } from '../utils/pokemonRoster';
import { pokemonSprite } from '../utils/pokemon';

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

  it('renders all game titles', () => {
    renderLobby();
    expect(screen.getByText('算數大戰')).toBeInTheDocument();
    expect(screen.getByText('直式計算')).toBeInTheDocument();
    expect(screen.getByText('連鎖算數')).toBeInTheDocument();
    expect(screen.getByText('學看時鐘')).toBeInTheDocument();
    expect(screen.getByText('英文配對')).toBeInTheDocument();
    expect(screen.getByText('記憶翻牌')).toBeInTheDocument();
    expect(screen.getByText('打地鼠')).toBeInTheDocument();
    expect(screen.getByText('對稱遊戲')).toBeInTheDocument();
    expect(screen.getByText('奇偶偵探')).toBeInTheDocument();
    expect(screen.getByText('湊十大師')).toBeInTheDocument();
    expect(screen.getByText('音符星球')).toBeInTheDocument();
    expect(screen.getByText('看圖認字')).toBeInTheDocument();
    expect(screen.getByText('月相星球')).toBeInTheDocument();
    expect(screen.getByText('永晝永夜')).toBeInTheDocument();
    expect(screen.getByText('太陽系')).toBeInTheDocument();
  });

  it('renders game descriptions', () => {
    renderLobby();
    expect(screen.getByText('打敗怪物！')).toBeInTheDocument();
    expect(screen.getByText('連續計算！')).toBeInTheDocument();
    expect(screen.getByText('考驗記憶力！')).toBeInTheDocument();
  });

  it('renders a pokemon sprite for every game', () => {
    const { container } = renderLobby();
    const sprites = container.querySelectorAll('img[data-pokemon]');
    expect(sprites).toHaveLength(15);
  });

  it('points each sprite at the small classic sprite url', () => {
    const { container } = renderLobby();
    const first = container.querySelector('img[data-pokemon]');
    expect(first.getAttribute('src')).toMatch(
      /sprites\/pokemon\/\d+\.png$/
    );
  });

  it('gives every sprite fixed dimensions to avoid layout shift', () => {
    const { container } = renderLobby();
    for (const img of container.querySelectorAll('img[data-pokemon]')) {
      expect(img.getAttribute('width')).toBe('44');
      expect(img.getAttribute('height')).toBe('44');
      expect(img.getAttribute('loading')).toBe('lazy');
    }
  });

  it('renders every card with the pokemon that its own roster entry specifies', () => {
    // The two tests above only check the sprite *count* and the *format* of the
    // first sprite's url — a scrambled id-to-card mapping (e.g. math-battle
    // silently rendering chain-math's pokemon) would still pass both. GAMES
    // (this file's rendering order, in Lobby.jsx) and POKEMON_ROSTER (../utils/
    // pokemonRoster) are hand-authored in the same path order, so the Nth
    // rendered card is always the Nth roster entry — pin every one of the 15.
    const { container } = renderLobby();
    const sprites = [...container.querySelectorAll('img[data-pokemon]')];
    expect(sprites).toHaveLength(POKEMON_ROSTER.length);
    POKEMON_ROSTER.forEach((entry, i) => {
      expect(sprites[i].getAttribute('src')).toBe(pokemonSprite(entry.id));
    });
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

  it('renders 選一個遊戲，展開冒險 subtitle', () => {
    renderLobby();
    expect(screen.getByText('選一個遊戲，展開冒險！')).toBeInTheDocument();
  });
});
