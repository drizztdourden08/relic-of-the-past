/* @layer renderer-components @kind constants */
import type { IconPath } from '@drizztdourden08/tessera/primitives';

// eslint-disable-next-line local/no-smart-punctuation
const LOAD_GLYPH = '📂';

// eslint-disable-next-line local/no-smart-punctuation
const SAVE_GLYPH = '💾';

const ARM_TIMEOUT_MS = 3000;

const NO_SCREENSHOT_FRAME: IconPath = {
  d: [
    'M2.8 1.9h7A1.4 1.4 0 0 1 11.2 3.3v5A1.4 1.4 0 0 1 9.8 9.7H2.8A1.4 1.4 0 0 1 1.4 8.3V3.3A1.4 1.4 0 0 1 2.8 1.9Z',
    'M2 8.5l2.2-2.2 1.5 1.5 1.6-1.6 2.5 2.5',
  ],
  circles: [{ cx: 4.1, cy: 4.4, r: 0.85 }],
};

const NO_SCREENSHOT_CANCEL: IconPath = {
  d: ['M8.8 8.3l4.8 4.8'],
  circles: [{ cx: 11.2, cy: 10.7, r: 3.4 }],
};

export {
  LOAD_GLYPH, SAVE_GLYPH, ARM_TIMEOUT_MS,
  NO_SCREENSHOT_CANCEL, NO_SCREENSHOT_FRAME,
};
