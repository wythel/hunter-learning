import { useState, useCallback } from 'react';

// 訂正佇列狀態機。給一組錯題 items,逐題呈現;呼叫 advance() 前進到下一題,
// 佇列走完時 finished 變 true。答對才 advance,答錯留在同一題(由呼叫端決定)。
// items 在整個訂正過程中是固定的(呼叫端在結算後才進訂正,不再變動)。
export function useReviewQueue(items) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(items.length === 0);

  const advance = useCallback(() => {
    setIndex(i => {
      const next = i + 1;
      if (next >= items.length) {
        setFinished(true);
        return i;
      }
      return next;
    });
  }, [items.length]);

  const current = finished ? null : items[index];

  return {
    current,
    index,
    total: items.length,
    finished,
    advance,
  };
}
