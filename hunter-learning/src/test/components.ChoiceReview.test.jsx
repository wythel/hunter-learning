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

// delay 立即 resolve,讓答對後的前進不用等
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

import ChoiceReview from '../components/ChoiceReview';

const items = [
  { prompt: 'Q1', choices: [{ key: 'a', label: 'A', correct: false }, { key: 'b', label: 'B', correct: true }] },
  { prompt: 'Q2', choices: [{ key: 'c', label: 'C', correct: true }, { key: 'd', label: 'D', correct: false }] },
];

function renderReview(props = {}) {
  return render(
    <MantineProvider>
      <ChoiceReview
        items={items}
        renderPrompt={(item) => <div>{item.prompt}</div>}
        getChoices={(item) => item.choices}
        onExit={props.onExit || vi.fn()}
      />
    </MantineProvider>
  );
}

describe('ChoiceReview', () => {
  it('renders the first item and progress', () => {
    renderReview();
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('第 1 / 2 題')).toBeInTheDocument();
  });

  it('wrong choice does not advance (stays on same question)', () => {
    renderReview();
    fireEvent.click(screen.getByText('A')); // A is wrong for Q1
    expect(screen.getByText('Q1')).toBeInTheDocument();
    expect(screen.getByText('第 1 / 2 題')).toBeInTheDocument();
  });

  it('correct choice advances to the next question', async () => {
    renderReview();
    fireEvent.click(screen.getByText('B')); // B is correct for Q1
    await waitFor(() => {
      expect(screen.getByText('Q2')).toBeInTheDocument();
      expect(screen.getByText('第 2 / 2 題')).toBeInTheDocument();
    });
  });

  it('clearing every question shows the done screen and 返回 calls onExit', async () => {
    const onExit = vi.fn();
    renderReview({ onExit });
    fireEvent.click(screen.getByText('B')); // Q1 correct
    await waitFor(() => expect(screen.getByText('C')).toBeInTheDocument());
    fireEvent.click(screen.getByText('C')); // Q2 correct
    await waitFor(() => expect(screen.getByText(/全部訂正完成/)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/返回結算/));
    expect(onExit).toHaveBeenCalledOnce();
  });
});
