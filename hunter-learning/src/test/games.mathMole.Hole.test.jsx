import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

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

import Hole from '../games/math-mole/Hole';

describe('Hole component', () => {
  it('shows number badge with correct num', () => {
    render(<Hole num={7} up={true} onHit={vi.fn()} flash={null} />);
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('shows 🦔 mole emoji', () => {
    render(<Hole num={5} up={true} onHit={vi.fn()} flash={null} />);
    expect(screen.getByText('🦔')).toBeInTheDocument();
  });

  it('cursor is pointer when up=true', () => {
    const { container } = render(<Hole num={5} up={true} onHit={vi.fn()} flash={null} />);
    // The motion.div that wraps mole content has cursor pointer when up
    const moleDiv = container.querySelector('[style*="pointer"]');
    expect(moleDiv).toBeInTheDocument();
  });

  it('cursor is default when up=false', () => {
    const { container } = render(<Hole num={5} up={false} onHit={vi.fn()} flash={null} />);
    const moleDiv = container.querySelector('[style*="default"]');
    expect(moleDiv).toBeInTheDocument();
  });

  it('onClick fires when up=true', () => {
    const onHit = vi.fn();
    render(<Hole num={5} up={true} onHit={onHit} flash={null} />);
    fireEvent.click(screen.getByText('🦔'));
    expect(onHit).toHaveBeenCalledOnce();
  });

  it('onClick does NOT fire when up=false (onClick is undefined on element)', () => {
    const onHit = vi.fn();
    const { container } = render(<Hole num={5} up={false} onHit={onHit} flash={null} />);
    // The motion.div has onClick={undefined} when up=false
    // Clicking the mole div should not call onHit
    const moleContent = container.querySelector('[style*="default"]');
    if (moleContent) {
      fireEvent.click(moleContent);
    }
    expect(onHit).not.toHaveBeenCalled();
  });

  it('flash=correct: brightness filter applied', () => {
    const { container } = render(<Hole num={5} up={true} onHit={vi.fn()} flash="correct" />);
    const brightEl = container.querySelector('[style*="brightness"]');
    expect(brightEl).toBeInTheDocument();
    expect(brightEl.style.filter).toContain('brightness');
  });

  it('flash=null: no special brightness filter', () => {
    const { container } = render(<Hole num={5} up={true} onHit={vi.fn()} flash={null} />);
    // When flash is null, filter is 'none'
    const els = container.querySelectorAll('[style]');
    let hasNoneFilter = false;
    els.forEach(el => {
      if (el.style.filter === 'none') hasNoneFilter = true;
    });
    expect(hasNoneFilter).toBe(true);
  });
});
