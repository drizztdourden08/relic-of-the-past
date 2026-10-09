/* @layer renderer-components @kind constants */
import type { Preset } from './presets.type';

const PAUSE_CODE = 'Wait';
const SPEED_CODE = 'Speed';

const PAUSE_PRESETS: readonly Preset[] = [
  { param: 0, label: '½ s' },
  { param: 3, label: '2 s' },
  { param: 7, label: '4 s' },
  { param: 15, label: '8 s' },
];

const SPEED_PRESETS: readonly Preset[] = [
  { param: 0, label: 'instant' },
  { param: 1, label: 'fast' },
  { param: 2, label: 'normal' },
  { param: 4, label: 'slow' },
];

export { PAUSE_CODE, PAUSE_PRESETS, SPEED_CODE, SPEED_PRESETS };
