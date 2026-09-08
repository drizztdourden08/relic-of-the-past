/* @layer renderer-components @kind constants */

/* Open-folder glyph: load a state out of the slot. */
const LOAD_GLYPH = '📂';

/* Floppy-disk glyph: write the running game into the slot. */
const SAVE_GLYPH = '💾';

/* How long an armed action waits for its confirming click. */
const ARM_TIMEOUT_MS = 3000;

/* "No screenshot", drawn as two layers so the cancel ring can carry its own colour and sit
   clearly on top of the frame. Coordinates are chosen so the COMBINED ink of both layers is
   centred on the 16-unit grid: the frame alone sits left, the ring alone sits low-right. */
const NO_SCREENSHOT_FRAME_PATHS = [
  'M2.8 1.9h7A1.4 1.4 0 0 1 11.2 3.3v5A1.4 1.4 0 0 1 9.8 9.7H2.8A1.4 1.4 0 0 1 1.4 8.3V3.3A1.4 1.4 0 0 1 2.8 1.9Z',
  'M2 8.5l2.2-2.2 1.5 1.5 1.6-1.6 2.5 2.5',
];

/* The sun inside the frame. */
const NO_SCREENSHOT_FRAME_CIRCLES = [{ cx: 4.1, cy: 4.4, r: 0.85 }];

/* The cancel ring's slash; the ring itself is the circle below. */
const NO_SCREENSHOT_CANCEL_PATHS = ['M8.8 8.3l4.8 4.8'];

const NO_SCREENSHOT_CANCEL_CIRCLES = [{ cx: 11.2, cy: 10.7, r: 3.4 }];

export {
  LOAD_GLYPH, SAVE_GLYPH, ARM_TIMEOUT_MS,
  NO_SCREENSHOT_FRAME_PATHS, NO_SCREENSHOT_FRAME_CIRCLES,
  NO_SCREENSHOT_CANCEL_PATHS, NO_SCREENSHOT_CANCEL_CIRCLES,
};
