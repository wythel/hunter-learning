import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

// Mock all game/page components to avoid complex renders
vi.mock('../pages/Lobby', () => ({
  default: () => <div data-testid="lobby">Lobby</div>,
}));
vi.mock('../games/math-battle/Settings', () => ({
  default: () => <div data-testid="math-battle-settings">MathBattleSettings</div>,
}));
vi.mock('../games/math-battle/Game', () => ({
  default: () => <div data-testid="math-battle-game">MathBattleGame</div>,
}));
vi.mock('../games/chain-math/Settings', () => ({
  default: () => <div data-testid="chain-math-settings">ChainMathSettings</div>,
}));
vi.mock('../games/chain-math/Game', () => ({
  default: () => <div data-testid="chain-math-game">ChainMathGame</div>,
}));
vi.mock('../games/clock-reading/Settings', () => ({
  default: () => <div data-testid="clock-settings">ClockSettings</div>,
}));
vi.mock('../games/clock-reading/Game', () => ({
  default: () => <div data-testid="clock-game">ClockGame</div>,
}));
vi.mock('../games/english-match/Settings', () => ({
  default: () => <div data-testid="english-settings">EnglishSettings</div>,
}));
vi.mock('../games/english-match/Game', () => ({
  default: () => <div data-testid="english-game">EnglishGame</div>,
}));
vi.mock('../games/memory-flip/Settings', () => ({
  default: () => <div data-testid="memory-settings">MemorySettings</div>,
}));
vi.mock('../games/memory-flip/Game', () => ({
  default: () => <div data-testid="memory-game">MemoryGame</div>,
}));
vi.mock('../games/math-mole/Settings', () => ({
  default: () => <div data-testid="mole-settings">MoleSettings</div>,
}));
vi.mock('../games/math-mole/Game', () => ({
  default: () => <div data-testid="mole-game">MoleGame</div>,
}));

import App from '../App';

describe('App routing', () => {
  it('renders Lobby at default hash route /', () => {
    render(
      <MantineProvider>
        <App />
      </MantineProvider>
    );
    expect(screen.getByTestId('lobby')).toBeInTheDocument();
  });

  it('uses HashRouter (App renders without BrowserRouter wrapping)', () => {
    // App wraps itself in HashRouter - render should succeed without additional router
    expect(() =>
      render(
        <MantineProvider>
          <App />
        </MantineProvider>
      )
    ).not.toThrow();
  });

  it('App renders the Lobby component at root', () => {
    const { container } = render(
      <MantineProvider>
        <App />
      </MantineProvider>
    );
    expect(container.querySelector('[data-testid="lobby"]')).toBeInTheDocument();
  });
});
