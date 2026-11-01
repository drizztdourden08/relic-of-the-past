/* @layer renderer-widgets @kind hook */
import { useMemo, useRef } from 'react';
import type { MusicDebugCounter } from '@rotp/msu';

const useStableOrder = (counters: MusicDebugCounter[]): MusicDebugCounter[] => {
  const seen = useRef(new Map<string, number>());

  return useMemo(() => {
    const order = seen.current;
    if (counters.length === 0) order.clear();
    [...counters].reverse().forEach((row) => {
      if (!order.has(row.key)) order.set(row.key, order.size);
    });
    return [...counters].sort((a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0));
  }, [counters]);
};

export { useStableOrder };
