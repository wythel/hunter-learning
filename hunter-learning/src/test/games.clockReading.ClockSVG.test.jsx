import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ClockSVG from '../games/clock-reading/ClockSVG';

describe('ClockSVG', () => {
  it('renders SVG element', () => {
    const { container } = render(<ClockSVG hour={3} minute={0} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('renders 12 hour number labels (1-12)', () => {
    render(<ClockSVG hour={3} minute={0} />);
    for (let n = 1; n <= 12; n++) {
      expect(screen.getByText(String(n))).toBeInTheDocument();
    }
  });

  it('renders hour hand (line element)', () => {
    const { container } = render(<ClockSVG hour={3} minute={0} />);
    const lines = container.querySelectorAll('line');
    // There should be hour hand and minute hand among lines
    expect(lines.length).toBeGreaterThanOrEqual(2);
  });

  it('renders minute hand (line element with teal stroke)', () => {
    const { container } = render(<ClockSVG hour={3} minute={0} />);
    const tealLine = container.querySelector('line[stroke="#12b886"]');
    expect(tealLine).toBeInTheDocument();
  });

  it('onClick handler fires when SVG is clicked (if onClick prop provided)', () => {
    const onClick = vi.fn();
    const { container } = render(<ClockSVG hour={3} minute={0} onClick={onClick} />);
    const svg = container.querySelector('svg');
    // Simulate click with clientX, clientY
    Object.defineProperty(svg, 'getBoundingClientRect', {
      value: () => ({ left: 0, top: 0, width: 220, height: 220 }),
    });
    fireEvent.click(svg, { clientX: 50, clientY: 50 });
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('no onClick attribute when onClick prop not provided', () => {
    const { container } = render(<ClockSVG hour={3} minute={0} />);
    const svg = container.querySelector('svg');
    // When onClick is undefined, the SVG should not have an onClick handler
    // cursor should be 'default'
    expect(svg.style.cursor).toBe('default');
  });

  it('cursor is pointer when onClick provided', () => {
    const { container } = render(<ClockSVG hour={3} minute={0} onClick={vi.fn()} />);
    const svg = container.querySelector('svg');
    expect(svg.style.cursor).toBe('pointer');
  });
});
