/* @layer renderer-components @kind logic */
import type { Extent } from '@shared/types/hud';
import type { ExtentMode } from './track-extents.type';

const modeOf = (value: Extent | undefined): ExtentMode => {
  if (value === undefined || value === 'auto') return 'auto';
  if (value === 'fill') return 'fill';
  return 'pct' in value ? 'pct' : 'px';
};

export { modeOf };
