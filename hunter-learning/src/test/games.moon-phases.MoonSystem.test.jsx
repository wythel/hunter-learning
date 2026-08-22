import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import MoonSystem from '../games/moon-phases/MoonSystem';

describe('MoonSystem', () => {
  it('renders svg with the phase name label for full moon (angle 180)', () => {
    const { container, getByText } = render(
      <MoonSystem angle={180} onAngleChange={null} difficulty="easy" showLabel />
    );
    expect(container.querySelector('svg')).toBeTruthy();
    expect(getByText('滿月')).toBeTruthy();
  });

  it('shows 新月 at angle 0', () => {
    const { getByText } = render(
      <MoonSystem angle={0} onAngleChange={null} difficulty="easy" showLabel />
    );
    expect(getByText('新月')).toBeTruthy();
  });

  it('hides label when showLabel is false', () => {
    const { queryByText } = render(
      <MoonSystem angle={180} onAngleChange={null} difficulty="easy" showLabel={false} />
    );
    expect(queryByText('滿月')).toBeNull();
  });
});
