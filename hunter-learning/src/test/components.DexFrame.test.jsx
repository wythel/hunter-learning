import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DexFrame from '../components/DexFrame';

describe('DexFrame', () => {
  it('renders its children inside the screen', () => {
    render(<DexFrame><p>畫面內容</p></DexFrame>);
    expect(screen.getByText('畫面內容')).toBeInTheDocument();
  });

  it('renders the dexNo when given', () => {
    render(<DexFrame dexNo="No.015"><p>x</p></DexFrame>);
    expect(screen.getByText('No.015')).toBeInTheDocument();
  });

  it('omits the dexNo slot when not given', () => {
    render(<DexFrame><p>x</p></DexFrame>);
    expect(screen.queryByText(/^No\./)).not.toBeInTheDocument();
  });

  it('renders the lens and three LEDs', () => {
    const { container } = render(<DexFrame><p>x</p></DexFrame>);
    expect(container.querySelector('[data-dex="lens"]')).toBeTruthy();
    expect(container.querySelectorAll('[data-dex="led"]')).toHaveLength(3);
  });
});
