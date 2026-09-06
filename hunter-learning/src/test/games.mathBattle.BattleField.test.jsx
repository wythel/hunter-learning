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
import { EVOLUTION_STAGES, PLAYER } from '../games/math-battle/sprites';

const ALL_MONSTERS = EVOLUTION_STAGES.flat();

function renderWithMantine(ui) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const monster = ALL_MONSTERS[0];

function renderField(overrides = {}) {
  return renderWithMantine(
    <BattleField
      monsterImg={monster.img}
      monsterName={monster.name}
      playerImg={PLAYER.img}
      playerHP={3}
      monsterFlash={false}
      playerFlash={false}
      playerAttacking={false}
      monsterAttacking={false}
      {...overrides}
    />
  );
}

describe('sprites', () => {
  it('every monster has a name and a PokeAPI artwork URL', () => {
    expect(ALL_MONSTERS.length).toBeGreaterThan(0);
    for (const m of ALL_MONSTERS) {
      expect(m.name).toBeTruthy();
      expect(m.img).toMatch(/^https:\/\/raw\.githubusercontent\.com\/PokeAPI\/sprites\/.+\/\d+\.png$/);
    }
  });

  it('player is 皮卡丘 with a PokeAPI artwork URL', () => {
    expect(PLAYER.name).toBe('皮卡丘');
    expect(PLAYER.img).toMatch(/\/25\.png$/);
  });
});

describe('BattleField', () => {
  it('renders monster name', () => {
    renderField();
    expect(screen.getByText(monster.name)).toBeInTheDocument();
  });

  it('renders 3 heart emojis for HP=3', () => {
    renderField();
    const hearts = screen.getAllByText('❤️');
    expect(hearts).toHaveLength(3);
  });

  // 失去的愛心以 grayscale 濾鏡顯示（仍是 ❤️ 字元）
  it('renders 1 filled + 2 dimmed hearts for HP=1', () => {
    renderField({ playerHP: 1 });
    const hearts = screen.getAllByText('❤️');
    expect(hearts).toHaveLength(3);
    const dimmed = hearts.filter(h => h.style.filter.includes('grayscale'));
    expect(dimmed).toHaveLength(2);
  });

  it('renders player Pokemon image facing right', () => {
    renderField();
    const img = screen.getByAltText(PLAYER.name);
    expect(img).toHaveAttribute('src', PLAYER.img);
    expect(img.style.transform).toContain('scaleX(-1)');
  });

  it('renders monster Pokemon image', () => {
    renderField();
    const img = screen.getByAltText(monster.name);
    expect(img).toHaveAttribute('src', monster.img);
  });
});
