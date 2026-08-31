import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../components/StarField', () => ({ default: () => null }));

// WebGL 場景在 jsdom 跑不動——smoke test 只驗 HTML 層
vi.mock('../games/polar-day/Scene3D', () => ({
  default: () => <div data-testid="scene3d" />,
}));

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

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
};

import PolarDay from '../games/polar-day/PolarDay';
import { nearestSeasonKey } from '../games/polar-day/geometry';

describe('nearestSeasonKey', () => {
  it('picks the nearest season for an orbit angle', () => {
    expect(nearestSeasonKey(90)).toBe('summer');
    expect(nearestSeasonKey(270)).toBe('winter');
    expect(nearestSeasonKey(5)).toBe('spring');
    expect(nearestSeasonKey(185)).toBe('autumn');
  });
});

function renderPage() {
  return render(
    <MantineProvider>
      <MemoryRouter>
        <PolarDay />
      </MemoryRouter>
    </MantineProvider>
  );
}

describe('PolarDay page (3D)', () => {
  it('renders title, the 3D scene and the latitude slider', () => {
    renderPage();
    expect(screen.getByText('永晝永夜')).toBeInTheDocument();
    expect(screen.getByTestId('scene3d')).toBeInTheDocument();
    expect(screen.getByText('🏠 你住在哪裡？')).toBeInTheDocument();
  });

  it('has camera mode toggle and both motion controls (revolve + spin)', () => {
    renderPage();
    expect(screen.getByText('🌌 太空總覽')).toBeInTheDocument();
    expect(screen.getByText('🌗 一半一半')).toBeInTheDocument();
    expect(screen.getByText('🌍 靠近地球')).toBeInTheDocument();
    expect(screen.getByText('▶️ 繞太陽（過一年）')).toBeInTheDocument();
    expect(screen.getByText('⏸️ 停住這一天')).toBeInTheDocument();
  });

  it('shows the sky view and opens on polar day (north + summer, 24h day)', () => {
    renderPage();
    expect(screen.getByText('🧍 你抬頭看到的天空')).toBeInTheDocument();
    expect(screen.getByText('☀️ 永晝！太陽整天不下山')).toBeInTheDocument();
    expect(screen.getByText('☀️ 白天 24 小時')).toBeInTheDocument();
  });

  it('has a time-of-day scrubber with dawn/dusk marks', () => {
    renderPage();
    expect(screen.getByText('🌅')).toBeInTheDocument();
    expect(screen.getByText('🌇')).toBeInTheDocument();
  });

  it('terrain follows both latitude and season (arctic: summer tundra → winter snowman)', () => {
    renderPage();
    expect(screen.getByText('🦌')).toBeInTheDocument();   // 北極圈 + 夏天：凍原
    fireEvent.click(screen.getByText('❄️ 冬'));
    expect(screen.getByText('⛄')).toBeInTheDocument();    // 北極圈 + 冬天：雪地
    expect(screen.queryByText('🦌')).not.toBeInTheDocument();
  });
});
