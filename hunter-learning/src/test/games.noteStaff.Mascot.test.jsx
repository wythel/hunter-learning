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

import Mascot from '../games/note-staff/Mascot';
import { JIGGLYPUFF } from '../games/note-staff/sprites';

describe('note-staff Mascot (胖丁)', () => {
  it('uses the PokeAPI official artwork for Jigglypuff (#39)', () => {
    expect(JIGGLYPUFF.name).toBe('胖丁');
    expect(JIGGLYPUFF.img).toContain('official-artwork/39.png');
  });

  it('renders the sprite with no bubble while waiting for an answer', () => {
    render(<Mascot feedback={null} solfege="Do" />);
    expect(screen.getByAltText('胖丁')).toHaveAttribute('src', JIGGLYPUFF.img);
    expect(screen.queryByText(/♪/)).toBeNull();
  });

  it('sings the solfège name when the answer is correct', () => {
    render(<Mascot feedback="correct" solfege="Sol" />);
    expect(screen.getByText('♪ Sol')).toBeInTheDocument();
  });

  it('tells the right answer when the answer is wrong', () => {
    render(<Mascot feedback="wrong" solfege="Fa" />);
    expect(screen.getByText('是 Fa')).toBeInTheDocument();
  });

  it('disappears instead of showing a broken image when the sprite fails to load', () => {
    render(<Mascot feedback={null} solfege="Do" />);
    fireEvent.error(screen.getByAltText('胖丁'));
    expect(screen.queryByAltText('胖丁')).toBeNull();
  });
});
