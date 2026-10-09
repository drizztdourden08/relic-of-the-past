/* @layer renderer-components @kind logic */
import { clamp01 } from './clamp01';
import { round2 } from './round2';

const atFromPointer = (clientX: number, rect: { left: number; width: number }): number =>
  clamp01(round2(rect.width > 0 ? (clientX - rect.left) / rect.width : 0));

export { atFromPointer };
