import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import OptionGroup from '../components/OptionGroup';

function renderWithMantine(ui) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

const options = [
  { value: 'easy', text: '簡單', icon: '🌱', sub: '個位數' },
  { value: 'hard', text: '困難', icon: '🔥', sub: '兩位數' },
];

describe('OptionGroup', () => {
  it('renders label', () => {
    renderWithMantine(
      <OptionGroup label="難度" options={options} selected="easy" onChange={vi.fn()} />
    );
    expect(screen.getByText('難度')).toBeInTheDocument();
  });

  it('renders all option texts', () => {
    renderWithMantine(
      <OptionGroup label="難度" options={options} selected="easy" onChange={vi.fn()} />
    );
    expect(screen.getByText('簡單')).toBeInTheDocument();
    expect(screen.getByText('困難')).toBeInTheDocument();
  });

  it('renders icons', () => {
    renderWithMantine(
      <OptionGroup label="難度" options={options} selected="easy" onChange={vi.fn()} />
    );
    expect(screen.getByText('🌱')).toBeInTheDocument();
    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('renders sub texts', () => {
    renderWithMantine(
      <OptionGroup label="難度" options={options} selected="easy" onChange={vi.fn()} />
    );
    expect(screen.getByText('個位數')).toBeInTheDocument();
    expect(screen.getByText('兩位數')).toBeInTheDocument();
  });

  it('clicking an option calls onChange with correct value', () => {
    const onChange = vi.fn();
    renderWithMantine(
      <OptionGroup label="難度" options={options} selected="easy" onChange={onChange} />
    );
    fireEvent.click(screen.getByText('困難'));
    expect(onChange).toHaveBeenCalledWith('hard');
  });

  it('highlights the selected option with the dex gold border', () => {
    renderWithMantine(
      <OptionGroup label="難度" options={options} selected="easy" onChange={vi.fn()} />
    );
    const easyBtn = screen.getByText('簡單').closest('button');
    expect(easyBtn.style.border).toMatch(/rgba?\(255, 212, 0/);
  });

  it('does not highlight unselected options', () => {
    renderWithMantine(
      <OptionGroup label="難度" options={options} selected="easy" onChange={vi.fn()} />
    );
    const hardBtn = screen.getByText('困難').closest('button');
    expect(hardBtn.style.border).not.toMatch(/rgba?\(255, 212, 0/);
  });

  it('works without icon and sub', () => {
    const simpleOptions = [
      { value: 'a', text: 'Option A' },
      { value: 'b', text: 'Option B' },
    ];
    renderWithMantine(
      <OptionGroup label="Test" options={simpleOptions} selected="a" onChange={vi.fn()} />
    );
    expect(screen.getByText('Option A')).toBeInTheDocument();
    expect(screen.getByText('Option B')).toBeInTheDocument();
  });
});
