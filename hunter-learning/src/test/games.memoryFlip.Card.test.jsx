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

import FlipCard from '../games/memory-flip/Card';

describe('FlipCard', () => {
  it('shows 🎴 (back face) when not flipped', () => {
    render(<FlipCard text="cat" flipped={false} matched={false} mismatch={false} onClick={vi.fn()} />);
    expect(screen.getByText('🎴')).toBeInTheDocument();
  });

  it('shows text on front face', () => {
    render(<FlipCard text="cat" flipped={true} matched={false} mismatch={false} onClick={vi.fn()} />);
    expect(screen.getByText('cat')).toBeInTheDocument();
  });

  it('when matched=true: front border has teal color', () => {
    const { container } = render(
      <FlipCard text="cat" flipped={true} matched={true} mismatch={false} onClick={vi.fn()} />
    );
    // jsdom normalizes #12b886 → rgb(18, 184, 134)
    const hasTeal = [...container.querySelectorAll('[style]')].some(el =>
      el.style.border?.includes('12b886') || el.style.border?.includes('rgb(18, 184, 134)')
    );
    expect(hasTeal).toBe(true);
  });

  it('when mismatch=true: front border has red color', () => {
    const { container } = render(
      <FlipCard text="cat" flipped={true} matched={false} mismatch={true} onClick={vi.fn()} />
    );
    const hasRed = [...container.querySelectorAll('[style]')].some(el =>
      el.style.border?.includes('f85149') || el.style.border?.includes('rgb(248, 81, 73)')
    );
    expect(hasRed).toBe(true);
  });

  it('cursor is pointer when not matched', () => {
    const { container } = render(
      <FlipCard text="cat" flipped={false} matched={false} mismatch={false} onClick={vi.fn()} />
    );
    const wrapper = container.firstChild;
    expect(wrapper.style.cursor).toBe('pointer');
  });

  it('cursor is default when matched', () => {
    const { container } = render(
      <FlipCard text="cat" flipped={true} matched={true} mismatch={false} onClick={vi.fn()} />
    );
    const wrapper = container.firstChild;
    expect(wrapper.style.cursor).toBe('default');
  });

  it('onClick fires when clicked', () => {
    const onClick = vi.fn();
    const { container } = render(
      <FlipCard text="cat" flipped={false} matched={false} mismatch={false} onClick={onClick} />
    );
    fireEvent.click(container.firstChild);
    expect(onClick).toHaveBeenCalledOnce();
  });
});
