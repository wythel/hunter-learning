import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import SolarSystemGame, { dropHitsRect } from '../games/solar-system/Game';

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({ correct: vi.fn(), wrong: vi.fn(), victory: vi.fn(), click: vi.fn(), ready: vi.fn(), teaching: vi.fn() }),
}));
vi.mock('../hooks/useSpeech', () => ({ useSpeech: () => vi.fn() }));

function renderGame() {
  return render(
    <MantineProvider>
      <MemoryRouter initialEntries={[{ pathname: '/solar-system/play', state: { difficulty: 'easy', count: 6 } }]}>
        <SolarSystemGame />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('SolarSystemGame', () => {
  it('starts in explore mode with a start button', () => {
    const { getByText } = renderGame();
    expect(getByText('準備好了，開始挑戰！')).toBeTruthy();
  });
  it('shows the identify question after starting', () => {
    const { getByText } = renderGame();
    fireEvent.click(getByText('準備好了，開始挑戰！'));
    expect(getByText('這是哪一顆行星？')).toBeTruthy();
  });
});

describe('dropHitsRect', () => {
  const rect = { left: 100, right: 140, top: 100, bottom: 140 };
  it('hits when the page point maps inside the rect (no scroll)', () => {
    expect(dropHitsRect({ x: 120, y: 120 }, rect, { x: 0, y: 0 })).toBe(true);
  });
  it('still hits after the page is scrolled (page point shifted by scrollY)', () => {
    expect(dropHitsRect({ x: 120, y: 320 }, rect, { x: 0, y: 200 })).toBe(true);
  });
  it('misses when scroll offset is not compensated', () => {
    expect(dropHitsRect({ x: 120, y: 120 }, rect, { x: 0, y: 200 })).toBe(false);
  });
});
