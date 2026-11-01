/* @layer website-site @kind constants */
const GRADIENT_RAMP = [
  'var(--px-ramp-0)',
  'var(--px-ramp-1)',
  'var(--px-ramp-2)',
  'var(--px-ramp-3)',
  'var(--px-ramp-4)',
] as const;

const GRADIENT_BAND_ROWS = [3, 3, 4, 4, 4] as const;
const GRADIENT_DITHER_ROWS = 2;
const GRADIENT_VIEW_WIDTH = 300;

export { GRADIENT_BAND_ROWS, GRADIENT_DITHER_ROWS, GRADIENT_RAMP, GRADIENT_VIEW_WIDTH };
