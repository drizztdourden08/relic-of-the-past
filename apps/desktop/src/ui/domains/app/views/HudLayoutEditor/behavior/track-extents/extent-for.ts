/* @layer renderer-components @kind logic */
import { numberOf } from './number-of';
import type { Extent } from '@shared/types/hud';
import type { ExtentMode } from './track-extents.type';

const extentFor = (mode: ExtentMode, from: Extent | undefined): Extent => {
  if (mode === 'auto') return 'auto';
  if (mode === 'fill') return 'fill';
  const n = numberOf(from);
  return mode === 'px' ? { px: n } : { pct: n };
};

export { extentFor };
