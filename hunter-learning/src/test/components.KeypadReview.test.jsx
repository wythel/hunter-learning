import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';

vi.mock('../components/StarField', () => ({ default: () => null }));

vi.mock('../hooks/useSound', () => ({
  useSound: () => ({
    correct: vi.fn(), wrong: vi.fn(), click: vi.fn(), victory: vi.fn(),
  }),
}));

vi.mock('../utils/math', async () => {
  const actual = await vi.importActual('../utils/math');
  return { ...actual, delay: () => Promise.resolve() };
});

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

import KeypadReview from '../components/KeypadReview';

const items = [
  { text: '1 + 2', answer: 3 },
  { text: '4 + 1', answer: 5 },
];

function renderReview(props = {}) {
  return render(
    <MantineProvider>
      <KeypadReview items={items} onExit={props.onExit || vi.fn()} />
    </MantineProvider>
  );
}

// 按下鍵盤數字鍵(用其顯示文字定位),避免與題目/顯示區的數字混淆
function pressDigit(d) {
  const buttons = screen.getAllByRole('button').filter(b => b.textContent === d);
  fireEvent.click(buttons[0]);
}

describe('KeypadReview', () => {
  it('renders the first question and progress', () => {
    renderReview();
    expect(screen.getByText(/1 \+ 2/)).toBeInTheDocument();
    expect(screen.getByText('第 1 / 2 題')).toBeInTheDocument();
  });

  it('wrong answer does not advance', async () => {
    renderReview();
    pressDigit('9');
    fireEvent.click(screen.getByText('確定'));
    await waitFor(() => {
      expect(screen.getByText('第 1 / 2 題')).toBeInTheDocument();
    });
    expect(screen.getByText(/1 \+ 2/)).toBeInTheDocument();
  });

  it('correct answer advances to the next question', async () => {
    renderReview();
    pressDigit('3');
    fireEvent.click(screen.getByText('確定'));
    await waitFor(() => {
      expect(screen.getByText('第 2 / 2 題')).toBeInTheDocument();
      expect(screen.getByText(/4 \+ 1/)).toBeInTheDocument();
    });
  });

  it('finishing all questions shows done screen and 返回 calls onExit', async () => {
    const onExit = vi.fn();
    renderReview({ onExit });
    pressDigit('3');
    fireEvent.click(screen.getByText('確定'));
    await waitFor(() => expect(screen.getByText(/4 \+ 1/)).toBeInTheDocument());
    pressDigit('5');
    fireEvent.click(screen.getByText('確定'));
    await waitFor(() => expect(screen.getByText(/全部訂正完成/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/返回結算/));
    expect(onExit).toHaveBeenCalledOnce();
  });
});
