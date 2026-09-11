import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

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

import Buddy, { CaughtRow, CAUGHT_ROW_HEIGHT } from '../games/column-math/Buddy';
import { boardMinWidth } from '../games/column-math/layout';

const monster = { id: 25, name: '皮卡丘', img: 'https://example.test/25.png' };

describe('Buddy (column-math)', () => {
  it('顯示當前夥伴的圖與名字', () => {
    render(<Buddy monster={monster} />);
    expect(screen.getByAltText('皮卡丘')).toHaveAttribute('src', monster.img);
    expect(screen.getByText('皮卡丘')).toBeInTheDocument();
  });

  it('沒有夥伴時不渲染任何東西', () => {
    const { container } = render(<Buddy monster={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('整題填完時冒出「收服！」', () => {
    const { rerender } = render(<Buddy monster={monster} celebrating={false} />);
    expect(screen.queryByText(/收服/)).not.toBeInTheDocument();
    rerender(<Buddy monster={monster} celebrating />);
    expect(screen.getByText(/收服/)).toBeInTheDocument();
  });

  it('逾時那題的夥伴變灰、不冒收服', () => {
    render(<Buddy monster={monster} fainted />);
    const img = screen.getByAltText('皮卡丘');
    expect(img.style.filter).toContain('grayscale');
    expect(screen.queryByText(/收服/)).not.toBeInTheDocument();
  });
});

describe('CaughtRow (column-math)', () => {
  it('每一題一格,收服的顯示 sprite,其餘留空位', () => {
    const caught = [monster, { id: 1, name: '妙蛙種子', img: 'x' }];
    const { container } = render(<CaughtRow caught={caught} total={5} />);
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(container.firstChild.childElementCount).toBe(5);
  });

  it('收服的小圖用 96x96 經典 sprite,不是 artwork', () => {
    render(<CaughtRow caught={[monster]} total={3} />);
    const img = screen.getByAltText('皮卡丘');
    expect(img.getAttribute('src')).toContain('/pokemon/25.png');
    expect(img.getAttribute('src')).not.toContain('official-artwork');
  });

  it('高度固定,收服再多也不會把鍵盤擠出畫面', () => {
    const mon = i => ({ id: i + 1, name: `p${i}`, img: 'x' });
    const { container: empty } = render(<CaughtRow caught={[]} total={20} />);
    const { container: full } = render(
      <CaughtRow caught={Array.from({ length: 20 }, (_, i) => mon(i))} total={20} />
    );
    expect(empty.firstChild.style.height).toBe(`${CAUGHT_ROW_HEIGHT}px`);
    expect(full.firstChild.style.height).toBe(`${CAUGHT_ROW_HEIGHT}px`);
    expect(CAUGHT_ROW_HEIGHT).toBeLessThanOrEqual(26);
  });
});

// 夥伴站在直式板旁邊,板寬一變夥伴就會左右跳,所以板寬要固定在「這一局最寬的可能」
describe('boardMinWidth (column-math)', () => {
  it('加法預留進位多出來的那一欄', () => {
    expect(boardMinWidth(2, 'add')).toBe(boardMinWidth(3, 'sub'));
    expect(boardMinWidth(3, 'add')).toBeGreaterThan(boardMinWidth(3, 'sub'));
  });

  it('減法答案不會變長,不必預留', () => {
    expect(boardMinWidth(3, 'sub')).toBe(boardMinWidth(2, 'sub') + 48);
  });

  it('混合模式跟加法一樣寬,切換運算時板子不會抖', () => {
    expect(boardMinWidth(3, 'mix')).toBe(boardMinWidth(3, 'add'));
  });

  it('最寬的一局(三位數加法)+ 夥伴仍塞得進 375px 手機', () => {
    const BOARD_CHROME = 26 * 2 + 1.5 * 2; // padding + border
    const buddy = Math.min(72, 375 * 0.17);
    expect(boardMinWidth(3, 'add') + BOARD_CHROME + buddy + 8 + 6 * 2).toBeLessThanOrEqual(375);
  });
});
