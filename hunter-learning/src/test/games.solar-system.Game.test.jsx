import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import SolarSystemGame from '../games/solar-system/Game';

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
