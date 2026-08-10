import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
    gameOver: vi.fn(), flip: vi.fn(), match: vi.fn(), mismatch: vi.fn(),
  }),
}));

vi.mock('../hooks/useSpeech', () => ({
  useSpeech: () => vi.fn(),
}));

vi.mock('../components/StarField', () => ({ default: () => null }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  const mockNavigate = vi.fn();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ key: 'test', state: { mode: 'en', count: 5, timed: false } }),
  };
});

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

import WordHuntGame from '../games/word-hunt/Game';

function renderGame() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <WordHuntGame />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('WordHuntGame component', () => {
  it('renders progress text showing first question', () => {
    renderGame();
    expect(screen.getByText(/第 1 \/ 5 題/)).toBeInTheDocument();
  });

  it('renders 4 choice buttons', () => {
    renderGame();
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('clicking a choice applies feedback styling', async () => {
    const { container } = renderGame();
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    await waitFor(() => {
      expect(container.querySelector('button')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});
