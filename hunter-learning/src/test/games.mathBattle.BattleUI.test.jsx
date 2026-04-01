import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import BattleUI from '../games/math-battle/BattleUI';

function renderWithMantine(ui) {
  return render(<MantineProvider>{ui}</MantineProvider>);
}

describe('BattleUI', () => {
  it('renders question text', () => {
    renderWithMantine(
      <BattleUI question="3 + 4" answer="" progress="第 1 / 10 題" onKey={vi.fn()} locked={false} />
    );
    expect(screen.getByText(/3 \+ 4/)).toBeInTheDocument();
  });

  it('shows _ when answer is empty', () => {
    renderWithMantine(
      <BattleUI question="3 + 4" answer="" progress="第 1 / 10 題" onKey={vi.fn()} locked={false} />
    );
    expect(screen.getByText(/=\s*_/)).toBeInTheDocument();
  });

  it('shows answer when not empty', () => {
    renderWithMantine(
      <BattleUI question="3 + 4" answer="7" progress="第 1 / 10 題" onKey={vi.fn()} locked={false} />
    );
    expect(screen.getByText(/=\s*7/)).toBeInTheDocument();
  });

  it('renders all digit buttons 0-9', () => {
    renderWithMantine(
      <BattleUI question="3 + 4" answer="" progress="第 1 / 10 題" onKey={vi.fn()} locked={false} />
    );
    for (let d = 0; d <= 9; d++) {
      expect(screen.getByText(String(d))).toBeInTheDocument();
    }
  });

  it('renders ⌫ button', () => {
    renderWithMantine(
      <BattleUI question="3 + 4" answer="" progress="第 1 / 10 題" onKey={vi.fn()} locked={false} />
    );
    expect(screen.getByText('⌫')).toBeInTheDocument();
  });

  it('renders 確定 button', () => {
    renderWithMantine(
      <BattleUI question="3 + 4" answer="" progress="第 1 / 10 題" onKey={vi.fn()} locked={false} />
    );
    expect(screen.getByText('確定')).toBeInTheDocument();
  });

  it('clicking digit calls onKey with correct value', () => {
    const onKey = vi.fn();
    renderWithMantine(
      <BattleUI question="3 + 4" answer="" progress="第 1 / 10 題" onKey={onKey} locked={false} />
    );
    fireEvent.click(screen.getByText('7'));
    expect(onKey).toHaveBeenCalledWith('7');
  });

  it('clicking ⌫ calls onKey("back")', () => {
    const onKey = vi.fn();
    renderWithMantine(
      <BattleUI question="3 + 4" answer="7" progress="第 1 / 10 題" onKey={onKey} locked={false} />
    );
    fireEvent.click(screen.getByText('⌫'));
    expect(onKey).toHaveBeenCalledWith('back');
  });

  it('clicking 確定 calls onKey("ok")', () => {
    const onKey = vi.fn();
    renderWithMantine(
      <BattleUI question="3 + 4" answer="7" progress="第 1 / 10 題" onKey={onKey} locked={false} />
    );
    fireEvent.click(screen.getByText('確定'));
    expect(onKey).toHaveBeenCalledWith('ok');
  });

  it('when locked=true, buttons are disabled', () => {
    renderWithMantine(
      <BattleUI question="3 + 4" answer="" progress="第 1 / 10 題" onKey={vi.fn()} locked={true} />
    );
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => {
      expect(btn).toBeDisabled();
    });
  });

  it('renders progress text', () => {
    renderWithMantine(
      <BattleUI question="3 + 4" answer="" progress="第 3 / 10 題" onKey={vi.fn()} locked={false} />
    );
    expect(screen.getByText('第 3 / 10 題')).toBeInTheDocument();
  });
});
