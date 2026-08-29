import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import Planet from '../games/solar-system/Planet';

describe('Planet', () => {
  it('renders a circular orb for the given planet key', () => {
    const { getByTestId } = render(<Planet planetKey="mars" size={80} />);
    const orb = getByTestId('planet-mars');
    expect(orb).toBeTruthy();
    expect(orb.style.width).toBe('80px');
    expect(orb.style.height).toBe('80px');
  });
  it('renders a ring for saturn', () => {
    const { getByTestId } = render(<Planet planetKey="saturn" />);
    expect(getByTestId('planet-saturn').querySelector('[data-ring]')).toBeTruthy();
  });
});
