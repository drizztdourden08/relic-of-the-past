/* @layer shared-game @kind data */
/**
 * Rupees in colours the game never drew: purple, silver and gold, recoloured
 * from the plain green receipt gem (`receipt-rupee-1`, the numberless hold-up
 * art) by the `palette-swap` extractor, so they share its shape, shading and
 * #292929 outline with the green (1), blue (5) and red (20) ones beside them.
 *
 * Each pair is the one the core's coloured-gem swap paints the same denomination
 * with (rupee_gem_draw.c), read out of the resident sprite palette rows: the
 * violet pair of row 4, the grey pair of row 1, and the gold pair of row 4, the
 * magic jar's own gold. So the gem in the tracker is pixel for pixel the gem on
 * the floor and in the hand. Light over dark: green 2.20, purple 1.84, silver
 * 2.24, gold 2.15 luminance ratio.
 */
import type { SpriteDefinition } from './manifest';

const GREEN_LIGHT = '#9cd673';
const GREEN_DARK = '#4a9431';

const recolor = (file: string, label: string, light: string, dark: string): SpriteDefinition => ({
  file,
  label,
  category: 'receipt',
  extract: {
    method: 'palette-swap',
    baseFile: 'receipt-rupee-1',
    colors: [{ from: GREEN_LIGHT, to: light }, { from: GREEN_DARK, to: dark }],
  },
});

const RUPEE_SPRITE_DEFINITIONS: readonly SpriteDefinition[] = [
  recolor('receipt-rupee-purple', 'Rupee (purple)', '#b594ff', '#5273ce'),
  recolor('receipt-rupee-silver', 'Rupee (silver)', '#bdbdce', '#7b7b8c'),
  recolor('receipt-rupee-gold', 'Rupee (gold)', '#ffd639', '#bd8c21'),
];

export { RUPEE_SPRITE_DEFINITIONS };
