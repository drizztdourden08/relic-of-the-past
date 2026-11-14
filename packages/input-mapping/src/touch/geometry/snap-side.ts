/* @layer shared-input @kind logic */
import type { SnapSide } from './snap-guides.type';

const snapSide = (center: number, length: number, size: number): SnapSide => {
  const middle = length / 2;
  if (Math.abs(center - middle) <= size / 2) return 'center';
  return center < middle ? 'start' : 'end';
};

export { snapSide };
