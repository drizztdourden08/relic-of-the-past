/* @layer shared-asset-extraction @kind data */
/**
 * The colour ramp the dialogue face is drawn with.
 *
 * Deliberately NOT ROM data. The font stores two bitplanes and nothing else —
 * the engine paints it over whichever background palette the current text box
 * happens to have loaded — so these four values are a reconstruction of the
 * on-screen look: a white fill with a blue edge, value 0 left transparent so a
 * character composites over anything.
 *
 * It lives on its own because two very different consumers have to agree on it:
 * the extraction that cuts the picture characters out to files, and the editor
 * that redraws those same characters live from a language pack's own font. A
 * character drawn in one place and cut in the other must look identical, and one
 * table is the only way to promise that.
 */
import { TRANSPARENT } from '../../graphics/palette';
import type { RGBA } from '../../graphics/palette';

/**
 * 0 = background (transparent), 1 = dark edge, 2 = mid highlight, 3 = fill.
 * Components are SNES 5-bit values expanded to 8-bit, so they sit in the same
 * range as a real palette entry.
 */
const GLYPH_RAMP: readonly RGBA[] = [
  TRANSPARENT,
  [49, 49, 115, 255],
  [140, 156, 222, 255],
  [255, 255, 255, 255],
];

export { GLYPH_RAMP };
