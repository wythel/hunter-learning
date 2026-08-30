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

describe('PolarDay page', () => {
  it('renders title, orbit view and the latitude slider', () => {
    renderPage();
    expect(screen.getByText('🌍 永晝永夜')).toBeInTheDocument();
    expect(screen.getByText('🌞 地球繞太陽轉一圈就是一年（點四季看看）')).toBeInTheDocument();
    expect(screen.getByText('🏠 你住在哪裡？')).toBeInTheDocument();
  });

  it('shows the three zoom-in views and both motion controls (revolve + spin)', () => {
    renderPage();
    expect(screen.getByText('🌍 放大看這顆地球：一半白天、一半晚上')).toBeInTheDocument();
    expect(screen.getByText('🧍 你抬頭看到的天空')).toBeInTheDocument();
    expect(screen.getByText('▶️ 讓地球繞太陽（過一年）')).toBeInTheDocument();
    expect(screen.getByText('⏸️ 停住這一天')).toBeInTheDocument();
  });

  it('opens on the polar-day case (north + summer) with a full 24h day', () => {
    renderPage();
    expect(screen.getByText('☀️ 永晝！太陽整天不下山')).toBeInTheDocument();
    expect(screen.getByText('☀️ 白天 24 小時')).toBeInTheDocument();
  });
});
