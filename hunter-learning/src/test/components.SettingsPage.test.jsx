import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

import SettingsPage from '../components/SettingsPage';
import { pokemonArtwork } from '../utils/pokemon';

const settings = [
  { label: '難度', options: [{ value: 'easy', text: '簡單', icon: '🌱', sub: '個位數' }], selected: 'easy', onChange: vi.fn() },
];

function renderSettingsPage(path) {
  return render(
    <MantineProvider>
      <MemoryRouter initialEntries={[path]}>
        <SettingsPage title="測試遊戲" icon="⚔️" settings={settings} onStart={vi.fn()} />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('SettingsPage hero', () => {
  it('renders the roster Pokemon artwork as the hero for a route in the roster', () => {
    const { container } = renderSettingsPage('/math-battle');
    const hero = container.querySelector('img');
    expect(hero).not.toBeNull();
    expect(hero.getAttribute('src')).toBe(pokemonArtwork(25));
    // Icon prop should NOT be shown as text when a roster hero renders.
    expect(screen.queryByText('⚔️')).not.toBeInTheDocument();
  });

  it('gives the hero image fixed dimensions and no lazy loading', () => {
    const { container } = renderSettingsPage('/math-battle');
    const hero = container.querySelector('img');
    expect(hero.getAttribute('width')).toBe('72');
    expect(hero.getAttribute('height')).toBe('72');
    expect(hero.getAttribute('loading')).not.toBe('lazy');
  });

  it('falls back to the icon prop for a route not in the roster', () => {
    const { container } = renderSettingsPage('/not-a-real-game');
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('⚔️')).toBeInTheDocument();
  });
});
