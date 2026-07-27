import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TimeBar from '../components/TimeBar';

describe('TimeBar', () => {
  it('fill width matches fraction', () => {
    const { container } = render(<TimeBar fraction={0.5} />);
    const fill = container.firstChild.firstChild;
    expect(fill.style.width).toBe('50%');
  });

  it('teal gradient and no pulse when plenty of time left', () => {
    const { container } = render(<TimeBar fraction={0.8} />);
    const fill = container.firstChild.firstChild;
    expect(fill.style.background).toContain('linear-gradient');
    expect(fill.style.animation).toBe('none');
  });

  it('red + pulsing when fraction <= 0.3', () => {
    const { container } = render(<TimeBar fraction={0.2} />);
    const fill = container.firstChild.firstChild;
    expect(fill.style.background.replace(/\s/g, '')).toMatch(/(#f85149|rgb\(248,81,73\))/i);
    expect(fill.style.animation).toContain('timebar-pulse');
  });

  it('clamps fraction below 0 to 0%', () => {
    const { container } = render(<TimeBar fraction={-0.2} />);
    const fill = container.firstChild.firstChild;
    expect(fill.style.width).toBe('0%');
  });
});
