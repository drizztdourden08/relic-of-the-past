/* @layer website-site @kind constants */
const CELL = 3;
const GEM_SIZE = CELL * 16;
const GEM_CENTER = GEM_SIZE / 2;

const GEM_LAYERS = [
  { radius: 7, shift: 0, fill: 'var(--px-gold-dark)' },
  { radius: 6, shift: 0, fill: 'var(--px-gold)' },
  { radius: 4, shift: -CELL, fill: 'var(--px-gold-bright)' },
  { radius: 4, shift: 0, fill: 'var(--px-gold-dark)' },
  { radius: 3, shift: 0, fill: 'var(--px-gold)' },
  { radius: 1, shift: -CELL, fill: 'var(--px-gold-bright)' },
] as const;

export { CELL, GEM_CENTER, GEM_LAYERS, GEM_SIZE };
