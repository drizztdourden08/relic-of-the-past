/* @layer renderer-components @kind logic */
import { EXTENT_MODES } from './track-extents.constants';
import type { ExtentMode } from './track-extents.type';

const modeSuffixOf = (mode: ExtentMode): string =>
  EXTENT_MODES.find((entry) => entry.mode === mode)?.suffix ?? 'px';

export { modeSuffixOf };
