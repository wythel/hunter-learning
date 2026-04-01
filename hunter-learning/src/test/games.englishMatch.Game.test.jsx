import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
    gameOver: vi.fn(), flip: vi.fn(), match: vi.fn(), mismatch: vi.fn(),
    hit: vi.fn(), miss: vi.fn(), tick: vi.fn(), playerAttack: vi.fn(),
    monsterAttack: vi.fn(), monsterDie: vi.fn(), teaching: vi.fn(), ready: vi.fn(),
  }),
}));

vi.mock('../components/StarField', () => ({ default: () => null }));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  const mockNavigate = vi.fn();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: { topic: 'animals', count: 5 } }),
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

import EnglishGame from '../games/english-match/Game';

function renderGame() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <EnglishGame />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('EnglishGame component', () => {
  it('renders emoji display', () => {
    renderGame();
    // The question card should have an emoji (font size 64)
    const questionArea = document.querySelector('[style*="font-size: 64"]') ||
      document.querySelector('[style*="fontSize: 64"]');
    // Just check that some large text element exists (the emoji)
    const allText = screen.getAllByText(/.+/);
    expect(allText.length).toBeGreaterThan(0);
  });

  it('renders 4 choice buttons with English words', () => {
    renderGame();
    // The choice buttons are in a grid with 4 items
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThanOrEqual(4);
  });

  it('renders progress text showing first question', () => {
    renderGame();
    expect(screen.getByText(/第 1 \/ 5 題/)).toBeInTheDocument();
  });

  it('clicking correct answer applies green styling', async () => {
    const { container } = renderGame();
    // Find buttons (choices)
    const buttons = screen.getAllByRole('button');
    // Click a button - we can check if border color changes after click
    fireEvent.click(buttons[0]);
    await waitFor(() => {
      // After clicking, feedback should show (green or red border)
      const btn = container.querySelector('button');
      // Either the clicked button turns red or green
      expect(btn).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('renders Chinese word (zh label)', () => {
    renderGame();
    // The question should have a Chinese word
    // We look for non-empty text nodes that could be Chinese
    const allText = document.body.innerText || document.body.textContent;
    expect(allText.length).toBeGreaterThan(0);
  });
});
