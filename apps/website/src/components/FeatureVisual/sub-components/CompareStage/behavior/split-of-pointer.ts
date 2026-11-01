/* @layer website-site @kind logic */
import type { PointerEvent } from 'react';

const splitOfPointer = (event: PointerEvent<HTMLElement>, axis: 'x' | 'y'): number => {
  const rect = event.currentTarget.getBoundingClientRect();
  const ratio = axis === 'x' ? (event.clientX - rect.left) / rect.width : (event.clientY - rect.top) / rect.height;
  return Math.min(Math.max(ratio * 100, 0), 100);
};

export { splitOfPointer };
