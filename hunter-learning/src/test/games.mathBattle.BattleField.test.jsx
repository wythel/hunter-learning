import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

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

import BattleField from '../games/math-battle/BattleField';
import { MONSTERS, PLAYER_SVG } from '../games/math-battle/sprites';

function renderWithMantine(ui) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const monster = MONSTERS[0];

describe('BattleField', () => {
  it('renders monster name', () => {
    renderWithMantine(
      <BattleField
        monsterSvg={monster.svg}
        monsterName={monster.name}
        playerSvg={PLAYER_SVG}
        playerHP={3}
        monsterFlash={false}
        playerFlash={false}
        playerAttacking={false}
        monsterAttacking={false}
      />
    );
    expect(screen.getByText(monster.name)).toBeInTheDocument();
  });

  it('renders 3 heart emojis for HP=3', () => {
    renderWithMantine(
      <BattleField
        monsterSvg={monster.svg}
        monsterName={monster.name}
        playerSvg={PLAYER_SVG}
        playerHP={3}
        monsterFlash={false}
        playerFlash={false}
        playerAttacking={false}
        monsterAttacking={false}
      />
    );
    const hearts = screen.getAllByText('❤️');
    expect(hearts).toHaveLength(3);
  });

  it('renders 1 filled + 2 dark hearts for HP=1', () => {
    renderWithMantine(
      <BattleField
        monsterSvg={monster.svg}
        monsterName={monster.name}
        playerSvg={PLAYER_SVG}
        playerHP={1}
        monsterFlash={false}
        playerFlash={false}
        playerAttacking={false}
        monsterAttacking={false}
      />
    );
    const redHearts = screen.getAllByText('❤️');
    const darkHearts = screen.getAllByText('🖤');
    expect(redHearts).toHaveLength(1);
    expect(darkHearts).toHaveLength(2);
  });

  it('renders player SVG via dangerouslySetInnerHTML', () => {
    const { container } = renderWithMantine(
      <BattleField
        monsterSvg={monster.svg}
        monsterName={monster.name}
        playerSvg={PLAYER_SVG}
        playerHP={3}
        monsterFlash={false}
        playerFlash={false}
        playerAttacking={false}
        monsterAttacking={false}
      />
    );
    // PLAYER_SVG contains an SVG element
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(1);
  });

  it('renders monster SVG via dangerouslySetInnerHTML', () => {
    const { container } = renderWithMantine(
      <BattleField
        monsterSvg={monster.svg}
        monsterName={monster.name}
        playerSvg={PLAYER_SVG}
        playerHP={3}
        monsterFlash={false}
        playerFlash={false}
        playerAttacking={false}
        monsterAttacking={false}
      />
    );
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });
});
