/* @layer shared-input @kind logic */
import { snapSide } from './snap-side';

const snapSpan = (center: number, half: number, length: number, size: number): number => {
  const side = snapSide(center, length, size);
  if (side === 'center') return length / 2;
  if (side === 'start') return Math.round((center - half) / size) * size + half;
  const gap = length - (center + half);
  return length - Math.round(gap / size) * size - half;
};

export { snapSpan };
