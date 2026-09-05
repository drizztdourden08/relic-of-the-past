/* @layer shared-asset-extraction @kind data */
/**
 * The colour ramp the dialogue face is drawn with. Deliberately NOT ROM data: the font stores
 * two bitplanes and the engine paints it over whatever palette the text box has loaded, so
 * these four values reconstruct the on-screen look (white fill, blue edge, 0 transparent).
 * Lives on its own so the extraction that cuts characters to files and the editor that redraws
 * them live from a pack's font agree.
 */
import { TRANSPARENT } from '../../graphics/palette';
import type { RGBA } from '../../graphics/palette';

/** 0 = background (transparent), 1 = dark edge, 2 = mid highlight, 3 = fill. SNES 5-bit values expanded to 8-bit. */
const GLYPH_RAMP: readonly RGBA[] = [
  TRANSPARENT,
  [49, 49, 115, 255],
  [140, 156, 222, 255],
  [255, 255, 255, 255],
];

export { GLYPH_RAMP };
