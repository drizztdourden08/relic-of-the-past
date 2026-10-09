/* @layer renderer-components @kind constants */
import type { ExtentMode } from './track-extents.type';

const EXTENT_MODES: readonly { mode: ExtentMode; label: string; suffix: string }[] = [
  { mode: 'auto', label: 'auto (as big as what is in it)', suffix: 'auto' },
  { mode: 'fill', label: 'fill (the rest of the main axis)', suffix: 'fill' },
  { mode: 'px', label: 'px (game pixels)', suffix: 'px' },
  { mode: 'pct', label: '% (of the parent)', suffix: '%' },
];

export { EXTENT_MODES };
