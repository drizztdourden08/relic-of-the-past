/* @layer renderer-components @kind logic */
import type { LabelSide, OverlayFrame } from '../PadOverlay.type';

const columnsFit = (frame: OverlayFrame, sides: ReadonlyMap<string, LabelSide>): boolean => {
  const capacity = Math.floor((frame.bottom - frame.top) / frame.minLineH) + 1;
  const counts = { left: 0, right: 0 };
  sides.forEach((side) => { counts[side] += 1; });
  return counts.left <= capacity && counts.right <= capacity;
};

export { columnsFit };
