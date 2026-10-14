/* @layer renderer-components @kind logic */
import type { Extent } from '@rotp/hud';
import type { ExtentMode } from './track-extents.type';

const extentFromNumber = (mode: ExtentMode, next: number | undefined): Extent | undefined => {
  if (next === undefined) return undefined;
  return mode === 'pct' ? { pct: next } : { px: next };
};

export { extentFromNumber };
